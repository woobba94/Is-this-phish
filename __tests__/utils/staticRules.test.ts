import { describe, it, expect } from 'vitest'
import { applyStaticRules } from '@/utils/staticRules'

describe('staticRules', () => {
  describe('applyStaticRules', () => {
    it('한글·영문 도메인 불일치를 탐지해야 함', () => {
      const content = 'From: test@naver.kr\nPlease visit: https://malicious.com/login'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('Email from Korean domain but links to foreign domain')
    })

    it('퍼블릭 이메일 제공업체를 탐지해야 함', () => {
      const content = 'From: admin@gmail.com\nOfficial business notice'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('Using public email service for official business communication')
    })

    it('은행·결제 키워드 + 단축 URL을 탐지해야 함', () => {
      const content = '은행 계좌 확인: bit.ly/check'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('Financial content with shortened URL')
    })

    it('HTML form action 외부 도메인을 탐지해야 함', () => {
      const content = '<form action="https://malicious.com/collect">'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('HTML form submits to foreign domain')
    })

    it('긴급성 조작 키워드를 탐지해야 함', () => {
      const content = '긴급한 업무입니다. 계정이 곧 정지됩니다.'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(2) // '긴급', '정지'
      expect(highlights[0].reason).toContain('Suspicious urgency manipulation language')
    })

    it('의심스러운 무료 도메인을 탐지해야 함', () => {
      const content = 'Visit: https://suspicious.tk/login'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('Suspicious free domain extension')
    })

    it('URL에 민감한 정보 파라미터를 탐지해야 함', () => {
      const content = 'Visit: https://site.com/login?user=admin&password=123'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(2) // 'user=' 'password='
      expect(highlights[0].reason).toContain('URL contains sensitive information parameters')
    })

    it('should return empty array for safe content', () => {
      const content = 'This is a normal email from contact@company.co.kr'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(0)
    })
  })
}) 