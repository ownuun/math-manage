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
        aspect-square rounded-xl flex items-center justify-center p-2
        transition-all
        ${disabled ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 tap-effect cursor-pointer'}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <span className="text-xs font-medium text-center line-clamp-3 leading-tight">
        {item.name}
      </span>
    </button>
  );
}
