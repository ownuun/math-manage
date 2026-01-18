'use client';

import { useState } from 'react';
import { Circle } from 'lucide-react';
import { UnitGroup, StatusColor, CurriculumItem, CurriculumMemo, UserRole, getGridSize, STATUS_CONFIG, ROLE_PERMISSIONS } from '@/types/database';
import BingoCell from './BingoCell';
import DetailModal from './DetailModal';

const StatusIcon = ({ status, size = 16 }: { status: StatusColor; size?: number }) => {
  const config = STATUS_CONFIG[status];
  return <Circle size={size} fill={config.color} color={config.color} />;
};

interface BingoBoardProps {
  unit: UnitGroup;
  progress: Record<string, StatusColor>;
  memos: Record<string, CurriculumMemo>;
  userRole: UserRole;
  onStatusChange: (itemId: string, status: StatusColor) => void;
  onStudentMemoChange: (itemId: string, memo: string) => void;
  onAdminMemoChange: (itemId: string, memo: string, youtubeUrl: string) => void;
  onBack: () => void;
}

export default function BingoBoard({
  unit,
  progress,
  memos,
  userRole,
  onStatusChange,
  onStudentMemoChange,
  onAdminMemoChange,
  onBack,
}: BingoBoardProps) {
  const [selectedItem, setSelectedItem] = useState<CurriculumItem | null>(null);
  const permissions = ROLE_PERMISSIONS[userRole];

  const greenCount = unit.items.filter((item) => progress[item.id] === 'GREEN').length;
  const isAllGreen = greenCount === unit.total;

  // 동적 그리드 크기 계산
  const gridSize = getGridSize(unit.items.length);
  const isListMode = gridSize === 'list';

  const handleCellClick = (item: CurriculumItem) => {
    if (permissions.canOpenDetail) {
      setSelectedItem(item);
    }
  };

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
              {unit.name}
            </h1>
            <p className="text-sm text-gray-500">
              {greenCount}/{unit.total} 마스터
              {isAllGreen && ' '}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Bingo Grid or List */}
      <main className="flex-1 p-4">
        {isListMode ? (
          // 리스트 모드 (26개 이상)
          <div className="max-w-full sm:max-w-lg lg:max-w-xl mx-auto space-y-2">
            {unit.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleCellClick(item)}
                disabled={!permissions.canOpenDetail}
                className={`
                  w-full p-2.5 sm:p-3 rounded-lg flex items-center gap-3
                  transition-all
                  ${permissions.canOpenDetail ? 'hover:opacity-80 cursor-pointer' : 'cursor-not-allowed'}
                `}
                style={{
                  backgroundColor: STATUS_CONFIG[progress[item.id] || 'BLACK'].bgColor,
                  color: STATUS_CONFIG[progress[item.id] || 'BLACK'].textColor,
                }}
              >
                <span className="text-xs sm:text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        ) : (
          // 그리드 모드
          <div
            className="max-w-full sm:max-w-lg lg:max-w-xl mx-auto gap-1.5 sm:gap-2"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
            }}
          >
            {unit.items.map((item) => (
              <BingoCell
                key={item.id}
                item={item}
                status={progress[item.id] || 'BLACK'}
                onClick={() => handleCellClick(item)}
                disabled={!permissions.canOpenDetail}
              />
            ))}
          </div>
        )}

        {/* Legend - Lucide 아이콘 사용 */}
        <div className="mt-6 flex justify-center gap-4 text-xs text-gray-600">
          {(['BLACK', 'RED', 'BLUE', 'GREEN'] as StatusColor[]).map((status) => (
            <div key={status} className="flex items-center gap-1">
              <StatusIcon status={status} size={14} />
              <span>{STATUS_CONFIG[status].label}</span>
            </div>
          ))}
        </div>

        {/* 학부모 안내 메시지 */}
        {userRole === 'parent' && (
          <div className="mt-4 text-center text-sm text-gray-500">
            학부모 모드에서는 진행 상태만 확인할 수 있습니다.
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && permissions.canOpenDetail && (
        <DetailModal
          item={selectedItem}
          currentStatus={progress[selectedItem.id] || 'BLACK'}
          memo={memos[selectedItem.id] || null}
          userRole={userRole}
          onStatusChange={(status) => onStatusChange(selectedItem.id, status)}
          onStudentMemoChange={(memo) => onStudentMemoChange(selectedItem.id, memo)}
          onAdminMemoChange={(memo, youtubeUrl) => onAdminMemoChange(selectedItem.id, memo, youtubeUrl)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
