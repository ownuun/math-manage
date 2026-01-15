export type StatusColor = 'BLACK' | 'RED' | 'BLUE' | 'GREEN';

export interface Curriculum {
  id: string;
  unit_id: number;
  unit_name: string;
  type_name: string;
  image_url: string | null;
  youtube_url: string | null;
  order: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  curriculum_id: string;
  status: StatusColor;
  updated_at: string;
  updated_by: 'student' | 'teacher';
}

export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'parent';
  linked_student_id: string | null;
  created_at: string;
}

export interface Unit {
  id: number;
  name: string;
  items: Curriculum[];
  progress: number;
  total: number;
}

export const STATUS_CONFIG: Record<StatusColor, { label: string; emoji: string; color: string; bgColor: string }> = {
  BLACK: { label: '미학습', emoji: '⚫', color: '#1F2937', bgColor: '#374151' },
  RED: { label: 'SOS', emoji: '🔴', color: '#EF4444', bgColor: '#FEE2E2' },
  BLUE: { label: '연습', emoji: '🔵', color: '#3B82F6', bgColor: '#DBEAFE' },
  GREEN: { label: '마스터', emoji: '🟢', color: '#10B981', bgColor: '#D1FAE5' },
};
