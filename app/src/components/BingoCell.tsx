'use client';

import { Curriculum, StatusColor, STATUS_CONFIG } from '@/types/database';

interface BingoCellProps {
  item: Curriculum;
  status: StatusColor;
  onClick: () => void;
}

export default function BingoCell({ item, status, onClick }: BingoCellProps) {
  const config = STATUS_CONFIG[status];

  const getBgClass = () => {
    switch (status) {
      case 'BLACK': return 'bg-gray-700 text-white';
      case 'RED': return 'bg-red-100 text-red-600';
      case 'BLUE': return 'bg-blue-100 text-blue-600';
      case 'GREEN': return 'bg-green-100 text-green-600';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`tap-effect aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all hover:scale-105 ${getBgClass()}`}
    >
      <span className="text-2xl mb-1">{config.emoji}</span>
      <span className="text-xs font-medium text-center line-clamp-2 leading-tight">
        {item.type_name}
      </span>
    </button>
  );
}
