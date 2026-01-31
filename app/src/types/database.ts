export type StatusColor = 'BLACK' | 'RED' | 'BLUE' | 'GREEN';

// 역할 타입
export type UserRole = 'admin' | 'student' | 'parent' | 'pending';

// 커리큘럼 세트 (학년별/반별)
export interface CurriculumSet {
  id: string;
  name: string;
  order?: number;
  created_at: string;
}

// 커리큘럼 항목 (최대 10단계 깊이)
export interface CurriculumItem {
  id: string;
  set_id: string;
  parent_id: string | null;
  name: string;
  is_leaf: boolean;
  order: number;
  depth: number;
  created_at: string;
}

// 사용자 프로필
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  curriculum_id: string | null;
  linked_student_id: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  is_archived: boolean;
  archived_at: string | null;
}

// 학생별 진행 상태
export interface UserProgress {
  id: string;
  user_id: string;
  item_id: string;
  status: StatusColor;
  updated_at: string;
}

// 메모 (학생 메모 + 관리자 처방)
export interface CurriculumMemo {
  id: string;
  user_id: string;
  item_id: string;
  student_memo: string | null;
  admin_memo: string | null;
  youtube_url: string | null;
  updated_at: string;
}

// 역할별 권한
export const ROLE_PERMISSIONS = {
  admin: {
    canChangeStatus: true,
    canEditStudentMemo: false,
    canReadStudentMemo: true,
    canEditAdminMemo: true,
    canEditYoutube: true,
    canOpenDetail: true,
    canAccessAdmin: true,
    label: '관리자',
  },
  student: {
    canChangeStatus: true,
    canEditStudentMemo: true,
    canReadStudentMemo: true,
    canEditAdminMemo: false,
    canEditYoutube: false,
    canOpenDetail: true,
    canAccessAdmin: false,
    label: '학생',
  },
  parent: {
    canChangeStatus: false,
    canEditStudentMemo: false,
    canReadStudentMemo: false,
    canEditAdminMemo: false,
    canEditYoutube: false,
    canOpenDetail: false,
    canAccessAdmin: false,
    label: '학부모',
  },
  pending: {
    canChangeStatus: false,
    canEditStudentMemo: false,
    canReadStudentMemo: false,
    canEditAdminMemo: false,
    canEditYoutube: false,
    canOpenDetail: false,
    canAccessAdmin: false,
    label: '승인대기',
  },
} as const;

// 상태 설정 (Lucide 아이콘 사용)
export const STATUS_CONFIG: Record<StatusColor, { label: string; color: string; bgColor: string; textColor: string; icon: string }> = {
  BLACK: { label: '미학습', color: '#1F2937', bgColor: '#4B5563', textColor: '#FFFFFF', icon: 'Circle' },
  RED: { label: 'SOS', color: '#EF4444', bgColor: '#FECACA', textColor: '#B91C1C', icon: 'AlertCircle' },
  BLUE: { label: '연습', color: '#3B82F6', bgColor: '#BFDBFE', textColor: '#1E40AF', icon: 'PlayCircle' },
  GREEN: { label: '마스터', color: '#10B981', bgColor: '#A7F3D0', textColor: '#065F46', icon: 'CheckCircle' },
};

// 단원 그룹 (빙고판 표시용)
export interface UnitGroup {
  id: string;
  name: string;
  items: CurriculumItem[];
  progress: number;
  total: number;
}

// 4x4 그리드 고정 (25개 초과 시에만 리스트 모드)
export function getGridSize(itemCount: number): { cols: number; rows: number } | 'list' {
  if (itemCount > 25) return 'list';
  return { cols: 4, rows: 4 };
}

// 학생 통계 (대시보드용)
export interface StudentStats {
  userId: string;
  userName: string;
  curriculumName: string;
  total: number;
  green: number;
  blue: number;
  red: number;
  black: number;
  progressPercent: number;
}

// SOS 항목 (대시보드용)
export interface SOSItem {
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  studentMemo: string | null;
}
