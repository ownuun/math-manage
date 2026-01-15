'use client';

import { Unit } from '@/types/database';

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
}

export default function UnitCard({ unit, onClick }: UnitCardProps) {
  const progressPercent = (unit.progress / unit.total) * 100;
  const isComplete = unit.progress === unit.total;

  return (
    <button
      onClick={onClick}
      className="tap-effect w-full aspect-square rounded-2xl bg-white shadow-lg p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] border border-gray-100"
    >
      <div className="text-left">
        <span className="text-sm text-gray-500 font-medium">대단원 {unit.id}</span>
        <h2 className="text-lg font-bold text-gray-800 mt-1">{unit.name}</h2>
      </div>

      <div className="space-y-2">
        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress Text */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {unit.progress}/{unit.total} 완료
          </span>
          {isComplete && (
            <span className="text-green-500 font-bold text-sm">ALL GREEN!</span>
          )}
        </div>
      </div>
    </button>
  );
}
