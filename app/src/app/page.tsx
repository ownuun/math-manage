'use client';

import { useState, useEffect } from 'react';
import { StatusColor, Unit } from '@/types/database';
import { SAMPLE_CURRICULUM, SAMPLE_PROGRESS, getUnitsWithProgress } from '@/lib/sample-data';
import { useSupabase } from '@/hooks/useSupabase';
import UnitCard from '@/components/UnitCard';
import BingoBoard from '@/components/BingoBoard';

export default function Home() {
  const {
    curriculum,
    progress: supabaseProgress,
    units: supabaseUnits,
    loading,
    error,
    updateStatus,
  } = useSupabase();

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Fallback to sample data if Supabase fails
  const [fallbackProgress, setFallbackProgress] = useState<Record<string, StatusColor>>(SAMPLE_PROGRESS);
  const [fallbackUnits, setFallbackUnits] = useState<Unit[]>([]);

  const useSupabaseData = !error && curriculum.length > 0;
  const progress = useSupabaseData ? supabaseProgress : fallbackProgress;
  const units = useSupabaseData ? supabaseUnits : fallbackUnits;
  const totalItems = useSupabaseData ? curriculum.length : SAMPLE_CURRICULUM.length;

  useEffect(() => {
    if (error) {
      // Fallback: Load from localStorage
      const saved = localStorage.getItem('math-greenlight-progress');
      if (saved) {
        setFallbackProgress(JSON.parse(saved));
      }
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      setFallbackUnits(getUnitsWithProgress(SAMPLE_CURRICULUM, fallbackProgress));
    }
  }, [fallbackProgress, error]);

  const handleStatusChange = (curriculumId: string, status: StatusColor) => {
    if (useSupabaseData) {
      updateStatus(curriculumId, status);
    } else {
      // Fallback: Save to localStorage
      const newProgress = { ...fallbackProgress, [curriculumId]: status };
      setFallbackProgress(newProgress);
      localStorage.setItem('math-greenlight-progress', JSON.stringify(newProgress));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Show BingoBoard if a unit is selected
  if (selectedUnit) {
    return (
      <BingoBoard
        unit={selectedUnit}
        progress={progress}
        onStatusChange={handleStatusChange}
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  // Main Home View
  const totalGreen = Object.values(progress).filter((s) => s === 'GREEN').length;

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 pb-8">
        <h1 className="text-2xl font-bold text-center">수학 그린라이트</h1>
        <p className="text-green-100 text-center text-sm mt-1">
          채점하지 말고 색칠하라!
        </p>

        {/* Error Notice */}
        {error && (
          <div className="mt-2 bg-yellow-500/20 text-yellow-100 text-xs text-center py-1 px-2 rounded">
            오프라인 모드 (로컬 저장)
          </div>
        )}

        <div className="mt-4 bg-white/20 rounded-full p-1">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm">전체 진척도</span>
            <span className="font-bold">{totalGreen}/{totalItems}</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden mx-2 mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(totalGreen / totalItems) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 -mt-4">
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onClick={() => setSelectedUnit(unit)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-400">
        Math Green Light v1.0
        {useSupabaseData && ' (Cloud)'}
      </footer>
    </div>
  );
}
