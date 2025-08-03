import { PhishingScore } from './types'

// Score ordering for risk level comparison
export const SCORE_ORDER: PhishingScore[] = ['Safe', 'Low', 'Medium', 'High', 'Critical']

// API configuration
export const API_CONFIG = {
  MAX_CONTENT_SIZE: 20 * 1024, // 20KB
  RATE_LIMIT: {
    DEFAULT: 10,
    DEVELOPMENT: 50,
  },
  CACHE_EXPIRY_DAYS: 7,
} as const

// Risk level configuration for UI display
export const RISK_LEVELS = {
  Critical: {
    label: 'Critical',
    variant: 'phishingA' as const,
    description: 'Confirmed phishing detected',
    color: 'red',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50/50',
    textColor: 'text-red-800',
    subtextColor: 'text-red-600'
  },
  High: {
    label: 'High',
    variant: 'phishingB' as const,
    description: 'High phishing possibility',
    color: 'orange',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50/50',
    textColor: 'text-orange-800',
    subtextColor: 'text-orange-600'
  },
  Medium: {
    label: 'Medium',
    variant: 'phishingC' as const,
    description: 'Some risk factors present',
    color: 'yellow',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50/50',
    textColor: 'text-yellow-800',
    subtextColor: 'text-yellow-600'
  },
  Low: {
    label: 'Low',
    variant: 'phishingD' as const,
    description: 'Minor concerns',
    color: 'blue',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50/50',
    textColor: 'text-blue-800',
    subtextColor: 'text-blue-600'
  },
  Safe: {
    label: 'Safe',
    variant: 'phishingF' as const,
    description: 'Normal email/URL',
    color: 'green',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50/50',
    textColor: 'text-green-800',
    subtextColor: 'text-green-600'
  }
} as const

// OpenAI function definition
export const OPENAI_FUNCTION_DEFINITION = {
  name: 'analyze_phishing',
  description: 'Return phishing analysis results',
  parameters: {
    type: 'object',
    properties: {
      score: {
        type: 'string',
        enum: SCORE_ORDER,
        description: 'Phishing risk score'
      },
      highlights: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Suspicious text'
            },
            reason: {
              type: 'string',
              description: 'Why suspicious'
            }
          },
          required: ['text', 'reason']
        },
        description: 'List of suspicious elements'
      },
      summary: {
        type: 'string',
        description: 'Analysis summary'
      }
    },
    required: ['score', 'highlights', 'summary']
  }
} as const 