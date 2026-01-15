import { Curriculum, UserProgress, StatusColor } from '@/types/database';

export const SAMPLE_CURRICULUM: Curriculum[] = [
  // 대단원 1: 수와 연산
  { id: '1-01', unit_id: 1, unit_name: '수와 연산', type_name: '자연수의 혼합 계산', image_url: null, youtube_url: 'https://youtu.be/example1', order: 1, created_at: '' },
  { id: '1-02', unit_id: 1, unit_name: '수와 연산', type_name: '분수의 덧셈', image_url: null, youtube_url: 'https://youtu.be/example2', order: 2, created_at: '' },
  { id: '1-03', unit_id: 1, unit_name: '수와 연산', type_name: '분수의 뺄셈', image_url: null, youtube_url: 'https://youtu.be/example3', order: 3, created_at: '' },
  { id: '1-04', unit_id: 1, unit_name: '수와 연산', type_name: '분수의 곱셈', image_url: null, youtube_url: 'https://youtu.be/example4', order: 4, created_at: '' },
  { id: '1-05', unit_id: 1, unit_name: '수와 연산', type_name: '분수의 나눗셈', image_url: null, youtube_url: 'https://youtu.be/example5', order: 5, created_at: '' },
  { id: '1-06', unit_id: 1, unit_name: '수와 연산', type_name: '소수의 덧셈', image_url: null, youtube_url: 'https://youtu.be/example6', order: 6, created_at: '' },
  { id: '1-07', unit_id: 1, unit_name: '수와 연산', type_name: '소수의 뺄셈', image_url: null, youtube_url: 'https://youtu.be/example7', order: 7, created_at: '' },
  { id: '1-08', unit_id: 1, unit_name: '수와 연산', type_name: '소수의 곱셈', image_url: null, youtube_url: 'https://youtu.be/example8', order: 8, created_at: '' },
  { id: '1-09', unit_id: 1, unit_name: '수와 연산', type_name: '소수의 나눗셈', image_url: null, youtube_url: 'https://youtu.be/example9', order: 9, created_at: '' },
  { id: '1-10', unit_id: 1, unit_name: '수와 연산', type_name: '약수와 배수', image_url: null, youtube_url: 'https://youtu.be/example10', order: 10, created_at: '' },
  { id: '1-11', unit_id: 1, unit_name: '수와 연산', type_name: '최대공약수', image_url: null, youtube_url: 'https://youtu.be/example11', order: 11, created_at: '' },
  { id: '1-12', unit_id: 1, unit_name: '수와 연산', type_name: '최소공배수', image_url: null, youtube_url: 'https://youtu.be/example12', order: 12, created_at: '' },
  { id: '1-13', unit_id: 1, unit_name: '수와 연산', type_name: '정수의 이해', image_url: null, youtube_url: 'https://youtu.be/example13', order: 13, created_at: '' },
  { id: '1-14', unit_id: 1, unit_name: '수와 연산', type_name: '정수의 덧셈뺄셈', image_url: null, youtube_url: 'https://youtu.be/example14', order: 14, created_at: '' },
  { id: '1-15', unit_id: 1, unit_name: '수와 연산', type_name: '유리수의 이해', image_url: null, youtube_url: 'https://youtu.be/example15', order: 15, created_at: '' },
  { id: '1-16', unit_id: 1, unit_name: '수와 연산', type_name: '유리수의 계산', image_url: null, youtube_url: 'https://youtu.be/example16', order: 16, created_at: '' },

  // 대단원 2: 문자와 식
  { id: '2-01', unit_id: 2, unit_name: '문자와 식', type_name: '문자의 사용', image_url: null, youtube_url: 'https://youtu.be/example17', order: 1, created_at: '' },
  { id: '2-02', unit_id: 2, unit_name: '문자와 식', type_name: '식의 값', image_url: null, youtube_url: 'https://youtu.be/example18', order: 2, created_at: '' },
  { id: '2-03', unit_id: 2, unit_name: '문자와 식', type_name: '일차식의 덧셈', image_url: null, youtube_url: 'https://youtu.be/example19', order: 3, created_at: '' },
  { id: '2-04', unit_id: 2, unit_name: '문자와 식', type_name: '일차식의 뺄셈', image_url: null, youtube_url: 'https://youtu.be/example20', order: 4, created_at: '' },
  { id: '2-05', unit_id: 2, unit_name: '문자와 식', type_name: '등식의 성질', image_url: null, youtube_url: 'https://youtu.be/example21', order: 5, created_at: '' },
  { id: '2-06', unit_id: 2, unit_name: '문자와 식', type_name: '일차방정식 풀이', image_url: null, youtube_url: 'https://youtu.be/example22', order: 6, created_at: '' },
  { id: '2-07', unit_id: 2, unit_name: '문자와 식', type_name: '일차방정식 활용1', image_url: null, youtube_url: 'https://youtu.be/example23', order: 7, created_at: '' },
  { id: '2-08', unit_id: 2, unit_name: '문자와 식', type_name: '일차방정식 활용2', image_url: null, youtube_url: 'https://youtu.be/example24', order: 8, created_at: '' },
  { id: '2-09', unit_id: 2, unit_name: '문자와 식', type_name: '부등식의 이해', image_url: null, youtube_url: 'https://youtu.be/example25', order: 9, created_at: '' },
  { id: '2-10', unit_id: 2, unit_name: '문자와 식', type_name: '부등식의 성질', image_url: null, youtube_url: 'https://youtu.be/example26', order: 10, created_at: '' },
  { id: '2-11', unit_id: 2, unit_name: '문자와 식', type_name: '일차부등식 풀이', image_url: null, youtube_url: 'https://youtu.be/example27', order: 11, created_at: '' },
  { id: '2-12', unit_id: 2, unit_name: '문자와 식', type_name: '일차부등식 활용', image_url: null, youtube_url: 'https://youtu.be/example28', order: 12, created_at: '' },
  { id: '2-13', unit_id: 2, unit_name: '문자와 식', type_name: '연립방정식의 이해', image_url: null, youtube_url: 'https://youtu.be/example29', order: 13, created_at: '' },
  { id: '2-14', unit_id: 2, unit_name: '문자와 식', type_name: '연립방정식 풀이', image_url: null, youtube_url: 'https://youtu.be/example30', order: 14, created_at: '' },
  { id: '2-15', unit_id: 2, unit_name: '문자와 식', type_name: '연립방정식 활용1', image_url: null, youtube_url: 'https://youtu.be/example31', order: 15, created_at: '' },
  { id: '2-16', unit_id: 2, unit_name: '문자와 식', type_name: '연립방정식 활용2', image_url: null, youtube_url: 'https://youtu.be/example32', order: 16, created_at: '' },

  // 대단원 3: 함수
  { id: '3-01', unit_id: 3, unit_name: '함수', type_name: '좌표평면의 이해', image_url: null, youtube_url: 'https://youtu.be/example33', order: 1, created_at: '' },
  { id: '3-02', unit_id: 3, unit_name: '함수', type_name: '정비례 관계', image_url: null, youtube_url: 'https://youtu.be/example34', order: 2, created_at: '' },
  { id: '3-03', unit_id: 3, unit_name: '함수', type_name: '반비례 관계', image_url: null, youtube_url: 'https://youtu.be/example35', order: 3, created_at: '' },
  { id: '3-04', unit_id: 3, unit_name: '함수', type_name: '함수의 개념', image_url: null, youtube_url: 'https://youtu.be/example36', order: 4, created_at: '' },
  { id: '3-05', unit_id: 3, unit_name: '함수', type_name: '함수값 구하기', image_url: null, youtube_url: 'https://youtu.be/example37', order: 5, created_at: '' },
  { id: '3-06', unit_id: 3, unit_name: '함수', type_name: '일차함수의 뜻', image_url: null, youtube_url: 'https://youtu.be/example38', order: 6, created_at: '' },
  { id: '3-07', unit_id: 3, unit_name: '함수', type_name: '일차함수 그래프', image_url: null, youtube_url: 'https://youtu.be/example39', order: 7, created_at: '' },
  { id: '3-08', unit_id: 3, unit_name: '함수', type_name: '기울기와 y절편', image_url: null, youtube_url: 'https://youtu.be/example40', order: 8, created_at: '' },
  { id: '3-09', unit_id: 3, unit_name: '함수', type_name: '일차함수 식 구하기', image_url: null, youtube_url: 'https://youtu.be/example41', order: 9, created_at: '' },
  { id: '3-10', unit_id: 3, unit_name: '함수', type_name: '일차함수 활용', image_url: null, youtube_url: 'https://youtu.be/example42', order: 10, created_at: '' },
  { id: '3-11', unit_id: 3, unit_name: '함수', type_name: '일차함수와 방정식', image_url: null, youtube_url: 'https://youtu.be/example43', order: 11, created_at: '' },
  { id: '3-12', unit_id: 3, unit_name: '함수', type_name: '두 직선의 위치관계', image_url: null, youtube_url: 'https://youtu.be/example44', order: 12, created_at: '' },
  { id: '3-13', unit_id: 3, unit_name: '함수', type_name: '연립방정식과 그래프', image_url: null, youtube_url: 'https://youtu.be/example45', order: 13, created_at: '' },
  { id: '3-14', unit_id: 3, unit_name: '함수', type_name: '이차함수의 뜻', image_url: null, youtube_url: 'https://youtu.be/example46', order: 14, created_at: '' },
  { id: '3-15', unit_id: 3, unit_name: '함수', type_name: '이차함수 그래프', image_url: null, youtube_url: 'https://youtu.be/example47', order: 15, created_at: '' },
  { id: '3-16', unit_id: 3, unit_name: '함수', type_name: '이차함수 활용', image_url: null, youtube_url: 'https://youtu.be/example48', order: 16, created_at: '' },

  // 대단원 4: 기하
  { id: '4-01', unit_id: 4, unit_name: '기하', type_name: '점 직선 면', image_url: null, youtube_url: 'https://youtu.be/example49', order: 1, created_at: '' },
  { id: '4-02', unit_id: 4, unit_name: '기하', type_name: '각의 종류', image_url: null, youtube_url: 'https://youtu.be/example50', order: 2, created_at: '' },
  { id: '4-03', unit_id: 4, unit_name: '기하', type_name: '맞꼭지각', image_url: null, youtube_url: 'https://youtu.be/example51', order: 3, created_at: '' },
  { id: '4-04', unit_id: 4, unit_name: '기하', type_name: '평행선과 동위각', image_url: null, youtube_url: 'https://youtu.be/example52', order: 4, created_at: '' },
  { id: '4-05', unit_id: 4, unit_name: '기하', type_name: '삼각형의 성질', image_url: null, youtube_url: 'https://youtu.be/example53', order: 5, created_at: '' },
  { id: '4-06', unit_id: 4, unit_name: '기하', type_name: '삼각형의 합동', image_url: null, youtube_url: 'https://youtu.be/example54', order: 6, created_at: '' },
  { id: '4-07', unit_id: 4, unit_name: '기하', type_name: '이등변삼각형', image_url: null, youtube_url: 'https://youtu.be/example55', order: 7, created_at: '' },
  { id: '4-08', unit_id: 4, unit_name: '기하', type_name: '직각삼각형의 합동', image_url: null, youtube_url: 'https://youtu.be/example56', order: 8, created_at: '' },
  { id: '4-09', unit_id: 4, unit_name: '기하', type_name: '사각형의 성질', image_url: null, youtube_url: 'https://youtu.be/example57', order: 9, created_at: '' },
  { id: '4-10', unit_id: 4, unit_name: '기하', type_name: '평행사변형', image_url: null, youtube_url: 'https://youtu.be/example58', order: 10, created_at: '' },
  { id: '4-11', unit_id: 4, unit_name: '기하', type_name: '여러 가지 사각형', image_url: null, youtube_url: 'https://youtu.be/example59', order: 11, created_at: '' },
  { id: '4-12', unit_id: 4, unit_name: '기하', type_name: '닮음의 뜻', image_url: null, youtube_url: 'https://youtu.be/example60', order: 12, created_at: '' },
  { id: '4-13', unit_id: 4, unit_name: '기하', type_name: '닮음비와 넓이비', image_url: null, youtube_url: 'https://youtu.be/example61', order: 13, created_at: '' },
  { id: '4-14', unit_id: 4, unit_name: '기하', type_name: '피타고라스 정리', image_url: null, youtube_url: 'https://youtu.be/example62', order: 14, created_at: '' },
  { id: '4-15', unit_id: 4, unit_name: '기하', type_name: '원의 성질', image_url: null, youtube_url: 'https://youtu.be/example63', order: 15, created_at: '' },
  { id: '4-16', unit_id: 4, unit_name: '기하', type_name: '원의 넓이', image_url: null, youtube_url: 'https://youtu.be/example64', order: 16, created_at: '' },
];

// 샘플 진행 상태 (테스트용)
export const SAMPLE_PROGRESS: Record<string, StatusColor> = {
  '1-01': 'GREEN',
  '1-02': 'GREEN',
  '1-03': 'BLUE',
  '1-04': 'RED',
  '1-05': 'GREEN',
  '1-06': 'BLUE',
  '1-07': 'BLUE',
  '1-08': 'GREEN',
  '1-09': 'RED',
  '1-10': 'GREEN',
  '1-11': 'BLACK',
  '1-12': 'BLACK',
  '1-13': 'BLACK',
  '1-14': 'BLACK',
  '1-15': 'BLACK',
  '1-16': 'BLACK',
  '2-01': 'GREEN',
  '2-02': 'GREEN',
  '2-03': 'BLUE',
  '2-04': 'GREEN',
  '2-05': 'GREEN',
  '2-06': 'GREEN',
  '2-07': 'BLUE',
  '2-08': 'BLUE',
  '2-09': 'RED',
  '2-10': 'BLACK',
  '2-11': 'BLACK',
  '2-12': 'BLACK',
  '2-13': 'BLACK',
  '2-14': 'BLACK',
  '2-15': 'BLACK',
  '2-16': 'BLACK',
};

export function getUnitsWithProgress(curriculum: Curriculum[], progress: Record<string, StatusColor>) {
  const unitMap = new Map<number, { name: string; items: Curriculum[] }>();

  curriculum.forEach((item) => {
    if (!unitMap.has(item.unit_id)) {
      unitMap.set(item.unit_id, { name: item.unit_name, items: [] });
    }
    unitMap.get(item.unit_id)!.items.push(item);
  });

  return Array.from(unitMap.entries()).map(([id, data]) => {
    const greenCount = data.items.filter((item) => progress[item.id] === 'GREEN').length;
    return {
      id,
      name: data.name,
      items: data.items.sort((a, b) => a.order - b.order),
      progress: greenCount,
      total: data.items.length,
    };
  });
}
