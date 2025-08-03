import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhishingBadge from '@/components/PhishingBadge'

describe('PhishingBadge', () => {
  it('A 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="A" />)
    
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('매우 위험')).toBeInTheDocument()
  })

  it('B 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="B" />)
    
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('위험')).toBeInTheDocument()
  })

  it('C 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="C" />)
    
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('주의')).toBeInTheDocument()
  })

  it('D 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="D" />)
    
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('보통')).toBeInTheDocument()
  })

  it('E 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="E" />)
    
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('낮음')).toBeInTheDocument()
  })

  it('F 등급 뱃지를 올바르게 렌더링해야 함', () => {
    render(<PhishingBadge score="F" />)
    
    expect(screen.getByText('F')).toBeInTheDocument()
    expect(screen.getByText('안전')).toBeInTheDocument()
  })

  it('A 등급은 빨간색 배경을 가져야 함', () => {
    render(<PhishingBadge score="A" />)
    
    const badge = screen.getByText('A').closest('div')
    expect(badge).toHaveClass('bg-red-500')
  })

  it('F 등급은 파란색 배경을 가져야 함', () => {
    render(<PhishingBadge score="F" />)
    
    const badge = screen.getByText('F').closest('div')
    expect(badge).toHaveClass('bg-blue-500')
  })

  it('커스텀 className을 적용할 수 있어야 함', () => {
    render(<PhishingBadge score="A" className="custom-class" />)
    
    const badge = screen.getByText('A').closest('div')
    expect(badge).toHaveClass('custom-class')
  })

  it('모든 등급에 대해 적절한 Tailwind 클래스를 가져야 함', () => {
    const scores: Array<'A' | 'B' | 'C' | 'D' | 'E' | 'F'> = ['A', 'B', 'C', 'D', 'E', 'F']
    
    scores.forEach((score) => {
      const { unmount } = render(<PhishingBadge score={score} />)
      
      const badge = screen.getByText(score).closest('div')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-semibold', 'text-white')
      
      unmount()
    })
  })

  it('점수와 라벨이 모두 표시되어야 함', () => {
    render(<PhishingBadge score="C" />)
    
    const scoreElement = screen.getByText('C')
    const labelElement = screen.getByText('주의')
    
    expect(scoreElement).toHaveClass('font-bold', 'text-xl')
    expect(labelElement).toBeInTheDocument()
  })
}) 