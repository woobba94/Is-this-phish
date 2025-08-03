import crypto from 'crypto'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'
import { AnalysisResult } from './types'

// URL을 SHA-256으로 해시화 (프라이버시 보호)
export function hashUrl(url: string): string {
  return crypto
    .createHash('sha256')
    .update(url.toLowerCase().trim())
    .digest('hex')
}

// URL에서 도메인 추출
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.toLowerCase().trim())
    return urlObj.hostname
  } catch {
    return 'unknown'
  }
}

// 캐시에서 URL 분석 결과 조회
export async function getCachedResult(url: string): Promise<AnalysisResult | null> {
  // Supabase가 설정되지 않은 경우 캐시 미사용
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return null
  }

  try {
    const urlHash = hashUrl(url)
    
    const { data, error } = await supabaseAdmin
      .from('url_cache')
      .select('score, highlights, summary, hit_count')
      .eq('url_hash', urlHash)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !data) {
      return null
    }
    
    // 조회수 증가
    await supabaseAdmin
      .from('url_cache')
      .update({ hit_count: data.hit_count + 1 })
      .eq('url_hash', urlHash)
    
    return {
      score: data.score as any,
      highlights: data.highlights || [],
      summary: data.summary
    }
  } catch (error) {
    console.error('Cache retrieval error:', error)
    return null
  }
}

// URL 분석 결과를 캐시에 저장
export async function setCachedResult(url: string, result: AnalysisResult): Promise<void> {
  // Supabase가 설정되지 않은 경우 캐시 미사용
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return
  }

  try {
    const urlHash = hashUrl(url)
    const domain = extractDomain(url)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
    
    const { error } = await supabaseAdmin
      .from('url_cache')
      .upsert({
        url_hash: urlHash,
        domain: domain,
        score: result.score,
        highlights: result.highlights,
        summary: result.summary,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'url_hash'
      })
    
    if (error) {
      console.error('Cache storage error:', error)
    }
  } catch (error) {
    console.error('Cache storage error:', error)
  }
}

// URL인지 확인하는 헬퍼 함수
export function isValidUrl(content: string): boolean {
  try {
    new URL(content.trim())
    return true
  } catch {
    return false
  }
}

// 캐시 통계 조회 (선택사항)
export async function getCacheStats() {
  // Supabase가 설정되지 않은 경우 null 반환
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('url_cache')
      .select('domain, score, hit_count, created_at')
      .gt('expires_at', new Date().toISOString())
      .order('hit_count', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Cache stats error:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Cache stats error:', error)
    return null
  }
} 