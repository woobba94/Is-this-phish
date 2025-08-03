'use client'

import { Badge } from '@/components/ui/badge'
import { PhishingScore } from '@/utils/types'
import { RISK_LEVELS } from '@/utils/constants'
import { ShieldAlert, AlertTriangle, Info, ShieldCheck } from 'lucide-react'

interface PhishingBadgeProps {
  score: PhishingScore
  className?: string
}

const getIconForScore = (score: PhishingScore) => {
  switch (score) {
    case 'Critical':
    case 'High':
      return ShieldAlert
    case 'Medium':
      return AlertTriangle
    case 'Low':
      return Info
    case 'Safe':
      return ShieldCheck
    default:
      return ShieldCheck
  }
}

export default function PhishingBadge({ score, className = '' }: PhishingBadgeProps) {
  const config = RISK_LEVELS[score]
  
  if (!config) {
    console.error(`Invalid score: ${score}`)
    return null
  }
  
  const IconComponent = getIconForScore(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <Badge 
        variant={config.variant} 
        className={`text-lg px-6 py-3 gap-2 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      >
        <IconComponent className="w-5 h-5" />
        <span className="font-bold text-xl">{score}</span>
      </Badge>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">
          {config.label} Risk
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px]">
          {config.description}
        </p>
      </div>
    </div>
  )
} 