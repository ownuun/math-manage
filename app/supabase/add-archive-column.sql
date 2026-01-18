-- =============================================
-- Math Green Light: 보관 기능 추가
-- =============================================
-- Supabase SQL Editor에서 실행하세요.

-- 1. profiles 테이블에 is_archived 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- 2. archived_at 컬럼 추가 (보관 시점 기록)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- 3. 결과 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('is_archived', 'archived_at');

-- 완료 메시지
SELECT '보관 기능 컬럼 추가 완료' as message;
