import { RateLimitInfo } from './types'

// In-memory store (production에서는 Redis 등 사용)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24시간 (ms)
const RATE_LIMIT_MAX = 1 // 1회/일

export function checkRateLimit(ip: string): RateLimitInfo {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  const existing = rateLimitStore.get(key)
  
  // 리셋 시간이 지났거나 첫 요청인 경우
  if (!existing || now > existing.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(key, { count: 1, resetTime })
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime,
    }
  }
  
  // 제한 초과
  if (existing.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    }
  }
  
  // 요청 허용 및 카운트 증가
  existing.count += 1
  rateLimitStore.set(key, existing)
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - existing.count,
    resetTime: existing.resetTime,
  }
}

export function getRealIP(request: Request): string {
  // Edge runtime에서 IP 추출
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  // fallback
  return '127.0.0.1'
} 