import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/analyze/route'
import { NextRequest } from 'next/server'
import { checkRateLimit } from '@/utils/rateLimit'
import { applyStaticRules, getPhishingScore } from '@/utils/staticRules'

// Global storage for mock function
declare global {
  var __openaiMockCreate: any
}

// OpenAI mock
vi.mock('openai', () => {
  const mockCreateFn = vi.fn()
  globalThis.__openaiMockCreate = mockCreateFn
  
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreateFn
        }
      }
    }
  }
})

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
  let mockCreate: any

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
    mockCreate = globalThis.__openaiMockCreate
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
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    vi.mocked(applyStaticRules).mockReturnValue([])
    vi.mocked(getPhishingScore).mockReturnValue('Safe')

    // OpenAI mock
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify({
              score: 'SAFE',
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
    expect(data.result.score).toBe('Safe')
  })

  it('rate limit 초과 시 429 에러를 반환해야 함', async () => {
    // Mock rate limit exceeded
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 24 * 60 * 60 * 1000
    })

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        content: 'test email content',
        type: 'email'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Daily request limit (10 requests) exceeded')
  })

  it('빈 내용 요청 시 400 에러를 반환해야 함', async () => {
    // Mock successful rate limit check
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 24 * 60 * 60 * 1000
    })

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        content: '',
        type: 'email'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid input provided')
  })

  it('크기 제한 초과 시 400 에러를 반환해야 함', async () => {
    // Mock successful rate limit check
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 24 * 60 * 60 * 1000
    })

    const largeContent = 'a'.repeat(21 * 1024) // 21KB content

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        content: largeContent,
        type: 'email'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Input size exceeds 20KB limit')
  })

  it('OpenAI API 에러 시 500 에러를 반환해야 함', async () => {
    // Mock successful rate limit check
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      resetTime: Date.now() + 24 * 60 * 60 * 1000
    })

         // Mock OpenAI API error
     mockCreate.mockRejectedValueOnce(new Error('OpenAI API Error'))

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        content: 'test email content',
        type: 'email'
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('A server error occurred')
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
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    vi.mocked(applyStaticRules).mockReturnValue([
      { text: 'bit.ly/test', reason: '단축 URL 사용' }
    ])
    vi.mocked(getPhishingScore).mockReturnValue('Medium')

    // OpenAI mock
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify({
              score: 'LOW',
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
    expect(data.result.score).toBe('Medium') // 더 위험한 점수 선택
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
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 0,
      resetTime: Date.now() + 86400000
    })

    // Static rules mock
    vi.mocked(applyStaticRules).mockReturnValue([])
    vi.mocked(getPhishingScore).mockReturnValue('Safe')

    // OpenAI mock
    mockCreate.mockResolvedValue({
      choices: [{
        message: {
          function_call: {
            arguments: JSON.stringify({
              score: 'SAFE',
              highlights: [],
              summary: 'Safe content'
            })
          }
        }
      }]
    } as any)

    await POST(mockRequest)

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-4o',
      temperature: 0,
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('phishing email/URL analyzer')
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