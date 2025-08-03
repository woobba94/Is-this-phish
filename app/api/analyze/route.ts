import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { checkRateLimit, getRealIP } from '@/utils/rateLimit'
import { applyStaticRules, getPhishingScore } from '@/utils/staticRules'
import { AnalyzeRequest, AnalysisResult, PhishingHighlight } from '@/utils/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const MAX_CONTENT_SIZE = 20 * 1024 // 20KB

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // IP 기반 rate limiting
    const ip = getRealIP(request)
    const rateLimitInfo = checkRateLimit(ip)
    
    if (!rateLimitInfo.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: '일일 요청 한도를 초과했습니다. 24시간 후 다시 시도해주세요.' 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
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

    // 정적 규칙 적용
    const staticHighlights = applyStaticRules(body.content)

    // OpenAI function call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `당신은 피싱 이메일/URL 분석 전문가입니다. 다음 기준으로 분석하세요:

1. 의심스러운 도메인, 링크, 첨부파일
2. 긴급성을 조작하는 언어 패턴
3. 개인정보나 금융정보 요구
4. 발신자 위장 시도
5. 맞춤법, 문법 오류
6. 사회공학적 기법 사용

점수 기준:
- A: 매우 위험 (확실한 피싱)
- B: 위험 (피싱 가능성 높음)
- C: 주의 (의심스러운 요소 있음)
- D: 보통 (약간의 위험 요소)
- E: 낮음 (경미한 주의사항)
- F: 안전 (정상적인 이메일/URL)`
        },
        {
          role: 'user',
          content: `다음 ${body.type === 'email' ? '이메일' : 'URL'}을 분석해주세요:\n\n${body.content}`
        }
      ],
      functions: [
        {
          name: 'analyze_phishing',
          description: '피싱 분석 결과를 반환합니다',
          parameters: {
            type: 'object',
            properties: {
              score: {
                type: 'string',
                enum: ['A', 'B', 'C', 'D', 'E', 'F'],
                description: '피싱 위험도 점수'
              },
              highlights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: {
                      type: 'string',
                      description: '의심스러운 텍스트'
                    },
                    reason: {
                      type: 'string',
                      description: '의심스러운 이유'
                    }
                  },
                  required: ['text', 'reason']
                },
                description: '의심스러운 구간 목록'
              },
              summary: {
                type: 'string',
                description: '분석 요약'
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
    const finalScore = [aiResult.score, staticScore].sort()[0] // 알파벳 순으로 정렬하면 더 위험한 점수가 앞에 옴

    const result: AnalysisResult = {
      score: finalScore,
      highlights: uniqueHighlights,
      summary: aiResult.summary + (staticHighlights.length > 0 ? 
        `\n\n정적 규칙에서 ${staticHighlights.length}개의 추가 위험 요소를 발견했습니다.` : '')
    }

    return NextResponse.json(
      { success: true, result },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
          'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
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