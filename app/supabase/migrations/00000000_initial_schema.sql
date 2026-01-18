-- ===================================
-- Migration: Initial Schema
-- Date: 2026-01-18
-- Description: Math Green Light 초기 데이터베이스 스키마
-- ===================================

-- ===================================
-- 기존 테이블/뷰/트리거 삭제 (클린 설치)
-- ===================================
DROP VIEW IF EXISTS student_stats CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_parent_of(UUID) CASCADE;
DROP TABLE IF EXISTS curriculum_memos CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS curriculum_items CASCADE;
DROP TABLE IF EXISTS curriculum_sets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ===================================
-- 테이블 생성
-- ===================================

-- 1. 사용자 프로필 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'pending' CHECK (role IN ('pending', 'student', 'parent', 'admin')),
  curriculum_id TEXT,
  linked_student_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id)
);

-- 2. 커리큘럼 세트 (학년별/반별 커리큘럼)
CREATE TABLE IF NOT EXISTS curriculum_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 커리큘럼 항목 (최대 10단계 깊이, self-referencing)
CREATE TABLE IF NOT EXISTS curriculum_items (
  id TEXT PRIMARY KEY,
  set_id TEXT NOT NULL REFERENCES curriculum_sets(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES curriculum_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_leaf BOOLEAN DEFAULT false,
  "order" INTEGER NOT NULL,
  depth INTEGER NOT NULL DEFAULT 1 CHECK (depth <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- profiles의 curriculum_id FK 추가
ALTER TABLE profiles
  ADD CONSTRAINT fk_curriculum
  FOREIGN KEY (curriculum_id) REFERENCES curriculum_sets(id);

-- 4. 학생별 진행 상태 (리프 노드만)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES curriculum_items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'BLACK' CHECK (status IN ('BLACK', 'RED', 'BLUE', 'GREEN')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 5. 메모 (학생 메모 + 관리자 처방)
CREATE TABLE IF NOT EXISTS curriculum_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES curriculum_items(id) ON DELETE CASCADE,
  student_memo TEXT,
  admin_memo TEXT,
  youtube_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ===================================
-- 샘플 데이터 삽입
-- ===================================

-- 커리큘럼 세트
INSERT INTO curriculum_sets (id, name) VALUES
  ('math-grade7', '중1 수학'),
  ('math-grade8', '중2 수학'),
  ('math-grade6', '초6 수학')
ON CONFLICT (id) DO NOTHING;

-- 커리큘럼 항목 (중1 수학 - 4단원 × 16유형)
-- 대단원 1: 수와 연산
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-1', 'math-grade7', NULL, '수와 연산', false, 1, 1),
  ('7-1-01', 'math-grade7', '7-1', '자연수의 혼합 계산', true, 1, 2),
  ('7-1-02', 'math-grade7', '7-1', '분수의 덧셈', true, 2, 2),
  ('7-1-03', 'math-grade7', '7-1', '분수의 뺄셈', true, 3, 2),
  ('7-1-04', 'math-grade7', '7-1', '분수의 곱셈', true, 4, 2),
  ('7-1-05', 'math-grade7', '7-1', '분수의 나눗셈', true, 5, 2),
  ('7-1-06', 'math-grade7', '7-1', '소수의 덧셈', true, 6, 2),
  ('7-1-07', 'math-grade7', '7-1', '소수의 뺄셈', true, 7, 2),
  ('7-1-08', 'math-grade7', '7-1', '소수의 곱셈', true, 8, 2),
  ('7-1-09', 'math-grade7', '7-1', '소수의 나눗셈', true, 9, 2),
  ('7-1-10', 'math-grade7', '7-1', '약수와 배수', true, 10, 2),
  ('7-1-11', 'math-grade7', '7-1', '최대공약수', true, 11, 2),
  ('7-1-12', 'math-grade7', '7-1', '최소공배수', true, 12, 2),
  ('7-1-13', 'math-grade7', '7-1', '정수의 이해', true, 13, 2),
  ('7-1-14', 'math-grade7', '7-1', '정수의 덧셈뺄셈', true, 14, 2),
  ('7-1-15', 'math-grade7', '7-1', '유리수의 이해', true, 15, 2),
  ('7-1-16', 'math-grade7', '7-1', '유리수의 계산', true, 16, 2)
ON CONFLICT (id) DO NOTHING;

-- 대단원 2: 문자와 식
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-2', 'math-grade7', NULL, '문자와 식', false, 2, 1),
  ('7-2-01', 'math-grade7', '7-2', '문자의 사용', true, 1, 2),
  ('7-2-02', 'math-grade7', '7-2', '식의 값', true, 2, 2),
  ('7-2-03', 'math-grade7', '7-2', '일차식의 덧셈', true, 3, 2),
  ('7-2-04', 'math-grade7', '7-2', '일차식의 뺄셈', true, 4, 2),
  ('7-2-05', 'math-grade7', '7-2', '등식의 성질', true, 5, 2),
  ('7-2-06', 'math-grade7', '7-2', '일차방정식 풀이', true, 6, 2),
  ('7-2-07', 'math-grade7', '7-2', '일차방정식 활용1', true, 7, 2),
  ('7-2-08', 'math-grade7', '7-2', '일차방정식 활용2', true, 8, 2),
  ('7-2-09', 'math-grade7', '7-2', '부등식의 이해', true, 9, 2),
  ('7-2-10', 'math-grade7', '7-2', '부등식의 성질', true, 10, 2),
  ('7-2-11', 'math-grade7', '7-2', '일차부등식 풀이', true, 11, 2),
  ('7-2-12', 'math-grade7', '7-2', '일차부등식 활용', true, 12, 2),
  ('7-2-13', 'math-grade7', '7-2', '연립방정식의 이해', true, 13, 2),
  ('7-2-14', 'math-grade7', '7-2', '연립방정식 풀이', true, 14, 2),
  ('7-2-15', 'math-grade7', '7-2', '연립방정식 활용1', true, 15, 2),
  ('7-2-16', 'math-grade7', '7-2', '연립방정식 활용2', true, 16, 2)
ON CONFLICT (id) DO NOTHING;

-- 대단원 3: 함수
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-3', 'math-grade7', NULL, '함수', false, 3, 1),
  ('7-3-01', 'math-grade7', '7-3', '좌표평면의 이해', true, 1, 2),
  ('7-3-02', 'math-grade7', '7-3', '정비례 관계', true, 2, 2),
  ('7-3-03', 'math-grade7', '7-3', '반비례 관계', true, 3, 2),
  ('7-3-04', 'math-grade7', '7-3', '함수의 개념', true, 4, 2),
  ('7-3-05', 'math-grade7', '7-3', '함수값 구하기', true, 5, 2),
  ('7-3-06', 'math-grade7', '7-3', '일차함수의 뜻', true, 6, 2),
  ('7-3-07', 'math-grade7', '7-3', '일차함수 그래프', true, 7, 2),
  ('7-3-08', 'math-grade7', '7-3', '기울기와 y절편', true, 8, 2),
  ('7-3-09', 'math-grade7', '7-3', '일차함수 식 구하기', true, 9, 2),
  ('7-3-10', 'math-grade7', '7-3', '일차함수 활용', true, 10, 2),
  ('7-3-11', 'math-grade7', '7-3', '일차함수와 방정식', true, 11, 2),
  ('7-3-12', 'math-grade7', '7-3', '두 직선의 위치관계', true, 12, 2),
  ('7-3-13', 'math-grade7', '7-3', '연립방정식과 그래프', true, 13, 2),
  ('7-3-14', 'math-grade7', '7-3', '이차함수의 뜻', true, 14, 2),
  ('7-3-15', 'math-grade7', '7-3', '이차함수 그래프', true, 15, 2),
  ('7-3-16', 'math-grade7', '7-3', '이차함수 활용', true, 16, 2)
ON CONFLICT (id) DO NOTHING;

-- 대단원 4: 기하
INSERT INTO curriculum_items (id, set_id, parent_id, name, is_leaf, "order", depth) VALUES
  ('7-4', 'math-grade7', NULL, '기하', false, 4, 1),
  ('7-4-01', 'math-grade7', '7-4', '점 직선 면', true, 1, 2),
  ('7-4-02', 'math-grade7', '7-4', '각의 종류', true, 2, 2),
  ('7-4-03', 'math-grade7', '7-4', '맞꼭지각', true, 3, 2),
  ('7-4-04', 'math-grade7', '7-4', '평행선과 동위각', true, 4, 2),
  ('7-4-05', 'math-grade7', '7-4', '삼각형의 성질', true, 5, 2),
  ('7-4-06', 'math-grade7', '7-4', '삼각형의 합동', true, 6, 2),
  ('7-4-07', 'math-grade7', '7-4', '이등변삼각형', true, 7, 2),
  ('7-4-08', 'math-grade7', '7-4', '직각삼각형의 합동', true, 8, 2),
  ('7-4-09', 'math-grade7', '7-4', '사각형의 성질', true, 9, 2),
  ('7-4-10', 'math-grade7', '7-4', '평행사변형', true, 10, 2),
  ('7-4-11', 'math-grade7', '7-4', '여러 가지 사각형', true, 11, 2),
  ('7-4-12', 'math-grade7', '7-4', '닮음의 뜻', true, 12, 2),
  ('7-4-13', 'math-grade7', '7-4', '닮음비와 넓이비', true, 13, 2),
  ('7-4-14', 'math-grade7', '7-4', '피타고라스 정리', true, 14, 2),
  ('7-4-15', 'math-grade7', '7-4', '원의 성질', true, 15, 2),
  ('7-4-16', 'math-grade7', '7-4', '원의 넓이', true, 16, 2)
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- RLS (Row Level Security) 설정
-- ===================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_memos ENABLE ROW LEVEL SECURITY;

-- ===================================
-- SECURITY DEFINER 함수 (RLS 무한재귀 방지)
-- ===================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_parent_of(student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'parent'
      AND linked_student_id = student_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================
-- 프로필 정책
-- ===================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Trigger can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ===================================
-- 커리큘럼 정책
-- ===================================

CREATE POLICY "Authenticated users can read curriculum_sets"
  ON curriculum_sets FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read curriculum_items"
  ON curriculum_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage curriculum_sets"
  ON curriculum_sets FOR ALL
  USING (is_admin());

CREATE POLICY "Admins can manage curriculum_items"
  ON curriculum_items FOR ALL
  USING (is_admin());

-- ===================================
-- 진행 상태 정책
-- ===================================

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  USING (is_admin());

CREATE POLICY "Parents can view linked student progress"
  ON user_progress FOR SELECT
  USING (is_parent_of(user_id));

CREATE POLICY "Students and admins can update progress"
  ON user_progress FOR ALL
  USING (user_id = auth.uid() OR is_admin());

-- ===================================
-- 메모 정책
-- ===================================

CREATE POLICY "Users can view own memos"
  ON curriculum_memos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all memos"
  ON curriculum_memos FOR SELECT
  USING (is_admin());

CREATE POLICY "Students can update own student_memo"
  ON curriculum_memos FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update admin_memo"
  ON curriculum_memos FOR ALL
  USING (is_admin());

CREATE POLICY "Users can insert own memos"
  ON curriculum_memos FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ===================================
-- 인덱스 생성 (성능 최적화)
-- ===================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_curriculum ON profiles(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_items_set ON curriculum_items(set_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_items_parent ON curriculum_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_items_leaf ON curriculum_items(is_leaf);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_item ON user_progress(item_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_curriculum_memos_user ON curriculum_memos(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_memos_item ON curriculum_memos(item_id);

-- ===================================
-- 트리거: 프로필 자동 생성
-- ===================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===================================
-- 뷰: 학생 통계 (대시보드용)
-- ===================================

CREATE OR REPLACE VIEW student_stats AS
SELECT
  p.id as user_id,
  p.name as user_name,
  cs.name as curriculum_name,
  COUNT(ci.id) as total,
  COUNT(CASE WHEN up.status = 'GREEN' THEN 1 END) as green,
  COUNT(CASE WHEN up.status = 'BLUE' THEN 1 END) as blue,
  COUNT(CASE WHEN up.status = 'RED' THEN 1 END) as red,
  COUNT(CASE WHEN up.status = 'BLACK' OR up.status IS NULL THEN 1 END) as black,
  ROUND(
    COUNT(CASE WHEN up.status = 'GREEN' THEN 1 END)::numeric /
    NULLIF(COUNT(ci.id), 0) * 100,
    1
  ) as progress_percent
FROM profiles p
JOIN curriculum_sets cs ON cs.id = p.curriculum_id
JOIN curriculum_items ci ON ci.set_id = cs.id AND ci.is_leaf = true
LEFT JOIN user_progress up ON up.user_id = p.id AND up.item_id = ci.id
WHERE p.role = 'student'
GROUP BY p.id, p.name, cs.name;
