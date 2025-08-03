'use client'

import { Badge } from '@/components/ui/badge'
import { PhishingScore } from '@/utils/types'
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react'

interface PhishingBadgeProps {
  score: PhishingScore
  className?: string
}

const SCORE_CONFIG = {
  A: { 
    label: '매우 위험', 
    variant: 'phishingA' as const,
    icon: ShieldAlert,
    description: '확실한 피싱으로 판단됨'
  },
  B: { 
    label: '위험', 
    variant: 'phishingB' as const,
    icon: ShieldAlert,
    description: '피싱 가능성이 높음'
  },
  C: { 
    label: '주의', 
    variant: 'phishingC' as const,
    icon: AlertTriangle,
    description: '의심스러운 요소가 있음'
  },
  D: { 
    label: '보통', 
    variant: 'phishingD' as const,
    icon: Info,
    description: '약간의 위험 요소'
  },
  E: { 
    label: '낮음', 
    variant: 'phishingE' as const,
    icon: Info,
    description: '경미한 주의사항'
  },
  F: { 
    label: '안전', 
    variant: 'phishingF' as const,
    icon: ShieldCheck,
    description: '정상적인 이메일/URL'
  },
}

export default function PhishingBadge({ score, className = '' }: PhishingBadgeProps) {
  const config = SCORE_CONFIG[score]
  const IconComponent = config.icon

  return (
    <div className="flex flex-col items-center gap-2">
      <Badge variant={config.variant} className={`text-lg px-6 py-3 gap-2 ${className}`}>
        <IconComponent className="w-5 h-5" />
        <span className="font-bold text-xl">{score}</span>
        <span className="font-semibold">{config.label}</span>
      </Badge>
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        {config.description}
      </p>
    </div>
  )
} 