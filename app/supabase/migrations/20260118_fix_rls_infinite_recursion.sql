-- ===================================
-- Migration: Fix RLS Infinite Recursion
-- Date: 2026-01-18
-- Description: profiles 테이블의 RLS 정책에서 발생하는 무한재귀 문제 해결
--              SECURITY DEFINER 함수를 사용하여 admin 체크 시 RLS 우회
-- ===================================

-- 1. SECURITY DEFINER 함수 생성/업데이트
-- 이 함수들은 정의한 사용자(superuser)의 권한으로 실행되어 RLS를 우회함
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

-- 2. 모든 문제가 되는 정책 삭제
-- 이 정책들은 profiles 테이블을 서브쿼리로 조회하여 무한재귀 발생
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage curriculum_sets" ON curriculum_sets;
DROP POLICY IF EXISTS "Admins can manage curriculum_items" ON curriculum_items;
DROP POLICY IF EXISTS "Admins can view all progress" ON user_progress;
DROP POLICY IF EXISTS "Parents can view linked student progress" ON user_progress;
DROP POLICY IF EXISTS "Students and admins can update progress" ON user_progress;
DROP POLICY IF EXISTS "Admins can view all memos" ON curriculum_memos;
DROP POLICY IF EXISTS "Admins can update admin_memo" ON curriculum_memos;

-- 3. 새 정책 생성 (SECURITY DEFINER 함수 사용)

-- profiles 테이블
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- curriculum_sets 테이블
CREATE POLICY "Admins can manage curriculum_sets"
  ON curriculum_sets FOR ALL
  USING (is_admin());

-- curriculum_items 테이블
CREATE POLICY "Admins can manage curriculum_items"
  ON curriculum_items FOR ALL
  USING (is_admin());

-- user_progress 테이블
CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  USING (is_admin());

CREATE POLICY "Parents can view linked student progress"
  ON user_progress FOR SELECT
  USING (is_parent_of(user_id));

CREATE POLICY "Students and admins can update progress"
  ON user_progress FOR ALL
  USING (user_id = auth.uid() OR is_admin());

-- curriculum_memos 테이블
CREATE POLICY "Admins can view all memos"
  ON curriculum_memos FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update admin_memo"
  ON curriculum_memos FOR ALL
  USING (is_admin());
