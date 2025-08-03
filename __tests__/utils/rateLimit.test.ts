import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, getRealIP } from '@/utils/rateLimit'

describe('rateLimit utils', () => {
  beforeEach(() => {
    // 각 테스트 전에 환경변수 모킹 초기화
    vi.resetAllMocks()
  })

  afterEach(() => {
    // 각 테스트 후에 환경변수 모킹 정리
    vi.unstubAllEnvs()
  })

  describe('checkRateLimit', () => {
    it('프로덕션 환경에서 첫 번째 요청은 허용되어야 함', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const result = checkRateLimit('192.168.1.1')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9) // 프로덕션에서는 10회 제한
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('프로덕션 환경에서 11번째 요청은 거부되어야 함', () => {
      vi.stubEnv('NODE_ENV', 'production')
      
      // 10번 요청 후 11번째에서 거부되는지 확인
      const ip = '192.168.1.2'
      for (let i = 0; i < 10; i++) {
        checkRateLimit(ip)
      }
      
      const result = checkRateLimit(ip) // 11번째 요청
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('개발 환경에서 로컬 IP는 더 많은 요청 허용', () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubEnv('ALLOW_DEV_MODE', 'true')
      
      const result = checkRateLimit('127.0.0.1')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(49) // 개발환경에서는 50회 제한
    })

    it('개발 환경에서는 IP와 상관없이 50회 제한 적용', () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubEnv('ALLOW_DEV_MODE', 'true')
      
      const result = checkRateLimit('192.168.1.3')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(49) // 개발 환경이므로 50회 제한
    })

    it('NODE_ENV가 development여도 개발 모드가 활성화됨', () => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.stubEnv('ALLOW_DEV_MODE', 'false')
      
      // 다른 테스트와 충돌하지 않도록 다른 IP 사용
      const result = checkRateLimit('127.0.0.2')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(49) // NODE_ENV=development이므로 50회 제한
    })

    it('다른 IP는 독립적으로 처리되어야 함', () => {
      vi.stubEnv('NODE_ENV', 'production')
      checkRateLimit('192.168.1.4') // 첫 번째 IP에서 요청
      const result = checkRateLimit('192.168.1.5') // 다른 IP에서 요청
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('rate limit 정보가 올바르게 반환되어야 함', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const result = checkRateLimit('192.168.1.6')
      
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