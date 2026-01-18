-- =============================================
-- Math Green Light: 전화번호 컬럼 추가
-- =============================================
-- Supabase SQL Editor에서 실행하세요.

-- 1. profiles 테이블에 phone 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. 결과 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'phone';

-- 완료 메시지
SELECT '전화번호 컬럼 추가 완료' as message;
