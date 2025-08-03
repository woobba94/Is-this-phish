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
    <div className="flex flex-col items-center gap-4">
      <Badge 
        variant={config.variant} 
        className={`text-xl px-8 py-4 gap-3 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
      >
        <IconComponent className="w-6 h-6" />
        <span className="font-bold text-2xl">{score}</span>
      </Badge>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">
          {config.label} Risk
        </p>
        <p className="text-base text-muted-foreground max-w-[250px] leading-relaxed">
          {config.description}
        </p>
      </div>
    </div>
  )
} 