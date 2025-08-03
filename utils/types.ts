export type PhishingScore = 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical'

export interface PhishingHighlight {
  text: string
  reason: string
}

export interface AnalysisResult {
  score: PhishingScore
  highlights: PhishingHighlight[]
  summary: string
}

export interface AnalyzeRequest {
  content: string
  type: 'email' | 'url'
}

export interface AnalyzeResponse {
  success: boolean
  result?: AnalysisResult
  error?: string
  cached?: boolean
}

export interface StaticRule {
  pattern: RegExp
  reason: string
  severity: 'high' | 'medium' | 'low'
}

export interface RateLimitInfo {
  allowed: boolean
  remaining: number
  resetTime: number
} 