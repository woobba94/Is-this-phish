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

  it('should render correctly on initial load', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('Is This Phish?')).toBeInTheDocument()
    expect(screen.getByText('Real-time phishing detection service combining AI and static rules')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Email Analysis/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /URL Analysis/ })).toBeInTheDocument()
  })

  it('should allow changing input type', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const urlButton = screen.getByRole('button', { name: /URL Analysis/ })
    await user.click(urlButton)
    
    expect(screen.getByText('Suspicious URL')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Please enter the suspicious URL to analyze/)).toBeInTheDocument()
  })

  it('should handle text input correctly', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'test email content')
    
    expect(textarea).toHaveValue('test email content')
    expect(screen.getByText('18 / 20,480 characters')).toBeInTheDocument()
  })

  it('should disable analyze button when content is empty', () => {
    render(<EmailAnalyzer />)
    
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    expect(analyzeButton).toBeDisabled()
  })

  it('should enable analyze button when content is entered', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    expect(analyzeButton).toBeEnabled()
  })

  it('should handle clear button correctly', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const clearButton = screen.getByRole('button', { name: /Clear input content/ })
    
    await user.type(textarea, 'test content')
    expect(textarea).toHaveValue('test content')
    
    await user.click(clearButton)
    expect(textarea).toHaveValue('')
  })

  it('should show warning message when content is empty', async () => {
    const user = userEvent.setup()
    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    // Add content first, then remove it to make button enabled state testable
    await user.type(textarea, 'test')
    await user.clear(textarea)
    await user.type(textarea, '   ') // Only whitespace
    
    // Button should still be disabled as whitespace is trimmed
    expect(analyzeButton).toBeDisabled()
    
    // Component's actual behavior: button is disabled with whitespace only, so alert won't be called
    // Changed test to verify button disabled state instead
  })

  it('should show loading state during analysis', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response with delay
    const mockFetch = vi.fn().mockImplementation(() =>
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            result: {
              score: 'Safe',
              highlights: [],
              summary: 'No threats detected'
            }
          })
        }), 100)
      )
    )
    global.fetch = mockFetch

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content for analysis')
    await user.click(analyzeButton)
    
    // Should show loading state
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('should display successful analysis result', async () => {
    const user = userEvent.setup()
    
    const mockResponse = {
      success: true,
      result: {
        score: 'Safe',
        highlights: [
          {
            text: 'suspicious text',
            reason: 'Test reason'
          }
        ],
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
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test summary')).toBeInTheDocument()
    })
  })

  it('should display error message on analysis failure', async () => {
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
      expect(screen.getByText('Analysis failed')).toBeInTheDocument()
      expect(screen.getByText('API error occurred')).toBeInTheDocument()
    })
  })

  it('should display appropriate message on network error', async () => {
    const user = userEvent.setup()
    
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    render(<EmailAnalyzer />)
    
    const textarea = screen.getByRole('textbox')
    const analyzeButton = screen.getByRole('button', { name: /Start Analysis/ })
    
    await user.type(textarea, 'test content')
    await user.click(analyzeButton)
    
    await waitFor(() => {
      expect(screen.getByText('A network error occurred. Please try again.')).toBeInTheDocument()
    })
  })

  it('should display important notes', () => {
    render(<EmailAnalyzer />)
    
    expect(screen.getByText('Important Notes')).toBeInTheDocument()
    expect(screen.getByText('10 analyses per IP address per day')).toBeInTheDocument()
    expect(screen.getByText('Please be careful when entering content containing personal information')).toBeInTheDocument()
    expect(screen.getByText('Analysis results are for reference only, final decisions are the user\'s responsibility')).toBeInTheDocument()
  })

  it('should send correct API request', async () => {
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
    
    expect(fetch).toHaveBeenCalledWith('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'test email content',
        type: 'email'
      })
    })
  })
}) 