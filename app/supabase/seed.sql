-- Math Green Light 시드 데이터
-- Supabase SQL Editor에서 실행하세요

-- ===================================
-- 커리큘럼 세트 추가
-- ===================================
INSERT INTO curriculum_sets (id, name) VALUES
  ('math-grade7', '중1 수학'),
  ('math-grade8', '중2 수학'),
  ('math-grade9', '중3 수학'),
  ('math-elem6', '초6 수학')
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 중1 수학 커리큘럼 (3단계 중첩 구조)
-- ===================================

-- 기존 데이터 삭제 (재실행 시)
DELETE FROM curriculum_items WHERE set_id = 'math-grade7';

-- 대단원 1: 수와 연산
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-1', 'math-grade7', NULL, '수와 연산', false, 1, 1),
  -- 중단원 1-1: 소인수분해
  ('7-1-1', 'math-grade7', '7-1', '소인수분해', false, 1, 2),
  ('7-1-1-01', 'math-grade7', '7-1-1', '거듭제곱', true, 1, 3),
  ('7-1-1-02', 'math-grade7', '7-1-1', '소수와 합성수', true, 2, 3),
  ('7-1-1-03', 'math-grade7', '7-1-1', '소인수분해', true, 3, 3),
  ('7-1-1-04', 'math-grade7', '7-1-1', '최대공약수', true, 4, 3),
  ('7-1-1-05', 'math-grade7', '7-1-1', '최소공배수', true, 5, 3),
  ('7-1-1-06', 'math-grade7', '7-1-1', '최대공약수 활용', true, 6, 3),
  ('7-1-1-07', 'math-grade7', '7-1-1', '최소공배수 활용', true, 7, 3),
  -- 중단원 1-2: 정수와 유리수
  ('7-1-2', 'math-grade7', '7-1', '정수와 유리수', false, 2, 2),
  ('7-1-2-01', 'math-grade7', '7-1-2', '정수의 뜻', true, 1, 3),
  ('7-1-2-02', 'math-grade7', '7-1-2', '유리수의 뜻', true, 2, 3),
  ('7-1-2-03', 'math-grade7', '7-1-2', '수직선과 절댓값', true, 3, 3),
  ('7-1-2-04', 'math-grade7', '7-1-2', '정수의 덧셈', true, 4, 3),
  ('7-1-2-05', 'math-grade7', '7-1-2', '정수의 뺄셈', true, 5, 3),
  ('7-1-2-06', 'math-grade7', '7-1-2', '유리수의 덧셈뺄셈', true, 6, 3),
  ('7-1-2-07', 'math-grade7', '7-1-2', '정수의 곱셈', true, 7, 3),
  ('7-1-2-08', 'math-grade7', '7-1-2', '정수의 나눗셈', true, 8, 3),
  ('7-1-2-09', 'math-grade7', '7-1-2', '유리수의 곱셈나눗셈', true, 9, 3);

-- 대단원 2: 문자와 식
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-2', 'math-grade7', NULL, '문자와 식', false, 2, 1),
  -- 중단원 2-1: 문자의 사용과 식
  ('7-2-1', 'math-grade7', '7-2', '문자의 사용과 식', false, 1, 2),
  ('7-2-1-01', 'math-grade7', '7-2-1', '문자의 사용', true, 1, 3),
  ('7-2-1-02', 'math-grade7', '7-2-1', '식의 값', true, 2, 3),
  ('7-2-1-03', 'math-grade7', '7-2-1', '일차식의 계산', true, 3, 3),
  ('7-2-1-04', 'math-grade7', '7-2-1', '일차식의 덧셈', true, 4, 3),
  ('7-2-1-05', 'math-grade7', '7-2-1', '일차식의 뺄셈', true, 5, 3),
  -- 중단원 2-2: 일차방정식
  ('7-2-2', 'math-grade7', '7-2', '일차방정식', false, 2, 2),
  ('7-2-2-01', 'math-grade7', '7-2-2', '방정식과 항등식', true, 1, 3),
  ('7-2-2-02', 'math-grade7', '7-2-2', '등식의 성질', true, 2, 3),
  ('7-2-2-03', 'math-grade7', '7-2-2', '일차방정식 풀이', true, 3, 3),
  ('7-2-2-04', 'math-grade7', '7-2-2', '복잡한 일차방정식', true, 4, 3),
  ('7-2-2-05', 'math-grade7', '7-2-2', '일차방정식 활용 - 수', true, 5, 3),
  ('7-2-2-06', 'math-grade7', '7-2-2', '일차방정식 활용 - 나이', true, 6, 3),
  ('7-2-2-07', 'math-grade7', '7-2-2', '일차방정식 활용 - 거속시', true, 7, 3),
  ('7-2-2-08', 'math-grade7', '7-2-2', '일차방정식 활용 - 농도', true, 8, 3);

-- 대단원 3: 좌표평면과 그래프
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-3', 'math-grade7', NULL, '좌표평면과 그래프', false, 3, 1),
  -- 중단원 3-1: 좌표평면
  ('7-3-1', 'math-grade7', '7-3', '좌표평면', false, 1, 2),
  ('7-3-1-01', 'math-grade7', '7-3-1', '순서쌍', true, 1, 3),
  ('7-3-1-02', 'math-grade7', '7-3-1', '좌표평면의 뜻', true, 2, 3),
  ('7-3-1-03', 'math-grade7', '7-3-1', '점의 좌표', true, 3, 3),
  ('7-3-1-04', 'math-grade7', '7-3-1', '사분면', true, 4, 3),
  -- 중단원 3-2: 그래프
  ('7-3-2', 'math-grade7', '7-3', '그래프', false, 2, 2),
  ('7-3-2-01', 'math-grade7', '7-3-2', '정비례', true, 1, 3),
  ('7-3-2-02', 'math-grade7', '7-3-2', '정비례 그래프', true, 2, 3),
  ('7-3-2-03', 'math-grade7', '7-3-2', '반비례', true, 3, 3),
  ('7-3-2-04', 'math-grade7', '7-3-2', '반비례 그래프', true, 4, 3),
  ('7-3-2-05', 'math-grade7', '7-3-2', '정비례 반비례 활용', true, 5, 3);

-- 대단원 4: 기본 도형
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-4', 'math-grade7', NULL, '기본 도형', false, 4, 1),
  -- 중단원 4-1: 점 직선 평면
  ('7-4-1', 'math-grade7', '7-4', '점 직선 평면', false, 1, 2),
  ('7-4-1-01', 'math-grade7', '7-4-1', '점 직선 면', true, 1, 3),
  ('7-4-1-02', 'math-grade7', '7-4-1', '직선 반직선 선분', true, 2, 3),
  ('7-4-1-03', 'math-grade7', '7-4-1', '두 점 사이의 거리', true, 3, 3),
  ('7-4-1-04', 'math-grade7', '7-4-1', '각과 각의 크기', true, 4, 3),
  ('7-4-1-05', 'math-grade7', '7-4-1', '맞꼭지각', true, 5, 3),
  -- 중단원 4-2: 위치 관계
  ('7-4-2', 'math-grade7', '7-4', '위치 관계', false, 2, 2),
  ('7-4-2-01', 'math-grade7', '7-4-2', '점과 직선의 위치 관계', true, 1, 3),
  ('7-4-2-02', 'math-grade7', '7-4-2', '두 직선의 위치 관계', true, 2, 3),
  ('7-4-2-03', 'math-grade7', '7-4-2', '점과 평면의 위치 관계', true, 3, 3),
  ('7-4-2-04', 'math-grade7', '7-4-2', '직선과 평면의 위치 관계', true, 4, 3),
  ('7-4-2-05', 'math-grade7', '7-4-2', '두 평면의 위치 관계', true, 5, 3),
  -- 중단원 4-3: 평행선
  ('7-4-3', 'math-grade7', '7-4', '평행선', false, 3, 2),
  ('7-4-3-01', 'math-grade7', '7-4-3', '동위각', true, 1, 3),
  ('7-4-3-02', 'math-grade7', '7-4-3', '엇각', true, 2, 3),
  ('7-4-3-03', 'math-grade7', '7-4-3', '평행선의 성질', true, 3, 3),
  ('7-4-3-04', 'math-grade7', '7-4-3', '평행선 사이의 거리', true, 4, 3);

-- 대단원 5: 작도와 합동
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-5', 'math-grade7', NULL, '작도와 합동', false, 5, 1),
  -- 중단원 5-1: 삼각형의 작도
  ('7-5-1', 'math-grade7', '7-5', '삼각형의 작도', false, 1, 2),
  ('7-5-1-01', 'math-grade7', '7-5-1', '기본 작도', true, 1, 3),
  ('7-5-1-02', 'math-grade7', '7-5-1', '삼각형이 하나로 정해지는 조건', true, 2, 3),
  ('7-5-1-03', 'math-grade7', '7-5-1', '삼각형의 작도', true, 3, 3),
  -- 중단원 5-2: 삼각형의 합동
  ('7-5-2', 'math-grade7', '7-5', '삼각형의 합동', false, 2, 2),
  ('7-5-2-01', 'math-grade7', '7-5-2', '합동의 뜻', true, 1, 3),
  ('7-5-2-02', 'math-grade7', '7-5-2', 'SSS 합동', true, 2, 3),
  ('7-5-2-03', 'math-grade7', '7-5-2', 'SAS 합동', true, 3, 3),
  ('7-5-2-04', 'math-grade7', '7-5-2', 'ASA 합동', true, 4, 3);

-- 대단원 6: 다각형
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-6', 'math-grade7', NULL, '다각형', false, 6, 1),
  -- 중단원 6-1: 다각형
  ('7-6-1', 'math-grade7', '7-6', '다각형의 성질', false, 1, 2),
  ('7-6-1-01', 'math-grade7', '7-6-1', '다각형의 뜻', true, 1, 3),
  ('7-6-1-02', 'math-grade7', '7-6-1', '다각형의 대각선', true, 2, 3),
  ('7-6-1-03', 'math-grade7', '7-6-1', '삼각형의 내각', true, 3, 3),
  ('7-6-1-04', 'math-grade7', '7-6-1', '삼각형의 외각', true, 4, 3),
  ('7-6-1-05', 'math-grade7', '7-6-1', '다각형의 내각의 합', true, 5, 3),
  ('7-6-1-06', 'math-grade7', '7-6-1', '다각형의 외각의 합', true, 6, 3),
  -- 중단원 6-2: 원과 부채꼴
  ('7-6-2', 'math-grade7', '7-6', '원과 부채꼴', false, 2, 2),
  ('7-6-2-01', 'math-grade7', '7-6-2', '원의 구성 요소', true, 1, 3),
  ('7-6-2-02', 'math-grade7', '7-6-2', '부채꼴의 성질', true, 2, 3),
  ('7-6-2-03', 'math-grade7', '7-6-2', '부채꼴의 호의 길이', true, 3, 3),
  ('7-6-2-04', 'math-grade7', '7-6-2', '부채꼴의 넓이', true, 4, 3);

-- ===================================
-- 테스트용 학생 프로필 (관리자가 수동으로 생성)
-- 주의: 실제 auth.users가 있어야 FK 제약 통과
-- Supabase Dashboard > Authentication에서 먼저 사용자 생성 필요
-- ===================================

-- 테스트 관리자 프로필 업데이트 예시 (실제 사용자 ID로 교체)
-- UPDATE profiles SET role = 'admin', curriculum_id = NULL WHERE email = 'admin@example.com';

-- 테스트 학생 프로필 업데이트 예시 (실제 사용자 ID로 교체)
-- UPDATE profiles SET role = 'student', curriculum_id = 'math-grade7' WHERE email = 'student1@example.com';
-- UPDATE profiles SET role = 'student', curriculum_id = 'math-grade7' WHERE email = 'student2@example.com';
-- UPDATE profiles SET role = 'student', curriculum_id = 'math-grade8' WHERE email = 'student3@example.com';

-- ===================================
-- 샘플 진행 상태 (테스트용)
-- 실제 user_id로 교체 필요
-- ===================================

-- 예시: 특정 학생의 진행 상태 추가
-- INSERT INTO user_progress (user_id, item_id, status) VALUES
--   ('실제-유저-UUID', '7-1-1-01', 'GREEN'),
--   ('실제-유저-UUID', '7-1-1-02', 'GREEN'),
--   ('실제-유저-UUID', '7-1-1-03', 'BLUE'),
--   ('실제-유저-UUID', '7-1-1-04', 'RED'),
--   ('실제-유저-UUID', '7-1-1-05', 'BLACK')
-- ON CONFLICT (user_id, item_id) DO UPDATE SET status = EXCLUDED.status;

-- ===================================
-- 현재 로그인한 사용자를 관리자로 설정 (처음 한 번만)
-- ===================================

-- 첫 번째 사용자를 관리자로 설정 (필요시 사용)
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM profiles ORDER BY created_at LIMIT 1);

-- ===================================
-- 현재 로그인한 사용자에게 커리큘럼 배정
-- ===================================

-- 로그인한 사용자를 학생으로 설정하고 커리큘럼 배정
-- UPDATE profiles
-- SET role = 'student', curriculum_id = 'math-grade7'
-- WHERE email = 'your-email@example.com';
