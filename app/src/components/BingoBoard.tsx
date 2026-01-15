'use client';

import { useState } from 'react';
import { Unit, StatusColor, Curriculum } from '@/types/database';
import BingoCell from './BingoCell';
import DetailModal from './DetailModal';

interface BingoBoardProps {
  unit: Unit;
  progress: Record<string, StatusColor>;
  onStatusChange: (curriculumId: string, status: StatusColor) => void;
  onBack: () => void;
}

export default function BingoBoard({
  unit,
  progress,
  onStatusChange,
  onBack,
}: BingoBoardProps) {
  const [selectedItem, setSelectedItem] = useState<Curriculum | null>(null);

  const greenCount = unit.items.filter((item) => progress[item.id] === 'GREEN').length;
  const isAllGreen = greenCount === unit.total;

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="tap-effect w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-lg text-gray-800">
              {unit.id}. {unit.name}
            </h1>
            <p className="text-sm text-gray-500">
              {greenCount}/{unit.total} 마스터
              {isAllGreen && ' 🎉'}
            </p>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Bingo Grid */}
      <main className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {unit.items.map((item) => (
            <BingoCell
              key={item.id}
              item={item}
              status={progress[item.id] || 'BLACK'}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
          <span>⚫ 미학습</span>
          <span>🔴 SOS</span>
          <span>🔵 연습</span>
          <span>🟢 마스터</span>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          currentStatus={progress[selectedItem.id] || 'BLACK'}
          onStatusChange={(status) => onStatusChange(selectedItem.id, status)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
