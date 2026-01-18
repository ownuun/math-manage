-- Math Green Light 빠른 테스트 설정
-- Supabase SQL Editor에서 실행하세요

-- ===================================
-- 1. 현재 로그인한 사용자를 관리자로 설정
-- ===================================
-- 먼저 본인 이메일로 로그인한 후 아래 실행

UPDATE profiles
SET role = 'admin'
WHERE email = '여기에_본인_이메일';

-- ===================================
-- 2. 테스트 학생 계정 설정
-- 먼저 Supabase Dashboard > Authentication에서
-- 테스트 사용자들을 생성하세요 (Google OAuth 또는 이메일)
-- ===================================

-- 학생1: 중1 수학 배정
UPDATE profiles
SET role = 'student',
    curriculum_id = 'math-grade7',
    name = '김철수'
WHERE email = 'student1@test.com';

-- 학생2: 중1 수학 배정
UPDATE profiles
SET role = 'student',
    curriculum_id = 'math-grade7',
    name = '이영희'
WHERE email = 'student2@test.com';

-- 학생3: 중2 수학 배정
UPDATE profiles
SET role = 'student',
    curriculum_id = 'math-grade8',
    name = '박민수'
WHERE email = 'student3@test.com';

-- ===================================
-- 3. 샘플 진행 상태 추가
-- ===================================

-- 김철수 학생의 진행 상태 (실제 UUID로 교체)
DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM profiles WHERE name = '김철수' LIMIT 1;

  IF student_id IS NOT NULL THEN
    INSERT INTO user_progress (user_id, item_id, status) VALUES
      (student_id, '7-1-1-01', 'GREEN'),
      (student_id, '7-1-1-02', 'GREEN'),
      (student_id, '7-1-1-03', 'GREEN'),
      (student_id, '7-1-1-04', 'BLUE'),
      (student_id, '7-1-1-05', 'BLUE'),
      (student_id, '7-1-1-06', 'RED'),
      (student_id, '7-1-1-07', 'BLACK'),
      (student_id, '7-1-2-01', 'GREEN'),
      (student_id, '7-1-2-02', 'BLUE'),
      (student_id, '7-1-2-03', 'RED')
    ON CONFLICT (user_id, item_id) DO UPDATE SET status = EXCLUDED.status;

    RAISE NOTICE '김철수 학생 진행 상태 추가 완료';
  ELSE
    RAISE NOTICE '김철수 학생을 찾을 수 없습니다';
  END IF;
END $$;

-- 이영희 학생의 진행 상태
DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM profiles WHERE name = '이영희' LIMIT 1;

  IF student_id IS NOT NULL THEN
    INSERT INTO user_progress (user_id, item_id, status) VALUES
      (student_id, '7-1-1-01', 'GREEN'),
      (student_id, '7-1-1-02', 'GREEN'),
      (student_id, '7-1-1-03', 'BLUE'),
      (student_id, '7-1-2-01', 'GREEN'),
      (student_id, '7-1-2-02', 'GREEN'),
      (student_id, '7-1-2-03', 'GREEN'),
      (student_id, '7-1-2-04', 'BLUE'),
      (student_id, '7-2-1-01', 'RED')
    ON CONFLICT (user_id, item_id) DO UPDATE SET status = EXCLUDED.status;

    RAISE NOTICE '이영희 학생 진행 상태 추가 완료';
  ELSE
    RAISE NOTICE '이영희 학생을 찾을 수 없습니다';
  END IF;
END $$;

-- ===================================
-- 4. 샘플 메모 추가
-- ===================================

DO $$
DECLARE
  student_id UUID;
BEGIN
  SELECT id INTO student_id FROM profiles WHERE name = '김철수' LIMIT 1;

  IF student_id IS NOT NULL THEN
    INSERT INTO curriculum_memos (user_id, item_id, student_memo, admin_memo, youtube_url) VALUES
      (student_id, '7-1-1-06', '아직 잘 모르겠어요', '교재 p.45 다시 풀어보세요', 'https://youtu.be/example1'),
      (student_id, '7-1-2-03', '절댓값 개념이 헷갈려요', '수직선 그려서 이해하기', NULL)
    ON CONFLICT (user_id, item_id) DO UPDATE SET
      student_memo = EXCLUDED.student_memo,
      admin_memo = EXCLUDED.admin_memo,
      youtube_url = EXCLUDED.youtube_url;

    RAISE NOTICE '김철수 학생 메모 추가 완료';
  END IF;
END $$;

-- ===================================
-- 5. 전체 학생 목록 확인
-- ===================================
SELECT
  p.name,
  p.email,
  p.role,
  cs.name as curriculum,
  p.created_at
FROM profiles p
LEFT JOIN curriculum_sets cs ON cs.id = p.curriculum_id
ORDER BY p.created_at DESC;
