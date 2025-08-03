import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhishingBadge from '@/components/PhishingBadge'

describe('PhishingBadge', () => {
  it('Critical level badge should be rendered correctly', () => {
    render(<PhishingBadge score="Critical" />)
    
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Confirmed phishing threats detected')).toBeInTheDocument()
  })

  it('High level badge should be rendered correctly', () => {
    render(<PhishingBadge score="High" />)
    
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('High probability of phishing detected')).toBeInTheDocument()
  })

  it('Medium level badge should be rendered correctly', () => {
    render(<PhishingBadge score="Medium" />)
    
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Some suspicious patterns identified')).toBeInTheDocument()
  })

  it('Low level badge should be rendered correctly', () => {
    render(<PhishingBadge score="Low" />)
    
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Minor security concerns detected')).toBeInTheDocument()
  })

  it('Safe level badge should be rendered correctly', () => {
    render(<PhishingBadge score="Safe" />)
    
    expect(screen.getByText('Safe')).toBeInTheDocument()
    expect(screen.getByText('No security threats identified')).toBeInTheDocument()
  })

  it('Invalid score should return null', () => {
    const { container } = render(<PhishingBadge score={'Invalid' as any} />)
    expect(container.firstChild).toBeNull()
  })

  it('Safe level should have green background', () => {
    render(<PhishingBadge score="Safe" />)
    
    const badge = screen.getByText('Safe').closest('div')
    expect(badge).toHaveClass('bg-green-500')
  })

  it('Critical level should have red background', () => {
    render(<PhishingBadge score="Critical" />)
    
    const badge = screen.getByText('Critical').closest('div')
    expect(badge).toHaveClass('bg-red-500')
  })

  it('Should be able to apply custom className', () => {
    render(<PhishingBadge score="Medium" className="custom-class" />)
    
    const badge = screen.getByText('Medium').closest('div')
    expect(badge).toHaveClass('custom-class')
  })

  it('Should have appropriate Tailwind classes for all levels', () => {
    render(<PhishingBadge score="High" />)
    
    const badge = screen.getByText('High').closest('div')
    expect(badge).toHaveClass('shadow-lg', 'hover:shadow-xl', 'transition-all', 'duration-200')
  })

  it('Score and label should both be displayed', () => {
    render(<PhishingBadge score="Medium" />)
    
    const scoreElement = screen.getByText('Medium')
    
    expect(scoreElement).toHaveClass('font-bold', 'text-2xl')
  })
}) 