import { PhishingScore } from './types'
import { SCORE_ORDER } from './constants'

/**
 * Compare two phishing scores and return the higher risk level
 */
export function getHigherRiskScore(score1: PhishingScore, score2: PhishingScore): PhishingScore {
  const score1Level = SCORE_ORDER.indexOf(score1)
  const score2Level = SCORE_ORDER.indexOf(score2)
  return SCORE_ORDER[Math.max(score1Level, score2Level)]
}

/**
 * Check if a score is valid
 */
export function isValidScore(score: string): score is PhishingScore {
  return SCORE_ORDER.includes(score as PhishingScore)
}

/**
 * Get score level index (0 = Safe, 4 = Critical)
 */
export function getScoreLevel(score: PhishingScore): number {
  return SCORE_ORDER.indexOf(score)
}

/**
 * Check if a score indicates high risk (High or Critical)
 */
export function isHighRisk(score: PhishingScore): boolean {
  return getScoreLevel(score) >= 3 // High or Critical
} 