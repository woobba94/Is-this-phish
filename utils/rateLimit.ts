import { RateLimitInfo } from './types'

// In-memory store (production에서는 Redis 등 사용)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24시간 (ms)
const RATE_LIMIT_MAX = 10 // 10회/일로 증가
const DEV_RATE_LIMIT_MAX = 50 // 개발 환경에서 50회

/**
 * 개발 환경 감지 로직 개선
 */
function isDeveloperMode(): boolean {
  // 1. NODE_ENV가 development인 경우
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // 2. Vercel 프리뷰 배포인 경우 (dev 브랜치 등)
  if (process.env.VERCEL_ENV === 'preview') {
    return true
  }
  
  // 3. 개발용 환경변수가 설정된 경우
  if (process.env.ALLOW_DEV_MODE === 'true') {
    return true
  }
  
  // 4. 로컬 호스트명이나 개발 URL 패턴인 경우
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl && (vercelUrl.includes('localhost') || vercelUrl.includes('-dev-') || vercelUrl.includes('.vercel.app'))) {
    return true
  }
  
  return false
}

export function checkRateLimit(ip: string): RateLimitInfo {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  // 개발자 모드 체크 (개선된 로직)
  const isDevMode = isDeveloperMode()
  const currentLimit = isDevMode ? DEV_RATE_LIMIT_MAX : RATE_LIMIT_MAX
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Rate limit check - IP: ${ip}, DevMode: ${isDevMode}, Limit: ${currentLimit}`)
  }
  
  const existing = rateLimitStore.get(key)
  
  // 리셋 시간이 지났거나 첫 요청인 경우
  if (!existing || now > existing.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(key, { count: 1, resetTime })
    
    return {
      allowed: true,
      remaining: currentLimit - 1,
      resetTime,
    }
  }
  
  // 제한 초과
  if (existing.count >= currentLimit) {
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
    remaining: currentLimit - existing.count,
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