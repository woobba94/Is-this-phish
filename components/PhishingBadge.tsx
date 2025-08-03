'use client'

import { PhishingScore } from '@/utils/types'

interface PhishingBadgeProps {
  score: PhishingScore
  className?: string
}

const SCORE_CONFIG = {
  A: { label: '매우 위험', color: 'bg-red-500', textColor: 'text-white' },
  B: { label: '위험', color: 'bg-orange-500', textColor: 'text-white' },
  C: { label: '주의', color: 'bg-yellow-500', textColor: 'text-white' },
  D: { label: '보통', color: 'bg-green-500', textColor: 'text-white' },
  E: { label: '낮음', color: 'bg-cyan-500', textColor: 'text-white' },
  F: { label: '안전', color: 'bg-blue-500', textColor: 'text-white' },
}

export default function PhishingBadge({ score, className = '' }: PhishingBadgeProps) {
  const config = SCORE_CONFIG[score]

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${config.color} ${config.textColor} ${className}`}>
      <span className="text-lg font-bold">{score}</span>
      <span>{config.label}</span>
    </div>
  )
} 