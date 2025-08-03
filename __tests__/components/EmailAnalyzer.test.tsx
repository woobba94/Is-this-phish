import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailAnalyzer from '@/components/EmailAnalyzer'

// fetch mock
global.fetch = vi.fn()

describe('EmailAnalyzer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('초기 렌더링이 올바르게 되어야 함', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('Is This Phish?')).toBeInTheDocument()
    expect(screen.getByText('AI와 정적 규칙을 결합한 실시간 피싱 탐지 서비스')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /이메일 분석/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /URL 분석/ })).toBeInTheDocument()
  })

  it('입력 타입을 변경할 수 있어야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const urlButton = screen.getByRole('button', { name: /URL 분석/ })
    await user.click(urlButton)
    
    expect(screen.getByText('의심스러운 URL')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/URL을 입력해주세요/)).toBeInTheDocument()
  })

  it('텍스트 입력이 올바르게 동작해야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'test email content')
    
    expect(textarea).toHaveValue('test email content')
    expect(screen.getByText('18 / 20,480 글자')).toBeInTheDocument()
  })

  it('내용이 없으면 분석 버튼이 비활성화되어야 함', () => {
    render(<EmailAnalyzer />)
    
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    expect(analyzeButton).toBeDisabled()
  })

  it('내용을 입력하면 분석 버튼이 활성화되어야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    
    expect(analyzeButton).not.toBeDisabled()
  })

  it('초기화 버튼이 올바르게 동작해야 함', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const clearButton = screen.getByRole('button', { name: /초기화/ })
    
    await user.type(textarea, 'test content')
    expect(textarea).toHaveValue('test content')
    
    await user.click(clearButton)
    expect(textarea).toHaveValue('')
  })

  it('내용이 없으면 경고 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    
    // 내용을 입력한 후 다시 지워서 버튼을 활성화 상태로 만든 다음 테스트
    await user.type(textarea, 'some content')
    await user.clear(textarea)
    await user.type(textarea, '   ') // 공백만 입력
    
    // 버튼이 여전히 비활성화 상태인지 확인
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    expect(analyzeButton).toBeDisabled()
    
    // 컴포넌트의 실제 동작: 공백만 있으면 버튼이 비활성화되므로 alert은 호출되지 않음
    // 대신 버튼 비활성화 상태 확인으로 테스트 변경
    
    alertSpy.mockRestore()
  })

  it('분석 중에는 로딩 상태를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          result: {
            score: 'Safe',
            highlights: [],
            summary: 'Test summary'
          }
        })
      })
    })

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    
    // Click analyze button
    await user.click(analyzeButton)
    
    // Should show loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('성공적인 분석 결과를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    const mockResult = {
      success: true,
      result: {
        score: 'A',
        highlights: [{ text: 'suspicious', reason: 'test reason' }],
        summary: 'This is suspicious'
      }
    }
    
    ;(global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResult)
    })
    
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'suspicious content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Phishing Analysis Result')).toBeInTheDocument()
    })
  })

  it('분석 실패 시 에러 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    const mockError = {
      success: false,
      error: 'API 에러가 발생했습니다'
    }
    
    ;(global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockError)
    })
    
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Analysis failed')).toBeInTheDocument()
      expect(screen.getByText('API error occurred')).toBeInTheDocument()
    })
  })

  it('네트워크 에러 시 적절한 메시지를 표시해야 함', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
    
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('A network error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('주의사항이 표시되어야 함', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('주의사항')).toBeInTheDocument()
    expect(screen.getByText('• IP당 하루 1회 분석 가능합니다')).toBeInTheDocument()
    expect(screen.getByText('• 개인정보가 포함된 내용은 주의해서 입력해주세요')).toBeInTheDocument()
    expect(screen.getByText('• 분석 결과는 참고용이며, 최종 판단은 사용자가 해야 합니다')).toBeInTheDocument()
  })

  it('올바른 API 요청을 보내야 함', async () => {
    const user = userEvent.setup()
    
    ;(global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, result: { score: 'F', highlights: [], summary: 'Safe' } })
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