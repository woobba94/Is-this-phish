import { StaticRule, PhishingHighlight } from './types'

const STATIC_RULES: StaticRule[] = [
  // 한글·영문 도메인 불일치
  {
    pattern: /from:.*@.*\.(kr|한국).*[\s\S]*https?:\/\/(?!.*\.(kr|한국))/gi,
    reason: '한국 도메인에서 발신했으나 해외 도메인으로 연결',
    severity: 'high',
  },
  
  // 퍼블릭 이메일 제공업체 발신자
  {
    pattern: /from:.*@(gmail|naver|daum|kakao|yahoo|hotmail|outlook)\.com/gi,
    reason: '퍼블릭 이메일에서 공식 업무 메일로 가장',
    severity: 'medium',
  },
  
  // 은행·결제 키워드 + 단축 URL
  {
    pattern: /(은행|카드|결제|송금|계좌|입금|출금|환불).*(?:bit\.ly|tinyurl|short\.link|t\.co)/gi,
    reason: '금융 관련 내용에 단축 URL 사용',
    severity: 'high',
  },
  
  // HTML form action 외부 도메인
  {
    pattern: /<form[^>]+action\s*=\s*["']https?:\/\/(?!.*\.(kr|한국))[^"']*["']/gi,
    reason: 'HTML 폼이 해외 도메인으로 전송',
    severity: 'high',
  },
  
  // 긴급성 조작 키워드
  {
    pattern: /(긴급|즉시|오늘까지|24시간|마감|제한시간|차단|정지|만료|취소)/gi,
    reason: '긴급성을 조작하는 의심스러운 표현',
    severity: 'medium',
  },
  
  // suspicious 도메인 확장자
  {
    pattern: /https?:\/\/[^\/\s]*\.(tk|ml|ga|cf|pp\.ua)/gi,
    reason: '의심스러운 무료 도메인 사용',
    severity: 'high',
  },
  
  // 피싱 의심 파라미터
  {
    pattern: /[?&](user|login|password|card|account|bank)=/gi,
    reason: 'URL에 민감한 정보 파라미터 포함',
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

export function getPhishingScore(highlights: PhishingHighlight[]): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  const highCount = highlights.filter(h => 
    STATIC_RULES.find(r => r.reason === h.reason)?.severity === 'high'
  ).length
  
  const mediumCount = highlights.filter(h => 
    STATIC_RULES.find(r => r.reason === h.reason)?.severity === 'medium'
  ).length
  
  const totalScore = highCount * 3 + mediumCount * 1
  
  if (totalScore >= 9) return 'A' // 매우 위험
  if (totalScore >= 6) return 'B' // 위험
  if (totalScore >= 4) return 'C' // 주의
  if (totalScore >= 2) return 'D' // 보통
  if (totalScore >= 1) return 'E' // 낮음
  return 'F' // 안전
} 