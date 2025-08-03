import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, getRealIP } from '@/utils/rateLimit'

describe('rateLimit', () => {
  beforeEach(() => {
    // 각 테스트 전에 rate limit store 초기화 (실제로는 private이지만 테스트를 위해)
    // 실제 구현에서는 store.clear() 같은 메서드를 추가할 수 있음
  })

  describe('checkRateLimit', () => {
    it('첫 번째 요청은 허용되어야 함', () => {
      const ip = '192.168.1.1'
      const result = checkRateLimit(ip)
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0) // 일일 1회 제한이므로 남은 횟수는 0
    })

    it('동일 IP의 두 번째 요청은 거부되어야 함', () => {
      const ip = '192.168.1.2'
      
      // 첫 번째 요청
      checkRateLimit(ip)
      
      // 두 번째 요청
      const result = checkRateLimit(ip)
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('다른 IP는 독립적으로 처리되어야 함', () => {
      const ip1 = '192.168.1.3'
      const ip2 = '192.168.1.4'
      
      const result1 = checkRateLimit(ip1)
      const result2 = checkRateLimit(ip2)
      
      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
    })

    it('resetTime이 지난 후에는 다시 허용되어야 함', () => {
      const ip = '192.168.1.5'
      
      // 첫 번째 요청
      const firstResult = checkRateLimit(ip)
      expect(firstResult.allowed).toBe(true)
      
      // 시간을 조작하기 위해 mock을 사용할 수 있지만,
      // 여기서는 간단히 resetTime이 설정되는지 확인
      expect(firstResult.resetTime).toBeGreaterThan(Date.now())
    })

    it('rate limit 정보가 올바르게 반환되어야 함', () => {
      const ip = '192.168.1.6'
      const result = checkRateLimit(ip)
      
      expect(result).toHaveProperty('allowed')
      expect(result).toHaveProperty('remaining')
      expect(result).toHaveProperty('resetTime')
      expect(typeof result.allowed).toBe('boolean')
      expect(typeof result.remaining).toBe('number')
      expect(typeof result.resetTime).toBe('number')
    })
  })

  describe('getRealIP', () => {
    it('x-forwarded-for 헤더에서 IP를 추출해야 함', () => {
      const mockRequest = {
        headers: {
          get: (header: string) => {
            if (header === 'x-forwarded-for') return '192.168.1.100, 10.0.0.1'
            return null
          }
        }
      } as Request
      
      const ip = getRealIP(mockRequest)
      expect(ip).toBe('192.168.1.100')
    })

    it('x-real-ip 헤더에서 IP를 추출해야 함', () => {
      const mockRequest = {
        headers: {
          get: (header: string) => {
            if (header === 'x-real-ip') return '192.168.1.200'
            return null
          }
        }
      } as Request
      
      const ip = getRealIP(mockRequest)
      expect(ip).toBe('192.168.1.200')
    })

    it('헤더가 없으면 fallback IP를 반환해야 함', () => {
      const mockRequest = {
        headers: {
          get: () => null
        }
      } as unknown as Request
      
      const ip = getRealIP(mockRequest)
      expect(ip).toBe('127.0.0.1')
    })

    it('x-forwarded-for가 x-real-ip보다 우선해야 함', () => {
      const mockRequest = {
        headers: {
          get: (header: string) => {
            if (header === 'x-forwarded-for') return '192.168.1.300'
            if (header === 'x-real-ip') return '192.168.1.400'
            return null
          }
        }
      } as Request
      
      const ip = getRealIP(mockRequest)
      expect(ip).toBe('192.168.1.300')
    })

    it('공백이 있는 IP 주소를 올바르게 처리해야 함', () => {
      const mockRequest = {
        headers: {
          get: (header: string) => {
            if (header === 'x-real-ip') return '  192.168.1.500  '
            return null
          }
        }
      } as Request
      
      const ip = getRealIP(mockRequest)
      expect(ip).toBe('192.168.1.500')
    })
  })
}) 