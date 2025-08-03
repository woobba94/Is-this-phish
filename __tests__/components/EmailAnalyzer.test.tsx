import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import EmailAnalyzer from '@/components/EmailAnalyzer'

// Mock fetch
global.fetch = vi.fn()

describe('EmailAnalyzer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('초기 로드 시 올바르게 렌더링되어야 함', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('Is This Phish?')).toBeInTheDocument()
    expect(screen.getByText('AI-powered phishing detection service')).toBeInTheDocument()
    expect(screen.getByText('Email Content (HTML/Plain Text)')).toBeInTheDocument()
  })

  it('입력 타입이 자동으로 감지되어야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    
    // URL 입력시 자동 감지
    await user.type(textarea, 'https://example.com')
    expect(screen.getByText('Auto-detected: URL')).toBeInTheDocument()
    expect(screen.getByText('Suspicious URL')).toBeInTheDocument()
    
    // 이메일 내용으로 변경
    await user.clear(textarea)
    await user.type(textarea, 'From: test@example.com')
    expect(screen.getByText('Auto-detected: Email')).toBeInTheDocument()
    expect(screen.getByText('Email Content (HTML/Plain Text)')).toBeInTheDocument()
  })

  it('텍스트 입력을 올바르게 처리해야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'test email content')
    
    expect(textarea).toHaveValue('test email content')
    expect(screen.getByText('18 / 20,480 characters')).toBeInTheDocument()
  })

  it('내용이 비어있을 때 분석 버튼이 비활성화되어야 함', () => {
    render(<EmailAnalyzer />)
    
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    expect(analyzeButton).toBeDisabled()
  })

  it('내용이 입력되면 분석 버튼이 활성화되어야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    
    expect(analyzeButton).not.toBeDisabled()
  })

  it('초기화 버튼을 올바르게 처리해야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const clearButton = screen.getByRole('button', { name: /Clear input content/ })
    
    await user.type(textarea, 'test content')
    expect(textarea).toHaveValue('test content')
    
    await user.click(clearButton)
    expect(textarea).toHaveValue('')
  })

  it('내용이 비어있을 때 경고 메시지를 표시해야 함', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('Please enter content before starting analysis')).toBeInTheDocument()
  })

  it('분석 중 로딩 상태를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, result: { score: 'Safe', highlights: [], summary: 'Test' } })
      }), 100))
    )

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('성공적인 분석 결과를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    const mockResponse = {
      success: true,
      result: {
        score: 'Safe',
        highlights: [],
        summary: 'This appears to be a safe email.'
      }
    }
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Safe')).toBeInTheDocument()
    })
  })

  it('분석 실패시 에러 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    const mockResponse = {
      success: false,
      error: 'API error occurred'
    }
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockResponse)
    })

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument()
      expect(screen.getByText('API error occurred')).toBeInTheDocument()
    })
  })

  it('네트워크 오류시 적절한 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Failed')).toBeInTheDocument()
      expect(screen.getByText('A network error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('중요 안내사항을 표시해야 함', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('Important Notes')).toBeInTheDocument()
    expect(screen.getByText('10 analyses per IP address per day')).toBeInTheDocument()
    expect(screen.getByText('Please be careful when entering content containing personal information')).toBeInTheDocument()
    expect(screen.getByText('Analysis results are for reference only, final decisions are the user\'s responsibility')).toBeInTheDocument()
  })

  it('올바른 API 요청을 전송해야 함', async () => {
    const user = userEvent.setup()
    
    const mockResponse = {
      success: true,
      result: {
        score: 'Safe',
        highlights: [],
        summary: 'Test summary'
      }
    }
    
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test email content')
    await user.click(analyzeButton)
    
    expect(global.fetch).toHaveBeenCalledWith('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'test email content',
        type: 'email',
      }),
    })
  })
}) 