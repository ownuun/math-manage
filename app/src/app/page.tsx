'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { UnitGroup, ROLE_PERMISSIONS } from '@/types/database';
import { useAuth } from '@/components/AuthProvider';
import { useSupabase } from '@/hooks/useSupabase';
import UnitCard from '@/components/UnitCard';
import BingoBoard from '@/components/BingoBoard';

export default function Home() {
  const [selectedUnit, setSelectedUnit] = useState<UnitGroup | null>(null);

  const { profile, loading: authLoading, signOut } = useAuth();
  const {
    curriculumItems,
    progress,
    memos,
    units,
    loading: dataLoading,
    error,
    updateStatus,
    updateStudentMemo,
    updateAdminMemo,
  } = useSupabase();

  const userRole = profile?.role || 'pending';
  const permissions = ROLE_PERMISSIONS[userRole];

  // 로딩 상태
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>로딩 중...</p>
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
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 승인 대기 상태
  if (userRole === 'pending') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">승인 대기 중</h2>
          <p className="text-sm text-gray-600 mb-4">
            관리자 승인을 기다리고 있습니다.<br />
            승인이 완료되면 서비스를 이용할 수 있습니다.
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {profile?.email}
          </p>
          <button
            onClick={signOut}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 mx-auto"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // 커리큘럼 미배정 상태
  if (!profile?.curriculum_id && userRole !== 'admin') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">커리큘럼 미배정</h2>
          <p className="text-sm text-gray-600 mb-4">
            아직 커리큘럼이 배정되지 않았습니다.<br />
            관리자에게 문의해주세요.
          </p>
          <button
            onClick={signOut}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 mx-auto"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // Show BingoBoard if a unit is selected
  if (selectedUnit) {
    return (
      <BingoBoard
        unit={selectedUnit}
        progress={progress}
        memos={memos}
        userRole={userRole}
        onStatusChange={updateStatus}
        onStudentMemoChange={updateStudentMemo}
        onAdminMemoChange={updateAdminMemo}
        onBack={() => setSelectedUnit(null)}
      />
    );
  }

  // Main Home View
  const leafItems = curriculumItems.filter(item => item.is_leaf);
  const totalItems = leafItems.length;
  const totalGreen = leafItems.filter(item => progress[item.id] === 'GREEN').length;

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">수학 그린라이트</h1>
            <p className="text-green-100 text-sm mt-1">
              {profile?.name}님, 환영합니다!
            </p>
          </div>
          <div className="flex items-center gap-2">
            {permissions.canAccessAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                관리자
              </Link>
            )}
            <button
              onClick={signOut}
              className="w-9 h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* 역할 배지 */}
        <div className="mt-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20">
            {ROLE_PERMISSIONS[userRole].label}
          </span>
        </div>

        {/* 진척도 바 */}
        <div className="mt-4 bg-white/20 rounded-full p-1">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm">전체 진척도</span>
            <span className="font-bold">{totalGreen}/{totalItems}</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden mx-2 mb-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: totalItems > 0 ? `${(totalGreen / totalItems) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 -mt-4">
        {units.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 max-w-md mx-auto">
            <p>커리큘럼 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onClick={() => setSelectedUnit(unit)}
              />
            ))}
          </div>
        )}

        {/* 역할 안내 */}
        {userRole === 'parent' && (
          <div className="mt-6 mx-auto max-w-md bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <strong>학부모 모드</strong>: 자녀의 학습 진행 상태만 확인할 수 있습니다.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-400">
        Math Green Light v2.0
      </footer>
    </div>
  );
}
