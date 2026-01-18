'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { CurriculumItem, CurriculumMemo, StatusColor, UnitGroup, CurriculumSet } from '@/types/database';

export function useSupabase(targetUserId?: string) {
  const { user, profile } = useAuth();
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [curriculumSets, setCurriculumSets] = useState<CurriculumSet[]>([]);
  const [progress, setProgress] = useState<Record<string, StatusColor>>({});
  const [memos, setMemos] = useState<Record<string, CurriculumMemo>>({});
  const [units, setUnits] = useState<UnitGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 실제 사용할 유저 ID (관리자가 특정 학생 조회 시 targetUserId 사용)
  const userId = targetUserId || user?.id;
  // 커리큘럼 ID (프로필에서 가져옴)
  const curriculumId = profile?.curriculum_id;

  // 커리큘럼 및 진척도 불러오기
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 커리큘럼 세트 조회
      const { data: setsData, error: setsError } = await supabase
        .from('curriculum_sets')
        .select('*')
        .order('name');

      if (setsError) throw setsError;
      setCurriculumSets(setsData || []);

      // 커리큘럼 항목 조회 (유저의 커리큘럼만 또는 전체)
      let itemsQuery = supabase
        .from('curriculum_items')
        .select('*')
        .order('depth')
        .order('order');

      if (curriculumId) {
        itemsQuery = itemsQuery.eq('set_id', curriculumId);
      }

      const { data: itemsData, error: itemsError } = await itemsQuery;

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
  }, [supabase, userId, curriculumId]);

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
  };
}
