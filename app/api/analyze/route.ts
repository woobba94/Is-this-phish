import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkRateLimit, getRealIP } from '@/utils/rateLimit'
import { applyStaticRules, getPhishingScore } from '@/utils/staticRules'
import { AnalyzeRequest, AnalysisResult, PhishingHighlight, PhishingScore } from '@/utils/types'
import { getCachedResult, setCachedResult, isValidUrl } from '@/utils/urlCache'
import { API_CONFIG, OPENAI_FUNCTION_DEFINITION } from '@/utils/constants'
import { getHigherRiskScore } from '@/utils/scoreUtils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // IP 기반 rate limiting
    const ip = getRealIP(request)
    const rateLimitInfo = checkRateLimit(ip)
    
    if (!rateLimitInfo.allowed) {
      // 개발 환경 여부에 따라 다른 메시지 표시
      const isDev = process.env.NODE_ENV === 'development' || 
                   process.env.ALLOW_DEV_MODE === 'true'
      const errorMessage = isDev 
        ? `Development environment daily request limit (${API_CONFIG.RATE_LIMIT.DEVELOPMENT} requests) exceeded. Please try again in 24 hours.`
        : `Daily request limit (${API_CONFIG.RATE_LIMIT.DEFAULT} requests) exceeded. Please try again in 24 hours.`
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
            'X-Environment': process.env.NODE_ENV || 'unknown',
          }
        }
      )
    }

    const body: AnalyzeRequest = await request.json()
    
    // 입력 검증
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid input provided.' },
        { status: 400 }
      )
    }

    if (body.content.length > API_CONFIG.MAX_CONTENT_SIZE) {
      return NextResponse.json(
        { success: false, error: `Input size exceeds ${API_CONFIG.MAX_CONTENT_SIZE / 1024}KB limit.` },
        { status: 400 }
      )
    }

    // URL인 경우 캐시 확인
    const isUrl = body.type === 'url' && isValidUrl(body.content)
    if (isUrl) {
      try {
        const cachedResult = await getCachedResult(body.content)
        if (cachedResult) {
          return NextResponse.json(
            { success: true, result: cachedResult, cached: true },
            {
              headers: {
                'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
                'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
                'X-Cache': 'HIT',
                'X-Cache-Source': 'supabase'
              }
            }
          )
        }
      } catch (error) {
        console.error('Cache check failed:', error)
        // 캐시 실패 시 계속 진행 (AI 분석으로)
      }
    }

    // 정적 규칙 적용
    const staticHighlights = applyStaticRules(body.content)

    // OpenAI function call (영문으로 호출하여 토큰 절약)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `You are a phishing email/URL analyzer. Analyze based on these criteria:

1. Suspicious domains, links, attachments
2. Urgency manipulation language patterns  
3. Personal/financial information requests
4. Sender spoofing attempts
5. Grammar/spelling errors
6. Social engineering techniques

Scoring:
- Critical: Confirmed phishing
- High: Likely phishing  
- Medium: Some risk factors
- Low: Minor concerns
- Safe: Legitimate content`
        },
        {
          role: 'user',
          content: `Analyze this ${body.type === 'email' ? 'email' : 'URL'}:\n\n${body.content}`
        }
      ],
      functions: [OPENAI_FUNCTION_DEFINITION],
      function_call: { name: 'analyze_phishing' }
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall || !functionCall.arguments) {
      return NextResponse.json(
        { success: false, error: 'An error occurred during AI analysis.' },
        { status: 500 }
      )
    }

    const aiResult = JSON.parse(functionCall.arguments)
    
    // 정적 규칙과 AI 결과 병합
    const allHighlights: PhishingHighlight[] = [
      ...staticHighlights,
      ...aiResult.highlights
    ]
    
    // 중복 제거
    const uniqueHighlights = allHighlights.filter((highlight, index, array) => 
      array.findIndex(h => h.text === highlight.text) === index
    )

    // 최종 점수 계산 (정적 규칙과 AI 결과 중 더 높은 위험도 선택)
    const staticScore = getPhishingScore(staticHighlights)
    const finalScore = getHigherRiskScore(staticScore, aiResult.score as PhishingScore)

    const result: AnalysisResult = {
      score: finalScore,
      highlights: uniqueHighlights,
      summary: aiResult.summary + (staticHighlights.length > 0 ? 
        `\n\nStatic rules detected ${staticHighlights.length} additional risk factors.` : '')
    }

    // URL인 경우 결과를 캐시에 저장
    if (isUrl) {
      try {
        await setCachedResult(body.content, result)
      } catch (error) {
        console.error('Cache storage failed:', error)
        // 캐시 저장 실패는 무시하고 계속 진행
      }
    }

    return NextResponse.json(
      { success: true, result, cached: false },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
          'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
          'X-Cache': 'MISS',
          'X-Cache-Source': isUrl ? 'ai-analysis' : 'email-analysis'
        }
      }
    )

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'A server error occurred.' },
      { status: 500 }
    )
  }
} 