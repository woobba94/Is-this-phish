import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { checkRateLimit, getRealIP } from '@/utils/rateLimit'

describe('rateLimit utils', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // 각 테스트 전에 환경변수 초기화
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // 테스트 완료 후 원래 환경변수 복원
    process.env = originalEnv
  })

  describe('checkRateLimit', () => {
    it('프로덕션 환경에서 첫 번째 요청은 허용되어야 함', () => {
      process.env.NODE_ENV = 'production'
      const result = checkRateLimit('192.168.1.1')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0) // 프로덕션에서는 1회 제한
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('프로덕션 환경에서 두 번째 요청은 거부되어야 함', () => {
      process.env.NODE_ENV = 'production'
      checkRateLimit('192.168.1.1') // 첫 번째 요청
      const result = checkRateLimit('192.168.1.1') // 두 번째 요청
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('개발 환경에서 로컬 IP는 더 많은 요청 허용', () => {
      process.env.NODE_ENV = 'development'
      process.env.ALLOW_DEV_MODE = 'true'
      
      const result = checkRateLimit('127.0.0.1')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(49) // 개발환경에서는 50회 제한
    })

    it('개발 환경이어도 로컬 IP가 아니면 프로덕션 제한 적용', () => {
      process.env.NODE_ENV = 'development'
      process.env.ALLOW_DEV_MODE = 'true'
      
      const result = checkRateLimit('192.168.1.1')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0) // 로컬 IP가 아니므로 1회 제한
    })

    it('ALLOW_DEV_MODE가 false면 개발환경에서도 프로덕션 제한 적용', () => {
      process.env.NODE_ENV = 'development'
      process.env.ALLOW_DEV_MODE = 'false'
      
      const result = checkRateLimit('127.0.0.1')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0) // DEV_MODE가 비활성화되어 1회 제한
    })

    it('다른 IP는 독립적으로 처리되어야 함', () => {
      process.env.NODE_ENV = 'production'
      checkRateLimit('192.168.1.1') // 첫 번째 IP에서 요청
      const result = checkRateLimit('192.168.1.2') // 다른 IP에서 요청
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('rate limit 정보가 올바르게 반환되어야 함', () => {
      process.env.NODE_ENV = 'production'
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