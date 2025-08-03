import { RateLimitInfo } from './types'

// In-memory store (production에서는 Redis 등 사용)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24시간 (ms)
const RATE_LIMIT_MAX = 1 // 1회/일

// 개발 환경 전용 설정 (안전한 제한)
const DEV_RATE_LIMIT_MAX = 50 // 개발 환경에서도 하루 50회로 제한 (API 비용 보호)
const LOCAL_IPS = ['127.0.0.1', '::1', 'localhost']

/**
 * 안전한 개발자 모드 체크
 * - 프로덕션에서는 절대 우회 불가
 * - 로컬 개발환경에서만 제한 완화
 * - 개발환경에서도 적당한 제한 유지 (API 비용 보호)
 */
function isDeveloperMode(ip: string): boolean {
  // 1단계: 프로덕션 환경에서는 절대 우회 불가
  if (process.env.NODE_ENV === 'production') {
    return false
  }
  
  // 2단계: 개발환경이어도 로컬 IP가 아니면 우회 불가
  if (!LOCAL_IPS.includes(ip)) {
    return false
  }
  
  // 3단계: 추가 안전 장치 - 환경변수로 명시적 활성화 필요
  if (process.env.ALLOW_DEV_MODE !== 'true') {
    return false
  }
  
  return true
}

export function checkRateLimit(ip: string): RateLimitInfo {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  // 개발자 모드 체크 (다층 안전 검증)
  const isDevMode = isDeveloperMode(ip)
  const currentLimit = isDevMode ? DEV_RATE_LIMIT_MAX : RATE_LIMIT_MAX
  
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