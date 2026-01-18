'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Circle, Book, ChevronLeft, User, Mail, Calendar, Phone, Pencil, MessageSquare, Youtube } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StatusColor, STATUS_CONFIG, Profile, CurriculumSet, CurriculumItem, CurriculumMemo } from '@/types/database';

const StatusIcon = ({ status, size = 16 }: { status: StatusColor; size?: number }) => {
  const config = STATUS_CONFIG[status];
  return <Circle size={size} fill={config.color} color={config.color} />;
};

interface ProgressItem {
  item: CurriculumItem;
  status: StatusColor;
  memo: CurriculumMemo | null;
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Profile | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumSet | null>(null);
  const [curriculumSets, setCurriculumSets] = useState<CurriculumSet[]>([]);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedSosItem, setSelectedSosItem] = useState<ProgressItem | null>(null);
  const [saving, setSaving] = useState(false);

  // 편집 폼 상태
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCurriculumId, setEditCurriculumId] = useState('');

  // 처방 폼 상태
  const [adminMemo, setAdminMemo] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // 상태별 통계
  const stats = {
    total: progressItems.length,
    green: progressItems.filter(p => p.status === 'GREEN').length,
    blue: progressItems.filter(p => p.status === 'BLUE').length,
    red: progressItems.filter(p => p.status === 'RED').length,
    black: progressItems.filter(p => p.status === 'BLACK').length,
  };

  const progressPercent = stats.total > 0 ? Math.round((stats.green / stats.total) * 100) : 0;

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 학생 프로필 조회
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('학생을 찾을 수 없습니다.');

      setStudent(profileData);

      // 모든 커리큘럼 세트 조회
      const { data: setsData, error: setsError } = await supabase
        .from('curriculum_sets')
        .select('*')
        .order('name');

      if (!setsError && setsData) {
        setCurriculumSets(setsData);
      }

      // 커리큘럼 조회
      if (profileData.curriculum_id) {
        const { data: curriculumData, error: curriculumError } = await supabase
          .from('curriculum_sets')
          .select('*')
          .eq('id', profileData.curriculum_id)
          .single();

        if (!curriculumError && curriculumData) {
          setCurriculum(curriculumData);
        }

        // 커리큘럼 항목 조회 (leaf만)
        const { data: itemsData, error: itemsError } = await supabase
          .from('curriculum_items')
          .select('*')
          .eq('set_id', profileData.curriculum_id)
          .eq('is_leaf', true)
          .order('depth')
          .order('order');

        if (itemsError) throw itemsError;

        // 진행 상태 조회
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', studentId);

        if (progressError) throw progressError;

        // 메모 조회
        const { data: memosData, error: memosError } = await supabase
          .from('curriculum_memos')
          .select('*')
          .eq('user_id', studentId);

        if (memosError) throw memosError;

        // 진행 상태 맵
        const progressMap: Record<string, StatusColor> = {};
        progressData?.forEach(p => {
          progressMap[p.item_id] = p.status as StatusColor;
        });

        // 메모 맵
        const memosMap: Record<string, CurriculumMemo> = {};
        memosData?.forEach(m => {
          memosMap[m.item_id] = m;
        });

        // 진행 항목 생성
        const items: ProgressItem[] = (itemsData || []).map(item => ({
          item,
          status: progressMap[item.id] || 'BLACK',
          memo: memosMap[item.id] || null,
        }));

        setProgressItems(items);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [supabase, studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 기본 정보 편집 모달 열기
  const openEditModal = () => {
    if (student) {
      setEditName(student.name);
      setEditPhone(student.phone || '');
      setEditCurriculumId(student.curriculum_id || '');
      setEditModalOpen(true);
    }
  };

  // 처방 모달 열기
  const openPrescriptionModal = (item: ProgressItem) => {
    setSelectedSosItem(item);
    setAdminMemo(item.memo?.admin_memo || '');
    setYoutubeUrl(item.memo?.youtube_url || '');
    setPrescriptionModalOpen(true);
  };

  // 기본 정보 저장
  const handleSaveProfile = async () => {
    if (!student || !editName.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editName.trim(),
          phone: editPhone || null,
          curriculum_id: editCurriculumId || null,
        })
        .eq('id', student.id);

      if (error) throw error;

      setEditModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 처방 저장
  const handleSavePrescription = async () => {
    if (!student || !selectedSosItem) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('curriculum_memos')
        .upsert({
          user_id: student.id,
          item_id: selectedSosItem.item.id,
          admin_memo: adminMemo || null,
          youtube_url: youtubeUrl || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,item_id',
        });

      if (error) throw error;

      setPrescriptionModalOpen(false);
      setSelectedSosItem(null);
      fetchData();
    } catch (err) {
      console.error('Error saving prescription:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
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
  if (error || !student) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-sm text-gray-600 mb-4">{error || '학생을 찾을 수 없습니다.'}</p>
          <Link
            href="/admin/students"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/students"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">{student.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500">학생 상세 정보</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-bold text-gray-800">기본 정보</h2>
            <button
              onClick={openEditModal}
              className="flex items-center gap-1 px-3 py-1.5 text-blue-500 hover:bg-blue-50 rounded-lg text-sm"
            >
              <Pencil size={14} />
              수정
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">{student.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Mail size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm sm:text-base font-medium text-gray-800 break-all">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">전화번호</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">{student.phone || '미등록'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Book size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">커리큘럼</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">{curriculum?.name || '미배정'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">가입일</p>
                <p className="text-sm sm:text-base font-medium text-gray-800">
                  {new Date(student.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 진행률 통계 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">학습 진행률</h2>

          {/* 전체 진행률 바 */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600">전체 진행률</span>
              <span className="text-sm sm:text-base font-bold text-gray-800">{progressPercent}%</span>
            </div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 상태별 통계 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {(['GREEN', 'BLUE', 'RED', 'BLACK'] as StatusColor[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const count = stats[status.toLowerCase() as keyof typeof stats];

              return (
                <div
                  key={status}
                  className="rounded-xl p-3 sm:p-4"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <StatusIcon status={status} size={14} />
                    <span className="text-xs sm:text-sm" style={{ color: config.textColor }}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: config.textColor }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SOS 항목 (RED) */}
        {stats.red > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-red-200 p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-bold text-red-600 mb-3 sm:mb-4 flex items-center gap-2">
              <StatusIcon status="RED" size={18} />
              SOS 요청 ({stats.red}개)
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {progressItems
                .filter(p => p.status === 'RED')
                .map((progressItem) => (
                  <div key={progressItem.item.id} className="bg-red-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{progressItem.item.name}</p>
                      <button
                        onClick={() => openPrescriptionModal(progressItem)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        <MessageSquare size={12} />
                        처방하기
                      </button>
                    </div>
                    {progressItem.memo?.student_memo && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 bg-white rounded p-2">
                        <span className="font-medium">학생 메모:</span> {progressItem.memo.student_memo}
                      </p>
                    )}
                    {progressItem.memo?.admin_memo && (
                      <p className="text-xs sm:text-sm text-blue-600 mt-1 bg-blue-50 rounded p-2">
                        <span className="font-medium">관리자 처방:</span> {progressItem.memo.admin_memo}
                      </p>
                    )}
                    {progressItem.memo?.youtube_url && (
                      <a
                        href={progressItem.memo.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs sm:text-sm text-red-500 mt-1 hover:underline"
                      >
                        <Youtube size={14} />
                        참고 영상 보기
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* 전체 항목 목록 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4">
            전체 학습 항목 ({stats.total}개)
          </h2>

          {progressItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">커리큘럼이 배정되지 않았거나 항목이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {progressItems.map(({ item, status, memo }) => {
                const config = STATUS_CONFIG[status];

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <StatusIcon status={status} size={16} />
                      <span className="text-xs sm:text-sm text-gray-800 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                        style={{ backgroundColor: config.bgColor, color: config.textColor }}
                      >
                        {config.label}
                      </span>
                      {memo?.admin_memo && (
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-blue-100 text-blue-700">
                          처방완료
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* 기본 정보 수정 모달 */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">기본 정보 수정</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">커리큘럼</label>
                <select
                  value={editCurriculumId}
                  onChange={(e) => setEditCurriculumId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">미배정</option>
                  {curriculumSets.map(set => (
                    <option key={set.id} value={set.id}>{set.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={student.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다.</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving || !editName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 처방 작성 모달 */}
      {prescriptionModalOpen && selectedSosItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">처방 작성</h3>

            <div className="bg-red-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{selectedSosItem.item.name}</p>
              {selectedSosItem.memo?.student_memo && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">학생 메모:</span> {selectedSosItem.memo.student_memo}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">관리자 처방</label>
                <textarea
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  placeholder="학생에게 전달할 처방 내용을 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">참고 영상 URL (선택)</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setPrescriptionModalOpen(false);
                  setSelectedSosItem(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSavePrescription}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
