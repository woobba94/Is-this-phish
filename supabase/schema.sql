-- URL 캐시 테이블 생성
CREATE TABLE IF NOT EXISTS url_cache (
    id BIGSERIAL PRIMARY KEY,
    url_hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 해시
    domain VARCHAR(255),                   -- 도메인 (통계용)
    score VARCHAR(20) NOT NULL,            -- 안전, 낮음, 보통, 위험, 매우위험
    highlights JSONB,                      -- 위험 요소들
    summary TEXT,                          -- 분석 요약
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hit_count INTEGER DEFAULT 1 NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_url_cache_url_hash ON url_cache(url_hash);
CREATE INDEX IF NOT EXISTS idx_url_cache_expires_at ON url_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_url_cache_domain ON url_cache(domain);
CREATE INDEX IF NOT EXISTS idx_url_cache_created_at ON url_cache(created_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE url_cache ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능 (읽기 전용)
CREATE POLICY "Anyone can view url_cache" ON url_cache
    FOR SELECT USING (true);

-- 만료된 캐시 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM url_cache 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 일일 정리 작업 (Supabase에서 수동으로 실행)
-- SELECT cron.schedule('cleanup-expired-cache', '0 0 * * *', 'SELECT cleanup_expired_cache();'); 