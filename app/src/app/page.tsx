'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LogOut, Folder, ChevronRight, ChevronLeft, Home as HomeIcon } from 'lucide-react';
import { CurriculumItem, UnitGroup, StatusColor, STATUS_CONFIG, ROLE_PERMISSIONS } from '@/types/database';
import { useAuth } from '@/components/AuthProvider';
import { useSupabase } from '@/hooks/useSupabase';
import BingoBoard from '@/components/BingoBoard';
import DetailModal from '@/components/DetailModal';

// 폴더 경로 타입
interface FolderPath {
  id: string | null;
  name: string;
}

export default function Home() {
  // 현재 폴더 ID (null = 최상위)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  // 폴더 경로 (브레드크럼용)
  const [folderPath, setFolderPath] = useState<FolderPath[]>([{ id: null, name: '홈' }]);
  // 빙고판 표시 여부
  const [showBingoBoard, setShowBingoBoard] = useState(false);
  // 선택된 학습 항목 (상세 모달용)
  const [selectedLeaf, setSelectedLeaf] = useState<CurriculumItem | null>(null);

  // 폴더 스크롤 상태
  const folderScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { profile, loading: authLoading, signOut } = useAuth();
  const {
    curriculumItems,
    progress,
    memos,
    loading: dataLoading,
    error,
    updateStatus,
    updateStudentMemo,
    updateAdminMemo,
  } = useSupabase();

  const userRole = profile?.role || 'pending';
  const permissions = ROLE_PERMISSIONS[userRole];

  // 현재 폴더의 직접 자식들 계산
  const currentChildren = useMemo(() => {
    return curriculumItems.filter(item => item.parent_id === currentFolderId);
  }, [curriculumItems, currentFolderId]);

  // 현재 폴더의 하위에 있는 폴더들
  const childFolders = useMemo(() => {
    return currentChildren.filter(item => !item.is_leaf).sort((a, b) => a.order - b.order);
  }, [currentChildren]);

  // 현재 폴더의 하위에 있는 leaf들
  const childLeaves = useMemo(() => {
    return currentChildren.filter(item => item.is_leaf).sort((a, b) => a.order - b.order);
  }, [currentChildren]);

  // 재귀적으로 모든 하위 leaf 찾기 (폴더 진행률 계산용)
  const getAllLeafChildren = (parentId: string): CurriculumItem[] => {
    const directChildren = curriculumItems.filter(item => item.parent_id === parentId);
    let allLeaves: CurriculumItem[] = [];

    directChildren.forEach(child => {
      if (child.is_leaf) {
        allLeaves.push(child);
      } else {
        allLeaves = allLeaves.concat(getAllLeafChildren(child.id));
      }
    });

    return allLeaves;
  };

  // 현재 폴더 정보
  const currentFolder = currentFolderId
    ? curriculumItems.find(item => item.id === currentFolderId)
    : null;

  // 폴더 클릭 핸들러
  const handleFolderClick = (folder: CurriculumItem) => {
    setCurrentFolderId(folder.id);
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    setShowBingoBoard(false);
  };

  // 브레드크럼 클릭 핸들러
  const handleBreadcrumbClick = (index: number) => {
    const targetPath = folderPath[index];
    setCurrentFolderId(targetPath.id);
    setFolderPath(folderPath.slice(0, index + 1));
    setShowBingoBoard(false);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (showBingoBoard) {
      setShowBingoBoard(false);
    } else if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
    }
  };

  // 빙고판 표시 (현재 폴더의 leaf들만)
  const handleShowBingo = () => {
    setShowBingoBoard(true);
  };

  // 학습 항목 클릭 핸들러 (상세 모달 열기)
  const handleLeafClick = (item: CurriculumItem) => {
    if (permissions.canOpenDetail) {
      setSelectedLeaf(item);
    }
  };

  // 폴더 스크롤 상태 체크
  const checkScrollButtons = useCallback(() => {
    const container = folderScrollRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }
  }, []);

  // 폴더 목록 변경 시 스크롤 상태 체크
  useEffect(() => {
    checkScrollButtons();
    // ResizeObserver로 크기 변경 감지
    const container = folderScrollRef.current;
    if (container) {
      const resizeObserver = new ResizeObserver(checkScrollButtons);
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }
  }, [childFolders, checkScrollButtons]);

  // 스크롤 핸들러
  const scrollFolders = (direction: 'left' | 'right') => {
    const container = folderScrollRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // 현재 폴더의 leaf를 기반으로 UnitGroup 생성 (BingoBoard용)
  const currentUnit: UnitGroup | null = (showBingoBoard && currentFolderId) ? {
    id: currentFolderId,
    name: currentFolder?.name || '',
    items: getAllLeafChildren(currentFolderId),
    progress: getAllLeafChildren(currentFolderId).filter(item => progress[item.id] === 'GREEN').length,
    total: getAllLeafChildren(currentFolderId).length,
  } : null;

  // Show BingoBoard if enabled
  if (showBingoBoard && currentUnit && currentUnit.items.length > 0) {
    return (
      <BingoBoard
        unit={currentUnit}
        progress={progress}
        memos={memos}
        userRole={userRole}
        onStatusChange={updateStatus}
        onStudentMemoChange={updateStudentMemo}
        onAdminMemoChange={updateAdminMemo}
        onBack={handleBack}
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
      <header className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">수학 그린라이트</h1>
              <p className="text-green-100 text-xs sm:text-sm mt-1">
                {profile?.name}님, 환영합니다!
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {permissions.canAccessAdmin && (
                <Link
                  href="/admin"
                  className="px-2.5 sm:px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  관리자
                </Link>
              )}
              <button
                onClick={signOut}
                className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="로그아웃"
              >
                <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>

          {/* 역할 배지 */}
          <div className="mt-2 sm:mt-3">
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-white/20">
              {ROLE_PERMISSIONS[userRole].label}
            </span>
          </div>

          {/* 진척도 바 */}
          <div className="mt-3 sm:mt-4 bg-white/20 rounded-full p-1">
            <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="text-xs sm:text-sm">전체 진척도</span>
              <span className="font-bold text-sm sm:text-base">{totalGreen}/{totalItems}</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden mx-2 mb-2">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: totalItems > 0 ? `${(totalGreen / totalItems) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 -mt-3 sm:-mt-4">
        <div className="max-w-4xl mx-auto">
          {/* 브레드크럼 네비게이션 */}
          {folderPath.length > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-3 mb-3 flex items-center gap-1 overflow-x-auto">
              {folderPath.map((path, index) => (
                <div key={path.id || 'home'} className="flex items-center">
                  {index > 0 && <ChevronRight size={14} className="text-gray-400 mx-1 flex-shrink-0" />}
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`text-xs sm:text-sm whitespace-nowrap ${
                      index === folderPath.length - 1
                        ? 'text-green-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {index === 0 ? <HomeIcon size={14} className="inline" /> : path.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 커리큘럼 표시 */}
          {currentChildren.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center text-gray-500">
              <p>커리큘럼 항목이 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 폴더 리스트 - 상단 1행 스크롤 */}
              {childFolders.length > 0 && (
                <div className="relative mt-2 mb-4">
                  {/* 왼쪽 화살표 */}
                  {canScrollLeft && (
                    <button
                      onClick={() => scrollFolders('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-all"
                    >
                      <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                  )}

                  {/* 폴더 스크롤 컨테이너 */}
                  <div
                    ref={folderScrollRef}
                    onScroll={checkScrollButtons}
                    className="flex gap-2 overflow-x-auto scrollbar-hide px-1"
                  >
                    {childFolders.map((folder) => {
                      const folderLeaves = getAllLeafChildren(folder.id);
                      const greenCount = folderLeaves.filter(leaf => progress[leaf.id] === 'GREEN').length;
                      const total = folderLeaves.length;
                      const isComplete = greenCount === total && total > 0;

                      return (
                        <button
                          key={folder.id}
                          onClick={() => handleFolderClick(folder)}
                          className={`tap-effect flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-[1.02] min-w-[80px] flex-shrink-0 ${
                            isComplete
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Folder size={14} className={isComplete ? 'text-green-500' : 'text-yellow-500'} />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{folder.name}</span>
                          <span className={`text-[10px] sm:text-xs ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                            {greenCount}/{total}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 오른쪽 화살표 */}
                  {canScrollRight && (
                    <button
                      onClick={() => scrollFolders('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-gray-200 rounded-full shadow-md hover:bg-gray-50 transition-all"
                    >
                      <ChevronRight size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
              )}

              {/* 학습 항목 그리드 */}
              {childLeaves.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {childLeaves.map((item) => {
                    const status = progress[item.id] || 'BLACK';
                    const config = {
                      BLACK: { bgColor: '#4B5563', textColor: '#FFFFFF', label: '미학습' },
                      RED: { bgColor: '#FECACA', textColor: '#B91C1C', label: 'SOS' },
                      BLUE: { bgColor: '#BFDBFE', textColor: '#1E40AF', label: '연습' },
                      GREEN: { bgColor: '#A7F3D0', textColor: '#065F46', label: '마스터' },
                    }[status];

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleLeafClick(item)}
                        disabled={!permissions.canOpenDetail}
                        className={`tap-effect w-full aspect-square rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col justify-center items-center transition-transform hover:scale-[1.02] ${
                          !permissions.canOpenDetail ? 'cursor-not-allowed opacity-80' : ''
                        }`}
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <span
                          className="text-xs sm:text-sm lg:text-base font-bold text-center line-clamp-3"
                          style={{ color: config.textColor }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="text-[10px] sm:text-xs mt-2 px-2 py-0.5 rounded-full bg-white/20"
                          style={{ color: config.textColor }}
                        >
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* 역할 안내 */}
          {userRole === 'parent' && (
            <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-blue-700">
              <strong>학부모 모드</strong>: 자녀의 학습 진행 상태만 확인할 수 있습니다.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-400">
        Math Green Light v2.0
      </footer>

      {/* 학습 항목 상세 모달 */}
      {selectedLeaf && permissions.canOpenDetail && (
        <DetailModal
          item={selectedLeaf}
          currentStatus={progress[selectedLeaf.id] || 'BLACK'}
          memo={memos[selectedLeaf.id] || null}
          userRole={userRole}
          onStatusChange={(status) => updateStatus(selectedLeaf.id, status)}
          onStudentMemoChange={(memo) => updateStudentMemo(selectedLeaf.id, memo)}
          onAdminMemoChange={(memo, youtubeUrl) => updateAdminMemo(selectedLeaf.id, memo, youtubeUrl)}
          onClose={() => setSelectedLeaf(null)}
        />
      )}
    </div>
  );
}
