import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/analyze/route'

// OpenAI mock
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}))

// Rate limit mock
vi.mock('@/utils/rateLimit', () => ({
  checkRateLimit: vi.fn(),
  getRealIP: vi.fn()
}))

// Static rules mock
vi.mock('@/utils/staticRules', () => ({
  applyStaticRules: vi.fn(),
  getPhishingScore: vi.fn()
}))

describe('/api/analyze', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  it('성공적인 분석 요청을 처리해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: 'test email content',
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    const { applyStaticRules, getPhishingScore } = await import('@/utils/staticRules')
    ;(applyStaticRules as any).mockReturnValue([])
    ;(getPhishingScore as any).mockReturnValue('F')

    // OpenAI mock
    const OpenAI = (await import('openai')).default
    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as any).mockResolvedValue({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify({
              score: 'F',
              highlights: [],
              summary: 'This content appears to be safe.'
            })
          }
        }
      }]
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.result.score).toBe('F')
  })

  it('rate limit 초과 시 429 에러를 반환해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: 'test email content',
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock - 제한 초과
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error).toContain('일일 요청 한도를 초과했습니다')
  })

  it('빈 내용 요청 시 400 에러를 반환해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: '',
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('유효하지 않은 입력입니다')
  })

  it('크기 제한 초과 시 400 에러를 반환해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: 'a'.repeat(21 * 1024), // 21KB
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('입력 크기가 20KB를 초과했습니다')
  })

  it('OpenAI API 에러 시 500 에러를 반환해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: 'test email content',
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    const { applyStaticRules, getPhishingScore } = await import('@/utils/staticRules')
    ;(applyStaticRules as any).mockReturnValue([])
    ;(getPhishingScore as any).mockReturnValue('F')

    // OpenAI mock - 에러 발생
    const OpenAI = (await import('openai')).default
    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as any).mockRejectedValue(new Error('OpenAI API Error'))

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('서버 오류가 발생했습니다')
  })

  it('정적 규칙과 AI 결과를 올바르게 병합해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: 'test email content with suspicious link bit.ly/test',
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    const { applyStaticRules, getPhishingScore } = await import('@/utils/staticRules')
    ;(applyStaticRules as any).mockReturnValue([
      { text: 'bit.ly/test', reason: '단축 URL 사용' }
    ])
    ;(getPhishingScore as any).mockReturnValue('C')

    // OpenAI mock
    const OpenAI = (await import('openai')).default
    const mockOpenAI = new OpenAI()
    ;(mockOpenAI.chat.completions.create as any).mockResolvedValue({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify({
              score: 'D',
              highlights: [
                { text: 'suspicious', reason: 'AI detected suspicious content' }
              ],
              summary: 'AI analysis summary'
            })
          }
        }
      }]
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.result.score).toBe('C') // 더 위험한 점수 선택
    expect(data.result.highlights).toHaveLength(2) // 정적 규칙 + AI 결과
  })

  it('올바른 OpenAI function call을 수행해야 함', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        content: 'test email content',
        type: 'email'
      }),
      headers: {
        get: () => '192.168.1.1'
      }
    } as any

    // Rate limit mock
    const { checkRateLimit, getRealIP } = await import('@/utils/rateLimit')
    ;(getRealIP as any).mockReturnValue('192.168.1.1')
    ;(checkRateLimit as any).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    const { applyStaticRules, getPhishingScore } = await import('@/utils/staticRules')
    ;(applyStaticRules as any).mockReturnValue([])
    ;(getPhishingScore as any).mockReturnValue('F')

    // OpenAI mock
    const OpenAI = (await import('openai')).default
    const mockOpenAI = new OpenAI()
    const createSpy = vi.spyOn(mockOpenAI.chat.completions, 'create')
    createSpy.mockResolvedValue({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify({
              score: 'F',
              highlights: [],
              summary: 'Safe content'
            })
          }
        }
      }]
    } as any)

    await POST(mockRequest)

    expect(createSpy).toHaveBeenCalledWith({
      model: 'gpt-4o',
      temperature: 0,
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('피싱 이메일/URL 분석 전문가')
        }),
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('test email content')
        })
      ]),
      functions: expect.arrayContaining([
        expect.objectContaining({
          name: 'analyze_phishing'
        })
      ]),
      function_call: { name: 'analyze_phishing' }
    })
  })
}) 