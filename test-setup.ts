import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  },
})

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toBlob: vi.fn(),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  })),
}))

// Mock react-quill  
vi.mock('react-quill', () => ({
  default: ({ value }: { value: string }) => {
    return React.createElement('div', {
      'data-testid': 'react-quill',
      dangerouslySetInnerHTML: { __html: value }
    })
  },
})) 