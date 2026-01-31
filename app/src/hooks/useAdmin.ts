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

  // 학부모-학생 연결 (레거시 - 단일 연결)
  const linkParentToStudent = useCallback(async (parentId: string, studentId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ linked_student_id: studentId })
        .eq('id', parentId);

      if (error) throw error;

      setProfiles(prev => prev.map(p =>
        p.id === parentId ? { ...p, linked_student_id: studentId } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error linking parent to student:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  const linkParentToStudents = useCallback(async (parentId: string, studentIds: string[]) => {
    try {
      await supabase
        .from('parent_student_links')
        .delete()
        .eq('parent_id', parentId);

      if (studentIds.length > 0) {
        const links = studentIds.map(studentId => ({
          parent_id: parentId,
          student_id: studentId,
        }));

        const { error } = await supabase
          .from('parent_student_links')
          .insert(links);

        if (error) throw error;
      }

      return { error: null };
    } catch (err) {
      console.error('Error linking parent to students:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  const getParentLinkedStudents = useCallback(async (parentId: string) => {
    try {
      const { data, error } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', parentId);

      if (error) throw error;

      return { data: data?.map(l => l.student_id) || [], error: null };
    } catch (err) {
      console.error('Error getting linked students:', err);
      return { data: [], error: err as Error };
    }
  }, [supabase]);

  const unlinkParentFromStudent = useCallback(async (parentId: string, studentId: string) => {
    try {
      const { error } = await supabase
        .from('parent_student_links')
        .delete()
        .eq('parent_id', parentId)
        .eq('student_id', studentId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      console.error('Error unlinking parent from student:', err);
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

  // 커리큘럼 세트 추가
  const addCurriculumSet = useCallback(async (name: string) => {
    try {
      const newSet = {
        id: `set-${Date.now()}`,
        name,
      };

      const { data, error } = await supabase
        .from('curriculum_sets')
        .insert(newSet)
        .select()
        .single();

      if (error) throw error;

      setCurriculumSets(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return { data, error: null };
    } catch (err) {
      console.error('Error adding curriculum set:', err);
      return { data: null, error: err as Error };
    }
  }, [supabase]);

  // 커리큘럼 세트 이름 변경
  const updateCurriculumSet = useCallback(async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('curriculum_sets')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setCurriculumSets(prev =>
        prev.map(set => set.id === id ? { ...set, name } : set)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      return { error: null };
    } catch (err) {
      console.error('Error updating curriculum set:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  // 커리큘럼 세트 삭제
  const deleteCurriculumSet = useCallback(async (id: string, deleteItems: boolean = false) => {
    try {
      if (deleteItems) {
        // 하위 항목도 함께 삭제
        await supabase
          .from('curriculum_items')
          .delete()
          .eq('set_id', id);
      }

      // 해당 커리큘럼을 사용하는 학생의 curriculum_id를 null로 변경
      await supabase
        .from('profiles')
        .update({ curriculum_id: null })
        .eq('curriculum_id', id);

      const { error } = await supabase
        .from('curriculum_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 로컬 상태 업데이트
      setCurriculumSets(prev => prev.filter(set => set.id !== id));
      if (deleteItems) {
        setCurriculumItems(prev => prev.filter(item => item.set_id !== id));
      }
      setProfiles(prev => prev.map(p =>
        p.curriculum_id === id ? { ...p, curriculum_id: null } : p
      ));

      return { error: null };
    } catch (err) {
      console.error('Error deleting curriculum set:', err);
      return { error: err as Error };
    }
  }, [supabase]);

  const moveCurriculumItem = useCallback(async (id: string, direction: 'up' | 'down') => {
    try {
      const item = curriculumItems.find(i => i.id === id);
      if (!item) return { error: new Error('Item not found') };

      const siblings = curriculumItems
        .filter(i => i.set_id === item.set_id && i.parent_id === item.parent_id)
        .sort((a, b) => a.order - b.order);

      const currentIndex = siblings.findIndex(s => s.id === id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= siblings.length) {
        return { error: null };
      }

      const targetItem = siblings[targetIndex];
      const currentOrder = item.order;
      const targetOrder = targetItem.order;

      await supabase.from('curriculum_items').update({ order: targetOrder }).eq('id', id);
      await supabase.from('curriculum_items').update({ order: currentOrder }).eq('id', targetItem.id);

      setCurriculumItems(prev => prev.map(i => {
        if (i.id === id) return { ...i, order: targetOrder };
        if (i.id === targetItem.id) return { ...i, order: currentOrder };
        return i;
      }));

      return { error: null };
    } catch (err) {
      console.error('Error moving curriculum item:', err);
      return { error: err as Error };
    }
  }, [supabase, curriculumItems]);

  const moveCurriculumSet = useCallback(async (id: string, direction: 'up' | 'down') => {
    try {
      const sortedSets = [...curriculumSets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const currentIndex = sortedSets.findIndex(s => s.id === id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= sortedSets.length) {
        return { error: null };
      }

      const currentSet = sortedSets[currentIndex];
      const targetSet = sortedSets[targetIndex];
      const currentOrder = currentSet.order ?? currentIndex;
      const targetOrder = targetSet.order ?? targetIndex;

      await supabase.from('curriculum_sets').update({ order: targetOrder }).eq('id', id);
      await supabase.from('curriculum_sets').update({ order: currentOrder }).eq('id', targetSet.id);

      setCurriculumSets(prev => prev.map(s => {
        if (s.id === id) return { ...s, order: targetOrder };
        if (s.id === targetSet.id) return { ...s, order: currentOrder };
        return s;
      }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));

      return { error: null };
    } catch (err) {
      console.error('Error moving curriculum set:', err);
      return { error: err as Error };
    }
  }, [supabase, curriculumSets]);

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
    addCurriculumSet,
    updateCurriculumSet,
    deleteCurriculumSet,
    moveCurriculumItem,
    moveCurriculumSet,
    linkParentToStudents,
    getParentLinkedStudents,
    unlinkParentFromStudent,
  };
}
