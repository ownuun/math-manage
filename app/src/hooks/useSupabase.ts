'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { CurriculumItem, CurriculumMemo, StatusColor, UnitGroup, CurriculumSet, Profile } from '@/types/database';

interface LinkedStudent {
  id: string;
  name: string;
}

export function useSupabase(targetUserId?: string) {
  const { user, profile } = useAuth();
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [curriculumSets, setCurriculumSets] = useState<CurriculumSet[]>([]);
  const [progress, setProgress] = useState<Record<string, StatusColor>>({});
  const [memos, setMemos] = useState<Record<string, CurriculumMemo>>({});
  const [units, setUnits] = useState<UnitGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const supabase = createClient();

  const isParent = profile?.role === 'parent';
  const userId = targetUserId || (isParent ? selectedStudentId : user?.id);

  const fetchLinkedStudents = useCallback(async () => {
    if (!isParent || !user?.id) return;

    try {
      const { data: linksData, error: linksError } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id);

      if (linksError) throw linksError;

      if (linksData && linksData.length > 0) {
        const studentIds = linksData.map(l => l.student_id);
        const { data: studentsData, error: studentsError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', studentIds);

        if (studentsError) throw studentsError;

        const students = (studentsData || []).map(s => ({ id: s.id, name: s.name }));
        setLinkedStudents(students);

        if (students.length > 0 && !selectedStudentId) {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('selectedStudentId') : null;
          const validSavedId = savedId && students.some(s => s.id === savedId);
          setSelectedStudentId(validSavedId ? savedId : students[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching linked students:', err);
    }
  }, [supabase, isParent, user?.id, selectedStudentId]);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (isParent && !selectedStudentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: setsData, error: setsError } = await supabase
        .from('curriculum_sets')
        .select('*')
        .order('order');

      if (setsError) throw setsError;
      setCurriculumSets(setsData || []);

      const { data: itemsData, error: itemsError } = await supabase
        .from('curriculum_items')
        .select('*')
        .order('depth')
        .order('order');

      if (itemsError) throw itemsError;

      // 진척도 조회
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('item_id, status')
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // 메모 조회
      const { data: memosData, error: memosError } = await supabase
        .from('curriculum_memos')
        .select('*')
        .eq('user_id', userId);

      if (memosError) throw memosError;

      // 데이터 설정
      setCurriculumItems(itemsData || []);

      // 진척도를 Record 형태로 변환
      const progressMap: Record<string, StatusColor> = {};
      progressData?.forEach((p) => {
        progressMap[p.item_id] = p.status as StatusColor;
      });
      setProgress(progressMap);

      // 메모를 Record 형태로 변환
      const memosMap: Record<string, CurriculumMemo> = {};
      memosData?.forEach((m) => {
        memosMap[m.item_id] = m;
      });
      setMemos(memosMap);

      // Units 계산 (부모 노드별 그룹화)
      // 재귀적으로 모든 하위 leaf 항목 찾기
      const getAllLeafChildren = (items: CurriculumItem[], parentId: string): CurriculumItem[] => {
        const directChildren = items.filter(item => item.parent_id === parentId);
        let allLeaves: CurriculumItem[] = [];

        directChildren.forEach(child => {
          if (child.is_leaf) {
            allLeaves.push(child);
          } else {
            // 폴더면 재귀적으로 탐색
            allLeaves = allLeaves.concat(getAllLeafChildren(items, child.id));
          }
        });

        return allLeaves;
      };

      const parentItems = (itemsData || []).filter(item => !item.is_leaf && item.parent_id === null);
      const unitsData: UnitGroup[] = parentItems.map(parent => {
        const children = getAllLeafChildren(itemsData || [], parent.id);
        const greenCount = children.filter(item => progressMap[item.id] === 'GREEN').length;

        return {
          id: parent.id,
          name: parent.name,
          items: children.sort((a, b) => a.order - b.order),
          progress: greenCount,
          total: children.length,
        };
      }).sort((a, b) => {
        const aOrder = (itemsData || []).find(i => i.id === a.id)?.order ?? 0;
        const bOrder = (itemsData || []).find(i => i.id === b.id)?.order ?? 0;
        return aOrder - bOrder;
      });

      setUnits(unitsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [supabase, userId, isParent, selectedStudentId, user?.id]);

  // 상태 업데이트
  const updateStatus = useCallback(
    async (itemId: string, status: StatusColor) => {
      if (!userId) return;

      try {
        // Optimistic update
        setProgress((prev) => ({ ...prev, [itemId]: status }));

        // Units 재계산
        setUnits((prevUnits) =>
          prevUnits.map((unit) => {
            const hasItem = unit.items.some((item) => item.id === itemId);
            if (!hasItem) return unit;

            const newProgress = { ...progress, [itemId]: status };
            const greenCount = unit.items.filter((item) => newProgress[item.id] === 'GREEN').length;
            return { ...unit, progress: greenCount };
          })
        );

        // Supabase upsert
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: userId,
            item_id: itemId,
            status,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,item_id',
          }
        );

        if (error) throw error;
      } catch (err) {
        console.error('Error updating status:', err);
        fetchData();
      }
    },
    [supabase, userId, progress, fetchData]
  );

  // 학생 메모 업데이트
  const updateStudentMemo = useCallback(
    async (itemId: string, studentMemo: string) => {
      if (!userId) return;

      try {
        const existingMemo = memos[itemId];

        // Optimistic update
        setMemos((prev) => ({
          ...prev,
          [itemId]: {
            ...existingMemo,
            id: existingMemo?.id || `memo-${itemId}`,
            user_id: userId,
            item_id: itemId,
            student_memo: studentMemo,
            admin_memo: existingMemo?.admin_memo || null,
            youtube_url: existingMemo?.youtube_url || null,
            updated_at: new Date().toISOString(),
          },
        }));

        // Supabase upsert
        const { error } = await supabase.from('curriculum_memos').upsert(
          {
            user_id: userId,
            item_id: itemId,
            student_memo: studentMemo,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,item_id',
          }
        );

        if (error) throw error;
      } catch (err) {
        console.error('Error updating student memo:', err);
      }
    },
    [supabase, userId, memos]
  );

  // 관리자 메모 업데이트 (targetUserId 사용)
  const updateAdminMemo = useCallback(
    async (itemId: string, adminMemo: string, youtubeUrl: string, forUserId?: string) => {
      const targetId = forUserId || userId;
      if (!targetId) return;

      try {
        const existingMemo = memos[itemId];

        // Optimistic update
        setMemos((prev) => ({
          ...prev,
          [itemId]: {
            ...existingMemo,
            id: existingMemo?.id || `memo-${itemId}`,
            user_id: targetId,
            item_id: itemId,
            student_memo: existingMemo?.student_memo || null,
            admin_memo: adminMemo,
            youtube_url: youtubeUrl || null,
            updated_at: new Date().toISOString(),
          },
        }));

        // Supabase upsert
        const { error } = await supabase.from('curriculum_memos').upsert(
          {
            user_id: targetId,
            item_id: itemId,
            admin_memo: adminMemo,
            youtube_url: youtubeUrl || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,item_id',
          }
        );

        if (error) throw error;
      } catch (err) {
        console.error('Error updating admin memo:', err);
      }
    },
    [supabase, userId, memos]
  );

  const selectStudent = useCallback((studentId: string) => {
    setSelectedStudentId(studentId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedStudentId', studentId);
    }
  }, []);

  useEffect(() => {
    if (isParent) {
      fetchLinkedStudents();
    }
  }, [isParent, fetchLinkedStudents]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    curriculumItems,
    curriculumSets,
    progress,
    memos,
    units,
    loading,
    error,
    updateStatus,
    updateStudentMemo,
    updateAdminMemo,
    refetch: fetchData,
    linkedStudents,
    selectedStudentId,
    selectStudent,
    isParent,
  };
}
