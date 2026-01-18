'use client';

import { useState } from 'react';
import { Circle, PenSquare, MessageCircle, Youtube } from 'lucide-react';
import { CurriculumItem, CurriculumMemo, StatusColor, UserRole, STATUS_CONFIG, ROLE_PERMISSIONS } from '@/types/database';

const StatusIcon = ({ status, size = 20 }: { status: StatusColor; size?: number }) => {
  const config = STATUS_CONFIG[status];
  return <Circle size={size} fill={config.color} color={config.color} />;
};

interface DetailModalProps {
  item: CurriculumItem;
  currentStatus: StatusColor;
  memo: CurriculumMemo | null;
  userRole: UserRole;
  onStatusChange: (status: StatusColor) => void;
  onStudentMemoChange: (memo: string) => void;
  onAdminMemoChange: (memo: string, youtubeUrl: string) => void;
  onClose: () => void;
}

export default function DetailModal({
  item,
  currentStatus,
  memo,
  userRole,
  onStatusChange,
  onStudentMemoChange,
  onAdminMemoChange,
  onClose,
}: DetailModalProps) {
  const permissions = ROLE_PERMISSIONS[userRole];

  // 로컬 상태
  const [studentMemo, setStudentMemo] = useState(memo?.student_memo || '');
  const [adminMemo, setAdminMemo] = useState(memo?.admin_memo || '');
  const [youtubeUrl, setYoutubeUrl] = useState(memo?.youtube_url || '');

  const handleStatusClick = (status: StatusColor) => {
    if (!permissions.canChangeStatus) return;

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onStatusChange(status);
  };

  const handleSave = () => {
    if (permissions.canEditStudentMemo) {
      onStudentMemoChange(studentMemo);
    }
    if (permissions.canEditAdminMemo) {
      onAdminMemoChange(adminMemo, youtubeUrl);
    }
    onClose();
  };

  // YouTube 영상 ID 추출
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = youtubeUrl ? getYoutubeEmbedUrl(youtubeUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-[calc(100%-2rem)] sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 z-10"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-3 sm:p-4 border-b">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 pr-8">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <StatusIcon status={currentStatus} size={16} />
            <span className="text-sm" style={{ color: STATUS_CONFIG[currentStatus].color }}>
              {STATUS_CONFIG[currentStatus].label}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* 학생 메모 영역 */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <PenSquare size={18} className="text-yellow-500" />
              나의 메모
              {userRole === 'admin' && (
                <span className="text-xs text-gray-400">(읽기 전용)</span>
              )}
            </label>
            {permissions.canEditStudentMemo ? (
              <textarea
                value={studentMemo}
                onChange={(e) => setStudentMemo(e.target.value)}
                placeholder="이 유형에 대한 나의 메모를 적어보세요..."
                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            ) : (
              <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl min-h-[80px] whitespace-pre-wrap">
                {studentMemo || (
                  <span className="text-gray-400 text-sm">학생 메모 없음</span>
                )}
              </div>
            )}
          </div>

          {/* 관리자 처방 영역 */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              <MessageCircle size={18} className="text-blue-500" />
              관리자 처방
              {userRole === 'student' && (
                <span className="text-xs text-gray-400">(읽기 전용)</span>
              )}
            </label>
            {permissions.canEditAdminMemo ? (
              <textarea
                value={adminMemo}
                onChange={(e) => setAdminMemo(e.target.value)}
                placeholder="학생에게 처방할 내용을 적어주세요..."
                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            ) : (
              <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl min-h-[80px] whitespace-pre-wrap">
                {adminMemo || (
                  <span className="text-gray-400 text-sm">관리자 처방 없음</span>
                )}
              </div>
            )}
          </div>

          {/* YouTube URL 입력 (관리자만) */}
          {permissions.canEditYoutube && (
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                <Youtube size={18} className="text-red-500" />
                유튜브 링크
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* YouTube 영상 미리보기/링크 */}
          {youtubeUrl && (
            <div>
              {embedUrl ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  영상 보러 가기
                </a>
              )}
            </div>
          )}

          {/* 상태 변경 버튼 */}
          {permissions.canChangeStatus && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                학습 상태
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                      style={{
                        backgroundColor: isActive ? config.bgColor : undefined,
                        color: isActive ? config.textColor : config.color,
                      }}
                    >
                      <StatusIcon status={status} size={20} />
                      <span className="text-xs font-medium mt-1">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          {(permissions.canEditStudentMemo || permissions.canEditAdminMemo) && (
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
            >
              저장
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
