'use client';

import { Curriculum, StatusColor, STATUS_CONFIG } from '@/types/database';

interface DetailModalProps {
  item: Curriculum;
  currentStatus: StatusColor;
  onStatusChange: (status: StatusColor) => void;
  onClose: () => void;
}

export default function DetailModal({
  item,
  currentStatus,
  onStatusChange,
  onClose,
}: DetailModalProps) {
  const handleStatusClick = (status: StatusColor) => {
    // Vibration feedback (mobile)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onStatusChange(status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Area */}
        <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {item.image_url ? (
            <img src={item.image_url} alt={item.type_name} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-4">
              <div className="text-6xl mb-2">📐</div>
              <span className="text-gray-500 text-sm">이미지 준비중</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 text-center">
            {item.type_name}
          </h3>

          {/* YouTube Link */}
          {item.youtube_url && (
            <a
              href={item.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              이 유형이 어렵다면?
            </a>
          )}

          {/* Status Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(STATUS_CONFIG) as StatusColor[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const isActive = currentStatus === status;

              return (
                <button
                  key={status}
                  onClick={() => handleStatusClick(status)}
                  className={`tap-effect flex flex-col items-center py-3 rounded-xl transition-all ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-gray-800 scale-105'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: isActive ? config.bgColor : undefined,
                  }}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <span className="text-xs font-medium mt-1" style={{ color: config.color }}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
