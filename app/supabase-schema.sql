-- Math Green Light Database Schema
-- Supabase SQL Editor에서 실행하세요

-- 1. Curriculum 테이블 (커리큘럼/유형 정보)
CREATE TABLE IF NOT EXISTS curriculum (
  id TEXT PRIMARY KEY,
  unit_id INTEGER NOT NULL,
  unit_name TEXT NOT NULL,
  type_name TEXT NOT NULL,
  image_url TEXT,
  youtube_url TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Progress 테이블 (학생 진척도)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  curriculum_id TEXT NOT NULL REFERENCES curriculum(id),
  status TEXT NOT NULL DEFAULT 'BLACK' CHECK (status IN ('BLACK', 'RED', 'BLUE', 'GREEN')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'student' CHECK (updated_by IN ('student', 'teacher')),
  UNIQUE(user_id, curriculum_id)
);

-- 3. 샘플 커리큘럼 데이터 삽입
INSERT INTO curriculum (id, unit_id, unit_name, type_name, image_url, youtube_url, "order") VALUES
-- 대단원 1: 수와 연산
('1-01', 1, '수와 연산', '자연수의 혼합 계산', NULL, 'https://youtu.be/example1', 1),
('1-02', 1, '수와 연산', '분수의 덧셈', NULL, 'https://youtu.be/example2', 2),
('1-03', 1, '수와 연산', '분수의 뺄셈', NULL, 'https://youtu.be/example3', 3),
('1-04', 1, '수와 연산', '분수의 곱셈', NULL, 'https://youtu.be/example4', 4),
('1-05', 1, '수와 연산', '분수의 나눗셈', NULL, 'https://youtu.be/example5', 5),
('1-06', 1, '수와 연산', '소수의 덧셈', NULL, 'https://youtu.be/example6', 6),
('1-07', 1, '수와 연산', '소수의 뺄셈', NULL, 'https://youtu.be/example7', 7),
('1-08', 1, '수와 연산', '소수의 곱셈', NULL, 'https://youtu.be/example8', 8),
('1-09', 1, '수와 연산', '소수의 나눗셈', NULL, 'https://youtu.be/example9', 9),
('1-10', 1, '수와 연산', '약수와 배수', NULL, 'https://youtu.be/example10', 10),
('1-11', 1, '수와 연산', '최대공약수', NULL, 'https://youtu.be/example11', 11),
('1-12', 1, '수와 연산', '최소공배수', NULL, 'https://youtu.be/example12', 12),
('1-13', 1, '수와 연산', '정수의 이해', NULL, 'https://youtu.be/example13', 13),
('1-14', 1, '수와 연산', '정수의 덧셈뺄셈', NULL, 'https://youtu.be/example14', 14),
('1-15', 1, '수와 연산', '유리수의 이해', NULL, 'https://youtu.be/example15', 15),
('1-16', 1, '수와 연산', '유리수의 계산', NULL, 'https://youtu.be/example16', 16),
-- 대단원 2: 문자와 식
('2-01', 2, '문자와 식', '문자의 사용', NULL, 'https://youtu.be/example17', 1),
('2-02', 2, '문자와 식', '식의 값', NULL, 'https://youtu.be/example18', 2),
('2-03', 2, '문자와 식', '일차식의 덧셈', NULL, 'https://youtu.be/example19', 3),
('2-04', 2, '문자와 식', '일차식의 뺄셈', NULL, 'https://youtu.be/example20', 4),
('2-05', 2, '문자와 식', '등식의 성질', NULL, 'https://youtu.be/example21', 5),
('2-06', 2, '문자와 식', '일차방정식 풀이', NULL, 'https://youtu.be/example22', 6),
('2-07', 2, '문자와 식', '일차방정식 활용1', NULL, 'https://youtu.be/example23', 7),
('2-08', 2, '문자와 식', '일차방정식 활용2', NULL, 'https://youtu.be/example24', 8),
('2-09', 2, '문자와 식', '부등식의 이해', NULL, 'https://youtu.be/example25', 9),
('2-10', 2, '문자와 식', '부등식의 성질', NULL, 'https://youtu.be/example26', 10),
('2-11', 2, '문자와 식', '일차부등식 풀이', NULL, 'https://youtu.be/example27', 11),
('2-12', 2, '문자와 식', '일차부등식 활용', NULL, 'https://youtu.be/example28', 12),
('2-13', 2, '문자와 식', '연립방정식의 이해', NULL, 'https://youtu.be/example29', 13),
('2-14', 2, '문자와 식', '연립방정식 풀이', NULL, 'https://youtu.be/example30', 14),
('2-15', 2, '문자와 식', '연립방정식 활용1', NULL, 'https://youtu.be/example31', 15),
('2-16', 2, '문자와 식', '연립방정식 활용2', NULL, 'https://youtu.be/example32', 16),
-- 대단원 3: 함수
('3-01', 3, '함수', '좌표평면의 이해', NULL, 'https://youtu.be/example33', 1),
('3-02', 3, '함수', '정비례 관계', NULL, 'https://youtu.be/example34', 2),
('3-03', 3, '함수', '반비례 관계', NULL, 'https://youtu.be/example35', 3),
('3-04', 3, '함수', '함수의 개념', NULL, 'https://youtu.be/example36', 4),
('3-05', 3, '함수', '함수값 구하기', NULL, 'https://youtu.be/example37', 5),
('3-06', 3, '함수', '일차함수의 뜻', NULL, 'https://youtu.be/example38', 6),
('3-07', 3, '함수', '일차함수 그래프', NULL, 'https://youtu.be/example39', 7),
('3-08', 3, '함수', '기울기와 y절편', NULL, 'https://youtu.be/example40', 8),
('3-09', 3, '함수', '일차함수 식 구하기', NULL, 'https://youtu.be/example41', 9),
('3-10', 3, '함수', '일차함수 활용', NULL, 'https://youtu.be/example42', 10),
('3-11', 3, '함수', '일차함수와 방정식', NULL, 'https://youtu.be/example43', 11),
('3-12', 3, '함수', '두 직선의 위치관계', NULL, 'https://youtu.be/example44', 12),
('3-13', 3, '함수', '연립방정식과 그래프', NULL, 'https://youtu.be/example45', 13),
('3-14', 3, '함수', '이차함수의 뜻', NULL, 'https://youtu.be/example46', 14),
('3-15', 3, '함수', '이차함수 그래프', NULL, 'https://youtu.be/example47', 15),
('3-16', 3, '함수', '이차함수 활용', NULL, 'https://youtu.be/example48', 16),
-- 대단원 4: 기하
('4-01', 4, '기하', '점 직선 면', NULL, 'https://youtu.be/example49', 1),
('4-02', 4, '기하', '각의 종류', NULL, 'https://youtu.be/example50', 2),
('4-03', 4, '기하', '맞꼭지각', NULL, 'https://youtu.be/example51', 3),
('4-04', 4, '기하', '평행선과 동위각', NULL, 'https://youtu.be/example52', 4),
('4-05', 4, '기하', '삼각형의 성질', NULL, 'https://youtu.be/example53', 5),
('4-06', 4, '기하', '삼각형의 합동', NULL, 'https://youtu.be/example54', 6),
('4-07', 4, '기하', '이등변삼각형', NULL, 'https://youtu.be/example55', 7),
('4-08', 4, '기하', '직각삼각형의 합동', NULL, 'https://youtu.be/example56', 8),
('4-09', 4, '기하', '사각형의 성질', NULL, 'https://youtu.be/example57', 9),
('4-10', 4, '기하', '평행사변형', NULL, 'https://youtu.be/example58', 10),
('4-11', 4, '기하', '여러 가지 사각형', NULL, 'https://youtu.be/example59', 11),
('4-12', 4, '기하', '닮음의 뜻', NULL, 'https://youtu.be/example60', 12),
('4-13', 4, '기하', '닮음비와 넓이비', NULL, 'https://youtu.be/example61', 13),
('4-14', 4, '기하', '피타고라스 정리', NULL, 'https://youtu.be/example62', 14),
('4-15', 4, '기하', '원의 성질', NULL, 'https://youtu.be/example63', 15),
('4-16', 4, '기하', '원의 넓이', NULL, 'https://youtu.be/example64', 16)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS (Row Level Security) 설정
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 커리큘럼은 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access to curriculum"
  ON curriculum FOR SELECT
  USING (true);

-- 진척도는 모든 사용자가 읽기/쓰기 가능 (MVP용 간단 설정)
CREATE POLICY "Allow public read access to user_progress"
  ON user_progress FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to user_progress"
  ON user_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to user_progress"
  ON user_progress FOR UPDATE
  USING (true);

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_curriculum_unit_id ON curriculum(unit_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_curriculum_id ON user_progress(curriculum_id);
