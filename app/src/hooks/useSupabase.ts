'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Curriculum, StatusColor, Unit } from '@/types/database';

const DEFAULT_USER_ID = 'demo-user'; // MVP: 단일 사용자

export function useSupabase() {
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [progress, setProgress] = useState<Record<string, StatusColor>>({});
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // 커리큘럼 및 진척도 불러오기
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 커리큘럼 조회
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('curriculum')
        .select('*')
        .order('unit_id')
        .order('order');

      if (curriculumError) throw curriculumError;

      // 진척도 조회
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('curriculum_id, status')
        .eq('user_id', DEFAULT_USER_ID);

      if (progressError) throw progressError;

      // 데이터 설정
      setCurriculum(curriculumData || []);

      // 진척도를 Record 형태로 변환
      const progressMap: Record<string, StatusColor> = {};
      progressData?.forEach((p) => {
        progressMap[p.curriculum_id] = p.status as StatusColor;
      });
      setProgress(progressMap);

      // Units 계산
      const unitMap = new Map<number, { name: string; items: Curriculum[] }>();
      curriculumData?.forEach((item) => {
        if (!unitMap.has(item.unit_id)) {
          unitMap.set(item.unit_id, { name: item.unit_name, items: [] });
        }
        unitMap.get(item.unit_id)!.items.push(item);
      });

      const unitsData = Array.from(unitMap.entries()).map(([id, data]) => {
        const greenCount = data.items.filter((item) => progressMap[item.id] === 'GREEN').length;
        return {
          id,
          name: data.name,
          items: data.items.sort((a, b) => a.order - b.order),
          progress: greenCount,
          total: data.items.length,
        };
      });

      setUnits(unitsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 상태 업데이트
  const updateStatus = useCallback(
    async (curriculumId: string, status: StatusColor) => {
      try {
        // Optimistic update
        setProgress((prev) => ({ ...prev, [curriculumId]: status }));

        // Units 재계산
        setUnits((prevUnits) =>
          prevUnits.map((unit) => {
            const hasItem = unit.items.some((item) => item.id === curriculumId);
            if (!hasItem) return unit;

            const newProgress = { ...progress, [curriculumId]: status };
            const greenCount = unit.items.filter((item) => newProgress[item.id] === 'GREEN').length;
            return { ...unit, progress: greenCount };
          })
        );

        // Supabase upsert
        const { error } = await supabase.from('user_progress').upsert(
          {
            user_id: DEFAULT_USER_ID,
            curriculum_id: curriculumId,
            status,
            updated_at: new Date().toISOString(),
            updated_by: 'student',
          },
          {
            onConflict: 'user_id,curriculum_id',
          }
        );

        if (error) throw error;
      } catch (err) {
        console.error('Error updating status:', err);
        // Rollback on error
        fetchData();
      }
    },
    [supabase, progress, fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    curriculum,
    progress,
    units,
    loading,
    error,
    updateStatus,
    refetch: fetchData,
  };
}
