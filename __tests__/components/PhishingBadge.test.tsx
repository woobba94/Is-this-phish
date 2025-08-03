import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhishingBadge from '@/components/PhishingBadge'

describe('PhishingBadge', () => {
  it('매우위험 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="매우위험" />)
    
    expect(screen.getByText('매우위험')).toBeInTheDocument()
    expect(screen.getByText('확실한 피싱으로 판단됨')).toBeInTheDocument()
  })

  it('위험 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="위험" />)
    
    expect(screen.getByText('위험')).toBeInTheDocument()
  })

  it('보통 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="보통" />)
    
    expect(screen.getByText('보통')).toBeInTheDocument()
  })

  it('낮음 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="낮음" />)
    
    expect(screen.getByText('낮음')).toBeInTheDocument()
  })

  it('안전 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="안전" />)
    
    expect(screen.getByText('안전')).toBeInTheDocument()
  })

  it('매우위험 등급은 빨간색 배경을 가져야 함', () => {
    render(<PhishingBadge score="매우위험" />)
    
    const badge = screen.getByText('매우위험').closest('div')
    expect(badge).toHaveClass('bg-red-500')
  })

  it('안전 등급은 파란색 배경을 가져야 함', () => {
    render(<PhishingBadge score="안전" />)
    
    const badge = screen.getByText('안전').closest('div')
    expect(badge).toHaveClass('bg-blue-500')
  })

  it('커스텀 className을 적용할 수 있어야 함', () => {
    render(<PhishingBadge score="매우위험" className="custom-class" />)
    
    const badge = screen.getByText('매우위험').closest('div')
    expect(badge).toHaveClass('custom-class')
  })

  it('모든 등급에 대해 적절한 Tailwind 클래스를 가져야 함', () => {
    const scores: Array<'안전' | '낮음' | '보통' | '위험' | '매우위험'> = ['안전', '낮음', '보통', '위험', '매우위험']
    
    scores.forEach((score) => {
      const { unmount } = render(<PhishingBadge score={score} />)
      
      const badge = screen.getByText(score).closest('div')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-semibold', 'text-white')
      
      unmount()
    })
  })

  it('점수와 라벨이 모두 표시되어야 함', () => {
    render(<PhishingBadge score="보통" />)
    
    const scoreElement = screen.getByText('보통')
    
    expect(scoreElement).toHaveClass('font-bold', 'text-xl')
  })
}) 