'use client'

import { Badge } from '@/components/ui/badge'
import { PhishingScore } from '@/utils/types'
import { ShieldAlert, AlertTriangle, Info, ShieldCheck } from 'lucide-react'

interface PhishingBadgeProps {
  score: PhishingScore
  className?: string
}

const SCORE_CONFIG = {
  매우위험: { 
    label: '매우위험', 
    variant: 'phishingA' as const,
    icon: ShieldAlert,
    description: '확실한 피싱으로 판단됨'
  },
  위험: { 
    label: '위험', 
    variant: 'phishingB' as const,
    icon: ShieldAlert,
    description: '피싱 가능성이 높음'
  },
  보통: { 
    label: '보통', 
    variant: 'phishingC' as const,
    icon: AlertTriangle,
    description: '약간의 위험 요소'
  },
  낮음: { 
    label: '낮음', 
    variant: 'phishingD' as const,
    icon: Info,
    description: '경미한 주의사항'
  },
  안전: { 
    label: '안전', 
    variant: 'phishingF' as const,
    icon: ShieldCheck,
    description: '정상적인 이메일/URL'
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