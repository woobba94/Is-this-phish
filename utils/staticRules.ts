import { StaticRule, PhishingHighlight, PhishingScore } from './types'

const STATIC_RULES: StaticRule[] = [
  // 한글·영문 도메인 불일치
  {
    pattern: /from:.*@.*\.(kr|한국).*[\s\S]*https?:\/\/(?!.*\.(kr|한국))/gi,
    reason: 'Email from Korean domain but links to foreign domain',
    severity: 'high',
  },
  
  // 퍼블릭 이메일 제공업체 발신자
  {
    pattern: /from:.*@(gmail|naver|daum|kakao|yahoo|hotmail|outlook)\.com/gi,
    reason: 'Using public email service for official business communication',
    severity: 'medium',
  },
  
  // 은행·결제 키워드 + 단축 URL
  {
    pattern: /(은행|카드|결제|송금|계좌|입금|출금|환불).*(?:bit\.ly|tinyurl|short\.link|t\.co)/gi,
    reason: 'Financial content with shortened URL',
    severity: 'high',
  },
  
  // HTML form action 외부 도메인
  {
    pattern: /<form[^>]+action\s*=\s*["']https?:\/\/(?!.*\.(kr|한국))[^"']*["']/gi,
    reason: 'HTML form submits to foreign domain',
    severity: 'high',
  },
  
  // 긴급성 조작 키워드
  {
    pattern: /(긴급|즉시|오늘까지|24시간|마감|제한시간|차단|정지|만료|취소)/gi,
    reason: 'Suspicious urgency manipulation language',
    severity: 'medium',
  },
  
  // suspicious 도메인 확장자
  {
    pattern: /https?:\/\/[^\/\s]*\.(tk|ml|ga|cf|pp\.ua)/gi,
    reason: 'Suspicious free domain extension',
    severity: 'high',
  },
  
  // 피싱 의심 파라미터
  {
    pattern: /[?&](user|login|password|card|account|bank)=/gi,
    reason: 'URL contains sensitive information parameters',
    severity: 'high',
  },
]

export function applyStaticRules(content: string): PhishingHighlight[] {
  const highlights: PhishingHighlight[] = []
  
  for (const rule of STATIC_RULES) {
    const matches = content.match(rule.pattern)
    if (matches) {
      for (const match of matches) {
        highlights.push({
          text: match,
          reason: rule.reason,
        })
      }
    }
  }
  
  return highlights
}

export function getPhishingScore(highlights: PhishingHighlight[]): PhishingScore {
  const highCount = highlights.filter(h => 
    STATIC_RULES.find(r => r.reason === h.reason)?.severity === 'high'
  ).length
  
  const mediumCount = highlights.filter(h => 
    STATIC_RULES.find(r => r.reason === h.reason)?.severity === 'medium'
  ).length
  
  const totalScore = highCount * 3 + mediumCount * 1
  
  if (totalScore >= 9) return 'Critical' // Confirmed phishing
  if (totalScore >= 6) return 'High' // High phishing possibility
  if (totalScore >= 4) return 'Medium' // Some risk factors
  if (totalScore >= 2) return 'Low' // Minor concerns
  if (totalScore >= 1) return 'Low' // Minor concerns
  return 'Safe' // Normal email/URL
} 