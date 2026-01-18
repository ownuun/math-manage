'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Circle, LogOut } from 'lucide-react';
import { StatusColor, STATUS_CONFIG, SOSItem } from '@/types/database';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/components/AuthProvider';

const StatusIcon = ({ status, size = 16 }: { status: StatusColor; size?: number }) => {
  const config = STATUS_CONFIG[status];
  return <Circle size={size} fill={config.color} color={config.color} />;
};

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const {
    studentStats,
    sosItems,
    loading,
    error,
    writePrescription,
    refetch,
  } = useAdmin();

  const [selectedSOS, setSelectedSOS] = useState<SOSItem | null>(null);
  const [prescription, setPrescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // 전체 통계 계산
  const totalStats = studentStats.reduce(
    (acc, s) => ({
      green: acc.green + s.green,
      blue: acc.blue + s.blue,
      red: acc.red + s.red,
      black: acc.black + s.black,
    }),
    { green: 0, blue: 0, red: 0, black: 0 }
  );

  // 처방 저장
  const handleSavePrescription = async () => {
    if (!selectedSOS || !prescription.trim()) return;

    setSaving(true);
    const { error } = await writePrescription(
      selectedSOS.userId,
      selectedSOS.itemId,
      prescription,
      youtubeUrl || undefined
    );

    if (error) {
      alert('처방 저장에 실패했습니다.');
    } else {
      setSelectedSOS(null);
      setPrescription('');
      setYoutubeUrl('');
      refetch();
    }
    setSaving(false);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">학원 관리 대시보드</h1>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut size={18} />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2 mt-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              대시보드
            </Link>
            <Link
              href="/admin/students"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              학생 관리
            </Link>
            <Link
              href="/admin/curriculum"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              커리큘럼
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 전체 현황 카드 */}
        <section>
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">전체 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {(['GREEN', 'BLUE', 'RED', 'BLACK'] as StatusColor[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const count = totalStats[status.toLowerCase() as keyof typeof totalStats];

              return (
                <div
                  key={status}
                  className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <StatusIcon status={status} size={16} />
                    <span className="text-xs sm:text-sm text-gray-600">{config.label}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-800">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 학생별 진행 현황 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-800">학생별 진행 현황</h2>
            <span className="text-xs sm:text-sm text-gray-500">{studentStats.length}명</span>
          </div>

          {/* 모바일 카드 레이아웃 */}
          <div className="md:hidden space-y-3">
            {studentStats.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                등록된 학생이 없습니다.
              </div>
            ) : (
              studentStats.map((student) => (
                <div key={student.userId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{student.userName}</p>
                      <p className="text-xs text-gray-500">{student.curriculumName}</p>
                    </div>
                    {student.red > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        SOS {student.red}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${student.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{student.progressPercent}%</span>
                    </div>
                    <Link
                      href={`/admin/students/${student.userId}`}
                      className="text-blue-500 hover:text-blue-600 text-sm ml-3"
                    >
                      상세
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 데스크탑 테이블 레이아웃 */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {studentStats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 학생이 없습니다.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">커리큘럼</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">진행률</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">SOS</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentStats.map((student) => (
                    <tr key={student.userId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{student.userName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{student.curriculumName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{student.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {student.red > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                            {student.red}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/students/${student.userId}`}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          상세
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* 긴급 처방 필요 (SOS 목록) */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <StatusIcon status="RED" size={18} />
            긴급 처방 필요
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {sosItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                처방이 필요한 항목이 없습니다.
              </div>
            ) : (
              sosItems.map((item, index) => (
                <div key={`${item.userId}-${item.itemId}-${index}`} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{item.userName}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">{item.itemName}</span>
                    </div>
                    {item.studentMemo && (
                      <p className="text-sm text-gray-500 mt-1">"{item.studentMemo}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSOS(item);
                      setPrescription('');
                      setYoutubeUrl('');
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    처방하기
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 처방 모달 */}
      {selectedSOS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">처방 작성</h3>
                <button
                  onClick={() => setSelectedSOS(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 학생 정보 */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <StatusIcon status="RED" size={16} />
                  <span className="font-medium text-gray-800">{selectedSOS.userName}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">{selectedSOS.itemName}</span>
                </div>
                {selectedSOS.studentMemo && (
                  <p className="text-sm text-gray-500 mt-2">학생 메모: "{selectedSOS.studentMemo}"</p>
                )}
              </div>

              {/* 처방 입력 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">처방 내용</label>
                  <textarea
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="학생에게 전달할 처방을 작성하세요..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유튜브 URL (선택)</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedSOS(null)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSavePrescription}
                  disabled={!prescription.trim() || saving}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
