import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_PROJECT_URL || ''
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || ''

// Supabase가 설정되어 있는지 확인
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseServiceKey)

// 클라이언트용 (브라우저) - 환경변수가 있을 때만 생성
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// 서버용 (관리자 권한) - 환경변수가 있을 때만 생성
export const supabaseAdmin = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// 데이터베이스 타입 정의
export interface UrlCache {
  id: number
  url_hash: string
  domain: string | null
  score: string
  highlights: any
  summary: string
  created_at: string
  expires_at: string
  hit_count: number
} 