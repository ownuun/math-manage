'use client';

import { CurriculumItem, StatusColor, STATUS_CONFIG } from '@/types/database';

interface BingoCellProps {
  item: CurriculumItem;
  status: StatusColor;
  onClick: () => void;
  disabled?: boolean;
}

export default function BingoCell({ item, status, onClick, disabled }: BingoCellProps) {
  const config = STATUS_CONFIG[status];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square rounded-lg sm:rounded-xl flex items-center justify-center p-1.5 sm:p-2
        min-h-[60px] sm:min-h-[70px] lg:min-h-[80px]
        transition-all
        ${disabled ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 tap-effect cursor-pointer'}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-center line-clamp-3 leading-tight">
        {item.name}
      </span>
    </button>
  );
}
