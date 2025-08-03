import { describe, it, expect } from 'vitest'
import { applyStaticRules, getPhishingScore } from '@/utils/staticRules'

describe('staticRules', () => {
  describe('applyStaticRules', () => {
    it('한글·영문 도메인 불일치를 탐지해야 함', () => {
      const content = 'from: test@naver.kr\nhttps://suspicious-site.com/login'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('한국 도메인에서 발신했으나 해외 도메인으로 연결')
    })

    it('퍼블릭 이메일 제공업체를 탐지해야 함', () => {
      const content = 'from: admin@gmail.com\nSubject: 공식 알림'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('퍼블릭 이메일에서 공식 업무 메일로 가장')
    })

    it('은행·결제 키워드 + 단축 URL을 탐지해야 함', () => {
      const content = '계좌 확인을 위해 bit.ly/abc123 링크를 클릭하세요'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('금융 관련 내용에 단축 URL 사용')
    })

    it('HTML form action 외부 도메인을 탐지해야 함', () => {
      const content = '<form action="https://malicious-site.com/submit">'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('HTML 폼이 해외 도메인으로 전송')
    })

    it('긴급성 조작 키워드를 탐지해야 함', () => {
      const content = '긴급히 처리하지 않으면 계정이 정지됩니다'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(2) // '긴급', '정지'
      expect(highlights[0].reason).toContain('긴급성을 조작하는 의심스러운 표현')
    })

    it('의심스러운 무료 도메인을 탐지해야 함', () => {
      const content = 'https://suspicious-site.tk/login'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(1)
      expect(highlights[0].reason).toContain('의심스러운 무료 도메인 사용')
    })

    it('URL에 민감한 정보 파라미터를 탐지해야 함', () => {
      const content = 'https://example.com/page?user=admin&password=123'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(2) // 'user=' 'password='
      expect(highlights[0].reason).toContain('URL에 민감한 정보 파라미터 포함')
    })

    it('정상적인 내용에는 하이라이트가 없어야 함', () => {
      const content = 'from: support@company.co.kr\nSubject: 정기 뉴스레터\n안녕하세요. 저희 회사의 소식을 전해드립니다.'
      const highlights = applyStaticRules(content)
      
      expect(highlights).toHaveLength(0)
    })

    it('빈 문자열에는 하이라이트가 없어야 함', () => {
      const highlights = applyStaticRules('')
      expect(highlights).toHaveLength(0)
    })
  })

  describe('getPhishingScore', () => {
    it('위험 요소가 많으면 매우위험 등급을 반환해야 함', () => {
      const highlights = [
        { text: 'test1', reason: '한국 도메인에서 발신했으나 해외 도메인으로 연결' },
        { text: 'test2', reason: 'HTML 폼이 해외 도메인으로 전송' },
        { text: 'test3', reason: '금융 관련 내용에 단축 URL 사용' },
      ]
      
      const score = getPhishingScore(highlights)
      expect(score).toBe('매우위험')
    })

    it('중간 정도 위험 요소가 있으면 위험-보통 등급을 반환해야 함', () => {
      const highlights = [
        { text: 'test1', reason: '한국 도메인에서 발신했으나 해외 도메인으로 연결' },
        { text: 'test2', reason: '퍼블릭 이메일에서 공식 업무 메일로 가장' },
      ]
      
      const score = getPhishingScore(highlights)
      expect(['위험', '보통']).toContain(score)
    })

    it('위험 요소가 적으면 낮음 등급을 반환해야 함', () => {
      const highlights = [
        { text: 'test1', reason: '퍼블릭 이메일에서 공식 업무 메일로 가장' },
      ]
      
      const score = getPhishingScore(highlights)
      expect(score).toBe('낮음')
    })

    it('위험 요소가 없으면 안전 등급을 반환해야 함', () => {
      const highlights: any[] = []
      
      const score = getPhishingScore(highlights)
      expect(score).toBe('안전')
    })
  })
}) 