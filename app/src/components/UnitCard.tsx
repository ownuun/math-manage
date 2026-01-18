'use client';

import { UnitGroup } from '@/types/database';

interface UnitCardProps {
  unit: UnitGroup;
  onClick: () => void;
}

export default function UnitCard({ unit, onClick }: UnitCardProps) {
  const progressPercent = (unit.progress / unit.total) * 100;
  const isComplete = unit.progress === unit.total;

  return (
    <button
      onClick={onClick}
      className="tap-effect w-full aspect-square rounded-xl sm:rounded-2xl bg-white shadow-lg p-3 sm:p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] border border-gray-100"
    >
      <div className="text-left">
        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 line-clamp-2">{unit.name}</h2>
        <span className="text-xs sm:text-sm text-gray-500">{unit.total}개 유형</span>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {/* Progress Bar */}
        <div className="w-full h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress Text */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
            {unit.progress}/{unit.total} 마스터
          </span>
          {isComplete && (
            <span className="text-green-500 font-bold text-[10px] sm:text-xs lg:text-sm">ALL GREEN!</span>
          )}
        </div>
      </div>
    </button>
  );
}
