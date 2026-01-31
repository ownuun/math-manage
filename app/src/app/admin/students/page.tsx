'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Circle, UserCheck, Link2, Phone, Pencil, Trash2, Archive, ArchiveRestore, LogOut } from 'lucide-react';
import { StatusColor, STATUS_CONFIG, Profile, ROLE_PERMISSIONS, UserRole } from '@/types/database';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/components/AuthProvider';

const StatusIcon = ({ status, size = 16 }: { status: StatusColor; size?: number }) => {
  const config = STATUS_CONFIG[status];
  return <Circle size={size} fill={config.color} color={config.color} />;
};

export default function StudentsPage() {
  const { signOut } = useAuth();
  const {
    profiles,
    studentStats,
    loading,
    error,
    approveUser,
    linkParentToStudents,
    getParentLinkedStudents,
    updatePhone,
    updateProfile,
    deleteUser,
    archiveUser,
    unarchiveUser,
    refetch,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'parent' | 'pending'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'link' | 'phone' | 'edit' | 'delete' | 'archive' | 'unarchive' | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);

  // 학생/학부모 필터링
  const filteredProfiles = profiles.filter(profile => {
    if (profile.role === 'admin') return false;
    // 보관 상태 필터링
    if (showArchived) {
      if (!profile.is_archived) return false;
    } else {
      if (profile.is_archived) return false;
    }
    if (roleFilter !== 'all' && profile.role !== roleFilter) return false;
    if (searchQuery && !profile.name.includes(searchQuery) && !profile.email.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  // 보관된 사용자 수
  const archivedCount = profiles.filter(p => p.role !== 'admin' && p.is_archived).length;

  // 학생 목록 (학부모 연결용)
  const students = profiles.filter(p => p.role === 'student');

  // 학생별 진행률 가져오기
  const getStudentStat = (studentId: string) => {
    return studentStats.find(s => s.userId === studentId);
  };

  const handleApprove = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await approveUser(selectedProfile.id, selectedRole);

    if (error) {
      alert('승인에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  const handleLinkParent = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await linkParentToStudents(selectedProfile.id, selectedStudentIds);

    if (error) {
      alert('연결에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // 전화번호 업데이트
  const handleUpdatePhone = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await updatePhone(selectedProfile.id, phoneInput || null);

    if (error) {
      alert('전화번호 저장에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 프로필 정보 수정
  const handleUpdateProfile = async () => {
    if (!selectedProfile || !nameInput.trim()) return;
    setSaving(true);

    const { error } = await updateProfile(selectedProfile.id, {
      name: nameInput.trim(),
      phone: phoneInput || null,
    });

    if (error) {
      alert('정보 수정에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 사용자 삭제
  const handleDeleteUser = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await deleteUser(selectedProfile.id);

    if (error) {
      alert('삭제에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 사용자 보관
  const handleArchiveUser = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await archiveUser(selectedProfile.id);

    if (error) {
      alert('보관에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 사용자 보관 해제
  const handleUnarchiveUser = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await unarchiveUser(selectedProfile.id);

    if (error) {
      alert('복원에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  const openModal = async (profile: Profile, type: 'approve' | 'link' | 'phone' | 'edit' | 'delete' | 'archive' | 'unarchive') => {
    setSelectedProfile(profile);
    setModalType(type);
    setSelectedRole('student');
    setPhoneInput(profile.phone || '');
    setNameInput(profile.name || '');
    
    if (type === 'link') {
      const { data } = await getParentLinkedStudents(profile.id);
      setSelectedStudentIds(data || []);
    } else {
      setSelectedStudentIds([]);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedProfile(null);
    setModalType(null);
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

  // 승인 대기 수
  const pendingCount = profiles.filter(p => p.role === 'pending').length;

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">학생 관리</h1>
              {pendingCount > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  승인 대기 {pendingCount}
                </span>
              )}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="로그아웃"
            >
              <LogOut size={18} />
              <span className="text-sm hidden sm:inline">로그아웃</span>
            </button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2 mt-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              대시보드
            </Link>
            <Link
              href="/admin/students"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
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

          {/* 보관함 토글 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !showArchived
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              활성 사용자
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                showArchived
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Archive size={14} />
              보관함
              {archivedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs">
                  {archivedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 검색 및 필터 */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'student' | 'parent' | 'pending')}
            className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="pending">승인 대기</option>
            <option value="student">학생</option>
            <option value="parent">학부모</option>
          </select>
        </div>

        {/* 모바일 카드 레이아웃 */}
        <div className="md:hidden space-y-3">
          {filteredProfiles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              {showArchived
                ? '보관된 사용자가 없습니다.'
                : searchQuery || roleFilter !== 'all'
                ? '검색 결과가 없습니다.'
                : '등록된 사용자가 없습니다.'}
            </div>
          ) : (
            filteredProfiles.map((profile) => {
              const isStudent = profile.role === 'student';
              const isParent = profile.role === 'parent';
              const isPending = profile.role === 'pending';
              const stat = isStudent ? getStudentStat(profile.id) : null;
              const linkedStudent = isParent ? students.find(s => s.id === profile.linked_student_id) : null;

              return (
                <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isPending
                          ? 'bg-yellow-100 text-yellow-700'
                          : isStudent
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {ROLE_PERMISSIONS[profile.role]?.label || profile.role}
                      </span>
                      {!isPending && (
                        <>
                          <button
                            onClick={() => openModal(profile, 'edit')}
                            className="p-1 text-gray-400 hover:text-blue-500"
                            title="정보 수정"
                          >
                            <Pencil size={14} />
                          </button>
                          {showArchived ? (
                            <button
                              onClick={() => openModal(profile, 'unarchive')}
                              className="p-1 text-gray-400 hover:text-green-500"
                              title="복원"
                            >
                              <ArchiveRestore size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => openModal(profile, 'archive')}
                              className="p-1 text-gray-400 hover:text-orange-500"
                              title="보관"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => openModal(profile, 'delete')}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 학생 정보 */}
                  {isStudent && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">전화번호</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-700">{profile.phone || '미등록'}</span>
                          <button
                            onClick={() => openModal(profile, 'phone')}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Phone size={14} />
                          </button>
                        </div>
                      </div>
                      {stat && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">진행률</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${stat.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{stat.progressPercent}%</span>
                          </div>
                        </div>
                      )}
                      <Link
                        href={`/admin/students/${profile.id}`}
                        className="block w-full text-center py-2 mt-2 text-blue-500 hover:text-blue-600 text-sm border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        상세 보기
                      </Link>
                    </div>
                  )}

                  {/* 학부모 정보 */}
                  {isParent && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">전화번호</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-700">{profile.phone || '미등록'}</span>
                          <button
                            onClick={() => openModal(profile, 'phone')}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Phone size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">연결 학생</span>
                        {linkedStudent ? (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-700">{linkedStudent.name}</span>
                            <button
                              onClick={() => openModal(profile, 'link')}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <Link2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openModal(profile, 'link')}
                            className="text-blue-500 hover:text-blue-600 text-xs"
                          >
                            학생 연결
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 승인 대기 */}
                  {isPending && (
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => openModal(profile, 'approve')}
                        className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg flex items-center justify-center gap-1"
                      >
                        <UserCheck size={14} />
                        승인
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 데스크탑 테이블 레이아웃 */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연결 학생</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">진행률</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProfiles.map((profile) => {
                const isStudent = profile.role === 'student';
                const isParent = profile.role === 'parent';
                const isPending = profile.role === 'pending';
                const stat = isStudent ? getStudentStat(profile.id) : null;
                const linkedStudent = isParent ? students.find(s => s.id === profile.linked_student_id) : null;

                return (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{profile.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>{profile.phone || '-'}</span>
                        {(isStudent || isParent) && (
                          <button
                            onClick={() => openModal(profile, 'phone')}
                            className="text-blue-500 hover:text-blue-600"
                            title="전화번호 수정"
                          >
                            <Phone size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isPending
                          ? 'bg-yellow-100 text-yellow-700'
                          : isStudent
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {ROLE_PERMISSIONS[profile.role]?.label || profile.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {isParent && linkedStudent && (
                        <div className="flex items-center gap-1">
                          <span>{linkedStudent.name}</span>
                          <button
                            onClick={() => openModal(profile, 'link')}
                            className="text-blue-500 hover:text-blue-600"
                            title="연결 변경"
                          >
                            <Link2 size={14} />
                          </button>
                        </div>
                      )}
                      {isParent && !linkedStudent && (
                        <button
                          onClick={() => openModal(profile, 'link')}
                          className="text-blue-500 hover:text-blue-600 text-xs"
                        >
                          학생 연결
                        </button>
                      )}
                      {!isParent && '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stat && (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${stat.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{stat.progressPercent}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending ? (
                          <button
                            onClick={() => openModal(profile, 'approve')}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg flex items-center gap-1"
                          >
                            <UserCheck size={14} />
                            승인
                          </button>
                        ) : (
                          <>
                            {isStudent && (
                              <Link
                                href={`/admin/students/${profile.id}`}
                                className="text-blue-500 hover:text-blue-600 text-sm"
                              >
                                상세
                              </Link>
                            )}
                            <button
                              onClick={() => openModal(profile, 'edit')}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="정보 수정"
                            >
                              <Pencil size={16} />
                            </button>
                            {showArchived ? (
                              <button
                                onClick={() => openModal(profile, 'unarchive')}
                                className="p-1 text-gray-400 hover:text-green-500"
                                title="복원"
                              >
                                <ArchiveRestore size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal(profile, 'archive')}
                                className="p-1 text-gray-400 hover:text-orange-500"
                                title="보관"
                              >
                                <Archive size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openModal(profile, 'delete')}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="삭제"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {showArchived
                      ? '보관된 사용자가 없습니다.'
                      : searchQuery || roleFilter !== 'all'
                      ? '검색 결과가 없습니다.'
                      : '등록된 사용자가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 통계 */}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>전체: {filteredProfiles.length}명</span>
          <span>승인 대기: {filteredProfiles.filter(p => p.role === 'pending').length}명</span>
          <span>학생: {filteredProfiles.filter(p => p.role === 'student').length}명</span>
          <span>학부모: {filteredProfiles.filter(p => p.role === 'parent').length}명</span>
        </div>
      </main>

      {/* 승인 모달 */}
      {modalType === 'approve' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">사용자 승인</h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{selectedProfile.name}</p>
              <p className="text-sm text-gray-500">{selectedProfile.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">역할 선택</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">학생</option>
                <option value="parent">학부모</option>
              </select>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '처리 중...' : '승인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 학부모-학생 연결 모달 */}
      {modalType === 'link' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">학생 연결</h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{selectedProfile.name} (학부모)</p>
              <p className="text-sm text-gray-500">
                {selectedStudentIds.length > 0 
                  ? `${selectedStudentIds.length}명 선택됨`
                  : '연결된 학생 없음'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연결할 학생 선택</label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {students.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">등록된 학생이 없습니다.</p>
                ) : (
                  students.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 text-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-800">{student.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleLinkParent}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '처리 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 전화번호 수정 모달 */}
      {modalType === 'phone' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">전화번호 수정</h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{selectedProfile.name}</p>
              <p className="text-sm text-gray-500">{ROLE_PERMISSIONS[selectedProfile.role]?.label}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpdatePhone}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정보 수정 모달 */}
      {modalType === 'edit' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">정보 수정</h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-500">{selectedProfile.email}</p>
              <p className="text-sm text-gray-500">{ROLE_PERMISSIONS[selectedProfile.role]?.label}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="이름 입력"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={saving || !nameInput.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {modalType === 'delete' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">사용자 삭제</h3>

            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-red-800 mb-1">{selectedProfile.name}</p>
              <p className="text-sm text-red-600">{selectedProfile.email}</p>
              <p className="text-sm text-red-600 mt-2">
                이 사용자의 모든 데이터(진행 상태, 메모 등)가 삭제됩니다.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 보관 확인 모달 */}
      {modalType === 'archive' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">사용자 보관</h3>

            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-orange-800 mb-1">{selectedProfile.name}</p>
              <p className="text-sm text-orange-600">{selectedProfile.email}</p>
              <p className="text-sm text-orange-700 mt-2">
                보관된 사용자는 목록에서 숨겨지지만, 데이터는 보존됩니다.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              이 사용자를 보관함으로 이동하시겠습니까?
            </p>

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleArchiveUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <Archive size={14} />
                {saving ? '보관 중...' : '보관'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 복원 확인 모달 */}
      {modalType === 'unarchive' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">사용자 복원</h3>

            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-green-800 mb-1">{selectedProfile.name}</p>
              <p className="text-sm text-green-600">{selectedProfile.email}</p>
              <p className="text-sm text-green-700 mt-2">
                복원된 사용자는 다시 활성 목록에 표시됩니다.
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              이 사용자를 복원하시겠습니까?
            </p>

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUnarchiveUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <ArchiveRestore size={14} />
                {saving ? '복원 중...' : '복원'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
