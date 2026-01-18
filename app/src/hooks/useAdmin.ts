'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, CurriculumSet, CurriculumItem, StatusColor, StudentStats, SOSItem, UserRole } from '@/types/database';

export function useAdmin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [curriculumSets, setCurriculumSets] = useState<CurriculumSet[]>([]);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [sosItems, setSosItems] = useState<SOSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 데이터 로드
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 프로필 조회
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 커리큘럼 세트 조회
      const { data: setsData, error: setsError } = await supabase
        .from('curriculum_sets')
        .select('*')
        .order('name');

      if (setsError) throw setsError;

      // 커리큘럼 항목 조회
      const { data: itemsData, error: itemsError } = await supabase
        .from('curriculum_items')
        .select('*')
        .order('depth')
        .order('order');

      if (itemsError) throw itemsError;

      // 모든 진행 상태 조회
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*');

      if (progressError) throw progressError;

      // 모든 메모 조회
      const { data: memosData, error: memosError } = await supabase
        .from('curriculum_memos')
        .select('*');

      if (memosError) throw memosError;

      setProfiles(profilesData || []);
      setCurriculumSets(setsData || []);
      setCurriculumItems(itemsData || []);

      // 학생 통계 계산
      const students = (profilesData || []).filter(p => p.role === 'student');
      const leafItems = (itemsData || []).filter(item => item.is_leaf);

      const stats: StudentStats[] = students.map(student => {
        // 학생의 커리큘럼 항목만 필터링
        const studentLeafItems = leafItems.filter(item => item.set_id === student.curriculum_id);
        const studentProgress = (progressData || []).filter(p => p.user_id === student.id);

        const progressMap: Record<string, StatusColor> = {};
        studentProgress.forEach(p => {
          progressMap[p.item_id] = p.status as StatusColor;
        });

        const total = studentLeafItems.length;
        const green = studentLeafItems.filter(item => progressMap[item.id] === 'GREEN').length;
        const blue = studentLeafItems.filter(item => progressMap[item.id] === 'BLUE').length;
        const red = studentLeafItems.filter(item => progressMap[item.id] === 'RED').length;
        const black = total - green - blue - red;

        const curriculum = (setsData || []).find(s => s.id === student.curriculum_id);

        return {
          userId: student.id,
          userName: student.name,
          curriculumName: curriculum?.name || '미배정',
          total,
          green,
          blue,
          red,
          black,
          progressPercent: total > 0 ? Math.round((green / total) * 100) : 0,
        };
      });

      setStudentStats(stats);

      // SOS 항목 계산 (RED 상태인 항목)
      const sosItemsList: SOSItem[] = [];
      students.forEach(student => {
        const studentProgress = (progressData || []).filter(p => p.user_id === student.id && p.status === 'RED');
        const studentMemos = (memosData || []).filter(m => m.user_id === student.id);

        studentProgress.forEach(progress => {
          const item = leafItems.find(i => i.id === progress.item_id);
          const memo = studentMemos.find(m => m.item_id === progress.item_id);

          if (item) {
            sosItemsList.push({
              userId: student.id,
              userName: student.name,
              itemId: item.id,
              itemName: item.name,
              studentMemo: memo?.student_memo || null,
            });
          }
        });
      });

      setSosItems(sosItemsList);

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 사용자 승인
  const approveUser = useCallback(async (userId: string, role: UserRole, curriculumId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: Partial<Profile> = {
        role,
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
      };

      if (curriculumId) {
        updateData.curriculum_id = curriculumId;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, ...updateData } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error approving user:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 커리큘럼 배정
  const assignCurriculum = useCallback(async (userId: string, curriculumId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ curriculum_id: curriculumId })
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, curriculum_id: curriculumId } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error assigning curriculum:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 학부모-학생 연결
  const linkParentToStudent = useCallback(async (parentId: string, studentId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ linked_student_id: studentId })
        .eq('id', parentId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === parentId ? { ...p, linked_student_id: studentId } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error linking parent to student:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 전화번호 업데이트
  const updatePhone = useCallback(async (userId: string, phone: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, phone } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error updating phone:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 프로필 정보 업데이트 (이름, 전화번호)
  const updateProfile = useCallback(async (userId: string, updates: { name?: string; phone?: string | null }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, ...updates } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 사용자 삭제
  const deleteUser = useCallback(async (userId: string) => {
    try {
      // 먼저 관련 데이터 삭제 (curriculum_memos, user_progress)
      await supabase.from('curriculum_memos').delete().eq('user_id', userId);
      await supabase.from('user_progress').delete().eq('user_id', userId);

      // 프로필 삭제
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.filter(p => p.id !== userId));

      return { error: null };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 사용자 보관
  const archiveUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, is_archived: true, archived_at: new Date().toISOString() } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error archiving user:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 사용자 보관 해제
  const unarchiveUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_archived: false,
          archived_at: null,
        })
        .eq('id', userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, is_archived: false, archived_at: null } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error unarchiving user:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 처방 작성 (관리자 메모)
  const writePrescription = useCallback(async (
    userId: string,
    itemId: string,
    adminMemo: string,
    youtubeUrl?: string
  ) => {
    try {
      const { error } = await supabase
        .from('curriculum_memos')
        .upsert({
          user_id: userId,
          item_id: itemId,
          admin_memo: adminMemo,
          youtube_url: youtubeUrl || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,item_id',
        });

      if (error) throw error;

      return { error: null };
    } catch (err) {
      console.error('Error writing prescription:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 커리큘럼 항목 추가
  const addCurriculumItem = useCallback(async (item: Omit<CurriculumItem, 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('curriculum_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      setCurriculumItems(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding curriculum item:', err);
      return { data: null, error: err as Error };
    }
  }, [supabase]);

  // 커리큘럼 항목 수정
  const updateCurriculumItem = useCallback(async (id: string, updates: Partial<CurriculumItem>) => {
    try {
      const { error } = await supabase
        .from('curriculum_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setCurriculumItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ));

      return { error: null };
    } catch (err) {
      console.error('Error updating curriculum item:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 커리큘럼 항목 삭제
  const deleteCurriculumItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('curriculum_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 해당 항목과 하위 항목 모두 삭제
      const idsToRemove = new Set<string>();
      const collectIds = (parentId: string) => {
        idsToRemove.add(parentId);
        curriculumItems
          .filter(item => item.parent_id === parentId)
          .forEach(child => collectIds(child.id));
      };
      collectIds(id);

      setCurriculumItems(prev => prev.filter(item => !idsToRemove.has(item.id)));

      return { error: null };
    } catch (err) {
      console.error('Error deleting curriculum item:', err);
      return { error: err as Error };
    }
  }, [supabase, curriculumItems]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    profiles,
    curriculumSets,
    curriculumItems,
    studentStats,
    sosItems,
    loading,
    error,
    refetch: fetchData,
    approveUser,
    assignCurriculum,
    linkParentToStudent,
    updatePhone,
    updateProfile,
    deleteUser,
    archiveUser,
    unarchiveUser,
    writePrescription,
    addCurriculumItem,
    updateCurriculumItem,
    deleteCurriculumItem,
  };
}
