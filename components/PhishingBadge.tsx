'use client'

import { Badge } from '@/components/ui/badge'
import { PhishingScore } from '@/utils/types'
import { ShieldAlert, AlertTriangle, Info, ShieldCheck } from 'lucide-react'

interface PhishingBadgeProps {
  score: PhishingScore
  className?: string
}

const SCORE_CONFIG = {
  Critical: { 
    label: 'Critical', 
    variant: 'phishingA' as const,
    icon: ShieldAlert,
    description: 'Confirmed phishing detected'
  },
  High: { 
    label: 'High', 
    variant: 'phishingB' as const,
    icon: ShieldAlert,
    description: 'High phishing possibility'
  },
  Medium: { 
    label: 'Medium', 
    variant: 'phishingC' as const,
    icon: AlertTriangle,
    description: 'Some risk factors present'
  },
  Low: { 
    label: 'Low', 
    variant: 'phishingD' as const,
    icon: Info,
    description: 'Minor concerns'
  },
  Safe: { 
    label: 'Safe', 
    variant: 'phishingF' as const,
    icon: ShieldCheck,
    description: 'Normal email/URL'
  },
}

export default function PhishingBadge({ score, className = '' }: PhishingBadgeProps) {
  const config = SCORE_CONFIG[score]
  
  if (!config) {
    console.error(`Invalid score: ${score}`)
    return null
  }
  
  const IconComponent = config.icon

  return (
    <div className="flex flex-col items-center gap-2">
      <Badge variant={config.variant} className={`text-lg px-6 py-3 gap-2 ${className}`}>
        <IconComponent className="w-5 h-5" />
        <span className="font-bold text-xl">{score}</span>
      </Badge>
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        {config.description}
      </p>
    </div>
  )
} 