import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkRateLimit, getRealIP } from '@/utils/rateLimit'
import { applyStaticRules, getPhishingScore } from '@/utils/staticRules'
import { AnalyzeRequest, AnalysisResult, PhishingHighlight, PhishingScore, PhishingScoreEn } from '@/utils/types'
import { getCachedResult, setCachedResult, isValidUrl } from '@/utils/urlCache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MAX_CONTENT_SIZE = 20 * 1024 // 20KB

// 영문 점수를 한글로 매핑
const SCORE_MAPPING: Record<PhishingScoreEn, PhishingScore> = {
  'SAFE': '안전',
  'LOW': '낮음', 
  'MEDIUM': '보통',
  'HIGH': '위험',
  'CRITICAL': '매우위험'
}

// 한글 점수를 영문으로 매핑 (정적 규칙용)
const SCORE_MAPPING_REVERSE: Record<PhishingScore, PhishingScoreEn> = {
  '안전': 'SAFE',
  '낮음': 'LOW',
  '보통': 'MEDIUM', 
  '위험': 'HIGH',
  '매우위험': 'CRITICAL'
}

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
        ? '개발 환경 일일 요청 한도(50회)를 초과했습니다. 24시간 후 다시 시도해주세요.'
        : '일일 요청 한도(10회)를 초과했습니다. 24시간 후 다시 시도해주세요.'
      
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
        { success: false, error: '유효하지 않은 입력입니다.' },
        { status: 400 }
      )
    }

    if (body.content.length > MAX_CONTENT_SIZE) {
      return NextResponse.json(
        { success: false, error: '입력 크기가 20KB를 초과했습니다.' },
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
- CRITICAL: Confirmed phishing
- HIGH: Likely phishing  
- MEDIUM: Some risk factors
- LOW: Minor concerns
- SAFE: Legitimate content`
        },
        {
          role: 'user',
          content: `Analyze this ${body.type === 'email' ? 'email' : 'URL'}:\n\n${body.content}`
        }
      ],
      functions: [
        {
          name: 'analyze_phishing',
          description: 'Return phishing analysis results',
          parameters: {
            type: 'object',
            properties: {
              score: {
                type: 'string',
                enum: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                description: 'Phishing risk score'
              },
              highlights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: {
                      type: 'string',
                      description: 'Suspicious text'
                    },
                    reason: {
                      type: 'string',
                      description: 'Why suspicious'
                    }
                  },
                  required: ['text', 'reason']
                },
                description: 'List of suspicious elements'
              },
              summary: {
                type: 'string',
                description: 'Analysis summary'
              }
            },
            required: ['score', 'highlights', 'summary']
          }
        }
      ],
      function_call: { name: 'analyze_phishing' }
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall || !functionCall.arguments) {
      return NextResponse.json(
        { success: false, error: 'AI 분석 중 오류가 발생했습니다.' },
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
    const staticScoreEn = SCORE_MAPPING_REVERSE[staticScore]
    const scoreOrderEn: PhishingScoreEn[] = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    const aiScoreLevel = scoreOrderEn.indexOf(aiResult.score as PhishingScoreEn)
    const staticScoreLevel = scoreOrderEn.indexOf(staticScoreEn)
    const finalScoreEn = scoreOrderEn[Math.max(aiScoreLevel, staticScoreLevel)]
    const finalScore = SCORE_MAPPING[finalScoreEn]

    const result: AnalysisResult = {
      score: finalScore,
      highlights: uniqueHighlights,
      summary: aiResult.summary + (staticHighlights.length > 0 ? 
        `\n\n정적 규칙에서 ${staticHighlights.length}개의 추가 위험 요소를 발견했습니다.` : '')
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
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 