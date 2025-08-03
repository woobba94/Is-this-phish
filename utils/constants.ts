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

// Get the number of static rules dynamically
export const getStaticRulesCount = () => {
  // Import is done here to avoid circular dependency
  const { STATIC_RULES } = require('./staticRules')
  return STATIC_RULES.length
}

// Risk level configuration for UI display
export const RISK_LEVELS = {
  Critical: {
    label: 'Critical',
    variant: 'phishingA' as const,
    description: 'Confirmed phishing threats detected',
    badgeClass: 'bg-red-500 text-white text-lg px-4 py-2 font-bold',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50/50',
    textColor: 'text-red-800',
    subtextColor: 'text-red-600'
  },
  High: {
    label: 'High',
    variant: 'phishingB' as const,
    description: 'High probability of phishing detected',
    badgeClass: 'bg-orange-500 text-white text-lg px-4 py-2 font-bold',
    borderColor: 'border-orange-500',
    bgColor: 'bg-orange-50/50',
    textColor: 'text-orange-800',
    subtextColor: 'text-orange-600'
  },
  Medium: {
    label: 'Medium',
    variant: 'phishingC' as const,
    description: 'Some suspicious patterns identified',
    badgeClass: 'bg-yellow-500 text-white text-lg px-4 py-2 font-bold',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50/50',
    textColor: 'text-yellow-800',
    subtextColor: 'text-yellow-600'
  },
  Low: {
    label: 'Low',
    variant: 'phishingD' as const,
    description: 'Minor security concerns detected',
    badgeClass: 'bg-blue-500 text-white text-lg px-4 py-2 font-bold',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50/50',
    textColor: 'text-blue-800',
    subtextColor: 'text-blue-600'
  },
  Safe: {
    label: 'Safe',
    variant: 'phishingF' as const,
    description: 'No security threats identified',
    badgeClass: 'bg-green-500 text-white text-lg px-4 py-2 font-bold',
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