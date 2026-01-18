import { CurriculumItem, CurriculumSet, CurriculumMemo, UserProgress, StatusColor, UnitGroup, Profile } from '@/types/database';

// 샘플 커리큘럼 세트
export const SAMPLE_CURRICULUM_SETS: CurriculumSet[] = [
  { id: 'math-grade7', name: '중1 수학', created_at: '' },
  { id: 'math-grade8', name: '중2 수학', created_at: '' },
  { id: 'math-grade6', name: '초6 수학', created_at: '' },
];

// 샘플 커리큘럼 항목 (중1 수학)
export const SAMPLE_CURRICULUM_ITEMS: CurriculumItem[] = [
  // 대단원 1: 수와 연산
  { id: '7-1', set_id: 'math-grade7', parent_id: null, name: '수와 연산', is_leaf: false, order: 1, depth: 1, created_at: '' },
  { id: '7-1-01', set_id: 'math-grade7', parent_id: '7-1', name: '자연수의 혼합 계산', is_leaf: true, order: 1, depth: 2, created_at: '' },
  { id: '7-1-02', set_id: 'math-grade7', parent_id: '7-1', name: '분수의 덧셈', is_leaf: true, order: 2, depth: 2, created_at: '' },
  { id: '7-1-03', set_id: 'math-grade7', parent_id: '7-1', name: '분수의 뺄셈', is_leaf: true, order: 3, depth: 2, created_at: '' },
  { id: '7-1-04', set_id: 'math-grade7', parent_id: '7-1', name: '분수의 곱셈', is_leaf: true, order: 4, depth: 2, created_at: '' },
  { id: '7-1-05', set_id: 'math-grade7', parent_id: '7-1', name: '분수의 나눗셈', is_leaf: true, order: 5, depth: 2, created_at: '' },
  { id: '7-1-06', set_id: 'math-grade7', parent_id: '7-1', name: '소수의 덧셈', is_leaf: true, order: 6, depth: 2, created_at: '' },
  { id: '7-1-07', set_id: 'math-grade7', parent_id: '7-1', name: '소수의 뺄셈', is_leaf: true, order: 7, depth: 2, created_at: '' },
  { id: '7-1-08', set_id: 'math-grade7', parent_id: '7-1', name: '소수의 곱셈', is_leaf: true, order: 8, depth: 2, created_at: '' },
  { id: '7-1-09', set_id: 'math-grade7', parent_id: '7-1', name: '소수의 나눗셈', is_leaf: true, order: 9, depth: 2, created_at: '' },
  { id: '7-1-10', set_id: 'math-grade7', parent_id: '7-1', name: '약수와 배수', is_leaf: true, order: 10, depth: 2, created_at: '' },
  { id: '7-1-11', set_id: 'math-grade7', parent_id: '7-1', name: '최대공약수', is_leaf: true, order: 11, depth: 2, created_at: '' },
  { id: '7-1-12', set_id: 'math-grade7', parent_id: '7-1', name: '최소공배수', is_leaf: true, order: 12, depth: 2, created_at: '' },
  { id: '7-1-13', set_id: 'math-grade7', parent_id: '7-1', name: '정수의 이해', is_leaf: true, order: 13, depth: 2, created_at: '' },
  { id: '7-1-14', set_id: 'math-grade7', parent_id: '7-1', name: '정수의 덧셈뺄셈', is_leaf: true, order: 14, depth: 2, created_at: '' },
  { id: '7-1-15', set_id: 'math-grade7', parent_id: '7-1', name: '유리수의 이해', is_leaf: true, order: 15, depth: 2, created_at: '' },
  { id: '7-1-16', set_id: 'math-grade7', parent_id: '7-1', name: '유리수의 계산', is_leaf: true, order: 16, depth: 2, created_at: '' },

  // 대단원 2: 문자와 식
  { id: '7-2', set_id: 'math-grade7', parent_id: null, name: '문자와 식', is_leaf: false, order: 2, depth: 1, created_at: '' },
  { id: '7-2-01', set_id: 'math-grade7', parent_id: '7-2', name: '문자의 사용', is_leaf: true, order: 1, depth: 2, created_at: '' },
  { id: '7-2-02', set_id: 'math-grade7', parent_id: '7-2', name: '식의 값', is_leaf: true, order: 2, depth: 2, created_at: '' },
  { id: '7-2-03', set_id: 'math-grade7', parent_id: '7-2', name: '일차식의 덧셈', is_leaf: true, order: 3, depth: 2, created_at: '' },
  { id: '7-2-04', set_id: 'math-grade7', parent_id: '7-2', name: '일차식의 뺄셈', is_leaf: true, order: 4, depth: 2, created_at: '' },
  { id: '7-2-05', set_id: 'math-grade7', parent_id: '7-2', name: '등식의 성질', is_leaf: true, order: 5, depth: 2, created_at: '' },
  { id: '7-2-06', set_id: 'math-grade7', parent_id: '7-2', name: '일차방정식 풀이', is_leaf: true, order: 6, depth: 2, created_at: '' },
  { id: '7-2-07', set_id: 'math-grade7', parent_id: '7-2', name: '일차방정식 활용1', is_leaf: true, order: 7, depth: 2, created_at: '' },
  { id: '7-2-08', set_id: 'math-grade7', parent_id: '7-2', name: '일차방정식 활용2', is_leaf: true, order: 8, depth: 2, created_at: '' },
  { id: '7-2-09', set_id: 'math-grade7', parent_id: '7-2', name: '부등식의 이해', is_leaf: true, order: 9, depth: 2, created_at: '' },
  { id: '7-2-10', set_id: 'math-grade7', parent_id: '7-2', name: '부등식의 성질', is_leaf: true, order: 10, depth: 2, created_at: '' },
  { id: '7-2-11', set_id: 'math-grade7', parent_id: '7-2', name: '일차부등식 풀이', is_leaf: true, order: 11, depth: 2, created_at: '' },
  { id: '7-2-12', set_id: 'math-grade7', parent_id: '7-2', name: '일차부등식 활용', is_leaf: true, order: 12, depth: 2, created_at: '' },
  { id: '7-2-13', set_id: 'math-grade7', parent_id: '7-2', name: '연립방정식의 이해', is_leaf: true, order: 13, depth: 2, created_at: '' },
  { id: '7-2-14', set_id: 'math-grade7', parent_id: '7-2', name: '연립방정식 풀이', is_leaf: true, order: 14, depth: 2, created_at: '' },
  { id: '7-2-15', set_id: 'math-grade7', parent_id: '7-2', name: '연립방정식 활용1', is_leaf: true, order: 15, depth: 2, created_at: '' },
  { id: '7-2-16', set_id: 'math-grade7', parent_id: '7-2', name: '연립방정식 활용2', is_leaf: true, order: 16, depth: 2, created_at: '' },

  // 대단원 3: 함수
  { id: '7-3', set_id: 'math-grade7', parent_id: null, name: '함수', is_leaf: false, order: 3, depth: 1, created_at: '' },
  { id: '7-3-01', set_id: 'math-grade7', parent_id: '7-3', name: '좌표평면의 이해', is_leaf: true, order: 1, depth: 2, created_at: '' },
  { id: '7-3-02', set_id: 'math-grade7', parent_id: '7-3', name: '정비례 관계', is_leaf: true, order: 2, depth: 2, created_at: '' },
  { id: '7-3-03', set_id: 'math-grade7', parent_id: '7-3', name: '반비례 관계', is_leaf: true, order: 3, depth: 2, created_at: '' },
  { id: '7-3-04', set_id: 'math-grade7', parent_id: '7-3', name: '함수의 개념', is_leaf: true, order: 4, depth: 2, created_at: '' },
  { id: '7-3-05', set_id: 'math-grade7', parent_id: '7-3', name: '함수값 구하기', is_leaf: true, order: 5, depth: 2, created_at: '' },
  { id: '7-3-06', set_id: 'math-grade7', parent_id: '7-3', name: '일차함수의 뜻', is_leaf: true, order: 6, depth: 2, created_at: '' },
  { id: '7-3-07', set_id: 'math-grade7', parent_id: '7-3', name: '일차함수 그래프', is_leaf: true, order: 7, depth: 2, created_at: '' },
  { id: '7-3-08', set_id: 'math-grade7', parent_id: '7-3', name: '기울기와 y절편', is_leaf: true, order: 8, depth: 2, created_at: '' },
  { id: '7-3-09', set_id: 'math-grade7', parent_id: '7-3', name: '일차함수 식 구하기', is_leaf: true, order: 9, depth: 2, created_at: '' },
  { id: '7-3-10', set_id: 'math-grade7', parent_id: '7-3', name: '일차함수 활용', is_leaf: true, order: 10, depth: 2, created_at: '' },
  { id: '7-3-11', set_id: 'math-grade7', parent_id: '7-3', name: '일차함수와 방정식', is_leaf: true, order: 11, depth: 2, created_at: '' },
  { id: '7-3-12', set_id: 'math-grade7', parent_id: '7-3', name: '두 직선의 위치관계', is_leaf: true, order: 12, depth: 2, created_at: '' },
  { id: '7-3-13', set_id: 'math-grade7', parent_id: '7-3', name: '연립방정식과 그래프', is_leaf: true, order: 13, depth: 2, created_at: '' },
  { id: '7-3-14', set_id: 'math-grade7', parent_id: '7-3', name: '이차함수의 뜻', is_leaf: true, order: 14, depth: 2, created_at: '' },
  { id: '7-3-15', set_id: 'math-grade7', parent_id: '7-3', name: '이차함수 그래프', is_leaf: true, order: 15, depth: 2, created_at: '' },
  { id: '7-3-16', set_id: 'math-grade7', parent_id: '7-3', name: '이차함수 활용', is_leaf: true, order: 16, depth: 2, created_at: '' },

  // 대단원 4: 기하
  { id: '7-4', set_id: 'math-grade7', parent_id: null, name: '기하', is_leaf: false, order: 4, depth: 1, created_at: '' },
  { id: '7-4-01', set_id: 'math-grade7', parent_id: '7-4', name: '점 직선 면', is_leaf: true, order: 1, depth: 2, created_at: '' },
  { id: '7-4-02', set_id: 'math-grade7', parent_id: '7-4', name: '각의 종류', is_leaf: true, order: 2, depth: 2, created_at: '' },
  { id: '7-4-03', set_id: 'math-grade7', parent_id: '7-4', name: '맞꼭지각', is_leaf: true, order: 3, depth: 2, created_at: '' },
  { id: '7-4-04', set_id: 'math-grade7', parent_id: '7-4', name: '평행선과 동위각', is_leaf: true, order: 4, depth: 2, created_at: '' },
  { id: '7-4-05', set_id: 'math-grade7', parent_id: '7-4', name: '삼각형의 성질', is_leaf: true, order: 5, depth: 2, created_at: '' },
  { id: '7-4-06', set_id: 'math-grade7', parent_id: '7-4', name: '삼각형의 합동', is_leaf: true, order: 6, depth: 2, created_at: '' },
  { id: '7-4-07', set_id: 'math-grade7', parent_id: '7-4', name: '이등변삼각형', is_leaf: true, order: 7, depth: 2, created_at: '' },
  { id: '7-4-08', set_id: 'math-grade7', parent_id: '7-4', name: '직각삼각형의 합동', is_leaf: true, order: 8, depth: 2, created_at: '' },
  { id: '7-4-09', set_id: 'math-grade7', parent_id: '7-4', name: '사각형의 성질', is_leaf: true, order: 9, depth: 2, created_at: '' },
  { id: '7-4-10', set_id: 'math-grade7', parent_id: '7-4', name: '평행사변형', is_leaf: true, order: 10, depth: 2, created_at: '' },
  { id: '7-4-11', set_id: 'math-grade7', parent_id: '7-4', name: '여러 가지 사각형', is_leaf: true, order: 11, depth: 2, created_at: '' },
  { id: '7-4-12', set_id: 'math-grade7', parent_id: '7-4', name: '닮음의 뜻', is_leaf: true, order: 12, depth: 2, created_at: '' },
  { id: '7-4-13', set_id: 'math-grade7', parent_id: '7-4', name: '닮음비와 넓이비', is_leaf: true, order: 13, depth: 2, created_at: '' },
  { id: '7-4-14', set_id: 'math-grade7', parent_id: '7-4', name: '피타고라스 정리', is_leaf: true, order: 14, depth: 2, created_at: '' },
  { id: '7-4-15', set_id: 'math-grade7', parent_id: '7-4', name: '원의 성질', is_leaf: true, order: 15, depth: 2, created_at: '' },
  { id: '7-4-16', set_id: 'math-grade7', parent_id: '7-4', name: '원의 넓이', is_leaf: true, order: 16, depth: 2, created_at: '' },
];

// 샘플 진행 상태 (테스트용)
export const SAMPLE_PROGRESS: Record<string, StatusColor> = {
  '7-1-01': 'GREEN',
  '7-1-02': 'GREEN',
  '7-1-03': 'BLUE',
  '7-1-04': 'RED',
  '7-1-05': 'GREEN',
  '7-1-06': 'BLUE',
  '7-1-07': 'BLUE',
  '7-1-08': 'GREEN',
  '7-1-09': 'RED',
  '7-1-10': 'GREEN',
  '7-1-11': 'BLACK',
  '7-1-12': 'BLACK',
  '7-1-13': 'BLACK',
  '7-1-14': 'BLACK',
  '7-1-15': 'BLACK',
  '7-1-16': 'BLACK',
  '7-2-01': 'GREEN',
  '7-2-02': 'GREEN',
  '7-2-03': 'BLUE',
  '7-2-04': 'GREEN',
  '7-2-05': 'GREEN',
  '7-2-06': 'GREEN',
  '7-2-07': 'BLUE',
  '7-2-08': 'BLUE',
  '7-2-09': 'RED',
  '7-2-10': 'BLACK',
  '7-2-11': 'BLACK',
  '7-2-12': 'BLACK',
  '7-2-13': 'BLACK',
  '7-2-14': 'BLACK',
  '7-2-15': 'BLACK',
  '7-2-16': 'BLACK',
};

// 샘플 메모 (학생 메모 + 관리자 처방)
export const SAMPLE_MEMOS: Record<string, Omit<CurriculumMemo, 'id' | 'user_id' | 'updated_at'>> = {
  '7-1-04': {
    item_id: '7-1-04',
    student_memo: '분수의 곱셈이 너무 어려워요. 특히 대분수 곱셈이 헷갈려요.',
    admin_memo: '대분수를 가분수로 바꾸는 연습부터 시작하세요. 아래 영상 참고!',
    youtube_url: 'https://youtu.be/example_fraction',
  },
  '7-1-09': {
    item_id: '7-1-09',
    student_memo: '소수점 위치가 자꾸 틀려요',
    admin_memo: null,
    youtube_url: null,
  },
  '7-2-09': {
    item_id: '7-2-09',
    student_memo: '부등호 방향이 헷갈려요',
    admin_memo: '음수를 곱하거나 나눌 때 부등호 방향이 바뀌는 것 기억하세요!',
    youtube_url: 'https://youtu.be/example_inequality',
  },
};

// 샘플 프로필 (데모용)
export const SAMPLE_PROFILES: Profile[] = [
  {
    id: 'demo-admin',
    email: 'admin@demo.com',
    name: '관리자',
    phone: null,
    role: 'admin',
    curriculum_id: null,
    linked_student_id: null,
    created_at: '',
    approved_at: '',
    approved_by: null,
    is_archived: false,
    archived_at: null,
  },
  // 학생 5명
  {
    id: 'student-1',
    email: 'minsu@demo.com',
    name: '김민수',
    phone: '010-1234-5678',
    role: 'student',
    curriculum_id: 'math-grade7',
    linked_student_id: null,
    created_at: '',
    approved_at: '',
    approved_by: 'demo-admin',
    is_archived: false,
    archived_at: null,
  },
  {
    id: 'student-2',
    email: 'jieun@demo.com',
    name: '이지은',
    phone: '010-2345-6789',
    role: 'student',
    curriculum_id: 'math-grade7',
    linked_student_id: null,
    created_at: '',
    approved_at: '',
    approved_by: 'demo-admin',
    is_archived: false,
    archived_at: null,
  },
  {
    id: 'student-3',
    email: 'junyoung@demo.com',
    name: '박준영',
    phone: '010-3456-7890',
    role: 'student',
    curriculum_id: 'math-grade8',
    linked_student_id: null,
    created_at: '',
    approved_at: '',
    approved_by: 'demo-admin',
    is_archived: false,
    archived_at: null,
  },
  {
    id: 'student-4',
    email: 'seoyeon@demo.com',
    name: '최서연',
    phone: '010-4567-8901',
    role: 'student',
    curriculum_id: 'math-grade7',
    linked_student_id: null,
    created_at: '',
    approved_at: '',
    approved_by: 'demo-admin',
    is_archived: false,
    archived_at: null,
  },
  {
    id: 'student-5',
    email: 'hojin@demo.com',
    name: '정호진',
    phone: '010-5678-9012',
    role: 'student',
    curriculum_id: 'math-grade6',
    linked_student_id: null,
    created_at: '',
    approved_at: '',
    approved_by: 'demo-admin',
    is_archived: false,
    archived_at: null,
  },
  // 학부모 1명
  {
    id: 'demo-parent',
    email: 'parent@demo.com',
    name: '김민수 학부모',
    phone: '010-8901-2345',
    role: 'parent',
    curriculum_id: null,
    linked_student_id: 'student-1',
    created_at: '',
    approved_at: '',
    approved_by: 'demo-admin',
    is_archived: false,
    archived_at: null,
  },
];

// 리프 노드만 필터링
export function getLeafItems(items: CurriculumItem[]): CurriculumItem[] {
  return items.filter(item => item.is_leaf);
}

// 부모 노드별로 그룹화 (빙고판 단원별 표시용)
export function getUnitGroups(items: CurriculumItem[], progress: Record<string, StatusColor>): UnitGroup[] {
  const parentItems = items.filter(item => !item.is_leaf && item.parent_id === null);

  return parentItems.map(parent => {
    const children = items.filter(item => item.parent_id === parent.id && item.is_leaf);
    const greenCount = children.filter(item => progress[item.id] === 'GREEN').length;

    return {
      id: parent.id,
      name: parent.name,
      items: children.sort((a, b) => a.order - b.order),
      progress: greenCount,
      total: children.length,
    };
  }).sort((a, b) => {
    const aOrder = items.find(i => i.id === a.id)?.order ?? 0;
    const bOrder = items.find(i => i.id === b.id)?.order ?? 0;
    return aOrder - bOrder;
  });
}

// 트리 구조로 변환 (커리큘럼 관리용)
export interface TreeNode extends CurriculumItem {
  children: TreeNode[];
}

export function buildTree(items: CurriculumItem[]): TreeNode[] {
  const itemMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // 모든 항목을 TreeNode로 변환
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // 부모-자식 관계 구축
  items.forEach(item => {
    const node = itemMap.get(item.id)!;
    if (item.parent_id === null) {
      roots.push(node);
    } else {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // 정렬
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(node => sortNodes(node.children));
  };
  sortNodes(roots);

  return roots;
}
