-- =============================================
-- Math Green Light 테스트 데이터 (개발 환경 전용)
-- =============================================
-- 이 SQL은 개발/테스트 목적으로만 사용하세요.
-- 실제 프로덕션 환경에서는 사용하지 마세요.
-- Supabase SQL Editor에서 실행

-- ===================================
-- 1. FK 제약 일시 비활성화 (테스트용)
-- ===================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ===================================
-- 2. 기존 테스트 데이터 삭제 (선택적)
-- ===================================
-- DELETE FROM curriculum_memos WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%@test.com');
-- DELETE FROM user_progress WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%@test.com');
-- DELETE FROM profiles WHERE email LIKE '%@test.com';

-- ===================================
-- 3. 테스트 학생 데이터 삽입 (승인됨)
-- ===================================
INSERT INTO profiles (id, email, name, phone, role, curriculum_id, created_at, approved_at) VALUES
  -- 중1 수학 학생들
  (gen_random_uuid(), 'kim.minsu@test.com', '김민수', '010-1234-5678', 'student', 'math-grade7', NOW() - INTERVAL '30 days', NOW() - INTERVAL '29 days'),
  (gen_random_uuid(), 'lee.jieun@test.com', '이지은', '010-2345-6789', 'student', 'math-grade7', NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'park.junhyuk@test.com', '박준혁', '010-3456-7890', 'student', 'math-grade7', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'choi.seoyeon@test.com', '최서연', '010-4567-8901', 'student', 'math-grade7', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), 'jung.woojin@test.com', '정우진', '010-5678-9012', 'student', 'math-grade7', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
  -- 중2 수학 학생들
  (gen_random_uuid(), 'han.yuna@test.com', '한유나', '010-6789-0123', 'student', 'math-grade8', NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
  (gen_random_uuid(), 'song.jihoon@test.com', '송지훈', '010-7890-1234', 'student', 'math-grade8', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days')
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 4. 승인 대기 사용자 데이터 삽입
-- ===================================
INSERT INTO profiles (id, email, name, role, curriculum_id, created_at) VALUES
  -- 승인 대기 중인 학생 후보
  (gen_random_uuid(), 'pending.student1@test.com', '신입생1', 'pending', NULL, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'pending.student2@test.com', '신입생2', 'pending', NULL, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'pending.student3@test.com', '신입생3', 'pending', NULL, NOW() - INTERVAL '3 hours'),
  -- 승인 대기 중인 학부모 후보
  (gen_random_uuid(), 'pending.parent1@test.com', '학부모A', 'pending', NULL, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'pending.parent2@test.com', '학부모B', 'pending', NULL, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ===================================
-- 5. 학부모 데이터 삽입 (학생과 연결됨)
-- ===================================
DO $$
DECLARE
  student1_id UUID;
  student2_id UUID;
BEGIN
  SELECT id INTO student1_id FROM profiles WHERE email = 'kim.minsu@test.com';
  SELECT id INTO student2_id FROM profiles WHERE email = 'lee.jieun@test.com';

  INSERT INTO profiles (id, email, name, phone, role, curriculum_id, linked_student_id, created_at, approved_at) VALUES
    (gen_random_uuid(), 'parent.kim@test.com', '김민수 어머니', '010-8901-2345', 'parent', NULL, student1_id, NOW() - INTERVAL '29 days', NOW() - INTERVAL '28 days'),
    (gen_random_uuid(), 'parent.lee@test.com', '이지은 아버지', '010-9012-3456', 'parent', NULL, student2_id, NOW() - INTERVAL '24 days', NOW() - INTERVAL '23 days')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ===================================
-- 6. 학생별 진행 상태 추가 (랜덤)
-- ===================================
DO $$
DECLARE
  s RECORD;
  items TEXT[] := ARRAY[
    '7-1-1-01', '7-1-1-02', '7-1-1-03', '7-1-1-04', '7-1-1-05', '7-1-1-06', '7-1-1-07',
    '7-1-2-01', '7-1-2-02', '7-1-2-03', '7-1-2-04', '7-1-2-05', '7-1-2-06', '7-1-2-07', '7-1-2-08', '7-1-2-09',
    '7-2-1-01', '7-2-1-02', '7-2-1-03', '7-2-1-04', '7-2-1-05',
    '7-2-2-01', '7-2-2-02', '7-2-2-03', '7-2-2-04', '7-2-2-05', '7-2-2-06', '7-2-2-07', '7-2-2-08',
    '7-3-1-01', '7-3-1-02', '7-3-1-03', '7-3-1-04',
    '7-3-2-01', '7-3-2-02', '7-3-2-03', '7-3-2-04', '7-3-2-05'
  ];
  item TEXT;
  random_status TEXT;
  progress_chance FLOAT;
BEGIN
  FOR s IN SELECT id, name FROM profiles WHERE role = 'student' AND curriculum_id = 'math-grade7'
  LOOP
    -- 학생마다 다른 진행률
    progress_chance := 0.3 + random() * 0.5; -- 30%~80% 진행률

    FOREACH item IN ARRAY items
    LOOP
      IF random() < progress_chance THEN
        -- 진행된 항목: GREEN 60%, BLUE 25%, RED 15%
        random_status := CASE
          WHEN random() < 0.6 THEN 'GREEN'
          WHEN random() < 0.85 THEN 'BLUE'
          ELSE 'RED'
        END;

        INSERT INTO user_progress (user_id, item_id, status)
        VALUES (s.id, item, random_status)
        ON CONFLICT (user_id, item_id) DO UPDATE SET status = EXCLUDED.status;
      END IF;
    END LOOP;

    RAISE NOTICE '[예시 데이터] % 학생 진행 상태 추가 완료', s.name;
  END LOOP;
END $$;

-- ===================================
-- 7. 샘플 학생 메모 추가 (RED/BLUE 상태)
-- ===================================
DO $$
DECLARE
  progress_record RECORD;
  student_memos TEXT[] := ARRAY[
    '이 부분이 어려워요 ㅠㅠ',
    '다시 설명해주세요!',
    '개념이 헷갈립니다',
    '문제 풀이가 잘 안돼요',
    '예제 더 필요해요',
    '이해가 안가요',
    '비슷한 문제 더 풀어보고 싶어요',
    '선생님 질문 있어요!'
  ];
  counter INT := 0;
BEGIN
  FOR progress_record IN
    SELECT up.user_id, up.item_id, p.name, up.status
    FROM user_progress up
    JOIN profiles p ON p.id = up.user_id
    WHERE up.status IN ('RED', 'BLUE')
    ORDER BY random()
    LIMIT 15
  LOOP
    counter := counter + 1;

    INSERT INTO curriculum_memos (user_id, item_id, student_memo, admin_memo)
    VALUES (
      progress_record.user_id,
      progress_record.item_id,
      student_memos[1 + floor(random() * array_length(student_memos, 1))::int],
      NULL
    )
    ON CONFLICT (user_id, item_id) DO UPDATE SET
      student_memo = EXCLUDED.student_memo;

    RAISE NOTICE '[예시 데이터] 학생 메모 추가 #%', counter;
  END LOOP;
END $$;

-- ===================================
-- 8. 샘플 관리자 처방 추가 (RED 상태)
-- ===================================
DO $$
DECLARE
  progress_record RECORD;
  admin_prescriptions TEXT[] := ARRAY[
    '교재 p.45~48 다시 풀어보세요',
    '개념 영상 한 번 더 시청 후 질문하세요',
    '유형 문제 10개 추가 연습 필요',
    '기본 개념부터 다시 복습하세요',
    '다음 수업 때 같이 풀어봐요',
    '오답노트 작성해오세요'
  ];
  youtube_urls TEXT[] := ARRAY[
    'https://youtu.be/dQw4w9WgXcQ',
    'https://youtu.be/example123',
    NULL,
    NULL
  ];
  counter INT := 0;
BEGIN
  FOR progress_record IN
    SELECT up.user_id, up.item_id, p.name
    FROM user_progress up
    JOIN profiles p ON p.id = up.user_id
    WHERE up.status = 'RED'
    ORDER BY random()
    LIMIT 8
  LOOP
    counter := counter + 1;

    UPDATE curriculum_memos
    SET
      admin_memo = admin_prescriptions[1 + floor(random() * array_length(admin_prescriptions, 1))::int],
      youtube_url = youtube_urls[1 + floor(random() * array_length(youtube_urls, 1))::int]
    WHERE user_id = progress_record.user_id AND item_id = progress_record.item_id;

    -- 메모가 없으면 새로 생성
    IF NOT FOUND THEN
      INSERT INTO curriculum_memos (user_id, item_id, admin_memo, youtube_url)
      VALUES (
        progress_record.user_id,
        progress_record.item_id,
        admin_prescriptions[1 + floor(random() * array_length(admin_prescriptions, 1))::int],
        youtube_urls[1 + floor(random() * array_length(youtube_urls, 1))::int]
      );
    END IF;

    RAISE NOTICE '[예시 데이터] 관리자 처방 추가 #%', counter;
  END LOOP;
END $$;

-- ===================================
-- 9. 결과 요약 확인
-- ===================================
SELECT '=== 예시 데이터 생성 완료 ===' as message;

SELECT '사용자 현황' as category, role, COUNT(*) as count
FROM profiles
WHERE email LIKE '%@test.com' OR role IN ('admin', 'student', 'parent', 'pending')
GROUP BY role
ORDER BY
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'student' THEN 2
    WHEN 'parent' THEN 3
    WHEN 'pending' THEN 4
  END;

SELECT '학생별 진행 현황' as category,
  p.name as student_name,
  cs.name as curriculum,
  COUNT(up.id) as total_progress,
  COUNT(CASE WHEN up.status = 'GREEN' THEN 1 END) as green,
  COUNT(CASE WHEN up.status = 'BLUE' THEN 1 END) as blue,
  COUNT(CASE WHEN up.status = 'RED' THEN 1 END) as red
FROM profiles p
LEFT JOIN curriculum_sets cs ON cs.id = p.curriculum_id
LEFT JOIN user_progress up ON up.user_id = p.id
WHERE p.role = 'student' AND p.email LIKE '%@test.com'
GROUP BY p.id, p.name, cs.name
ORDER BY p.name;

SELECT 'SOS 현황 (RED 상태)' as category, COUNT(*) as sos_count
FROM user_progress
WHERE status = 'RED';

SELECT '메모 현황' as category,
  COUNT(*) as total_memos,
  COUNT(student_memo) as student_memos,
  COUNT(admin_memo) as admin_prescriptions,
  COUNT(youtube_url) as youtube_links
FROM curriculum_memos;
