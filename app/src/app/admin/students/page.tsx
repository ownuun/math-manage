'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Circle, Check, UserCheck, Book, Link2 } from 'lucide-react';
import { StatusColor, STATUS_CONFIG, Profile, ROLE_PERMISSIONS, UserRole } from '@/types/database';
import { useAdmin } from '@/hooks/useAdmin';

const StatusIcon = ({ status, size = 16 }: { status: StatusColor; size?: number }) => {
  const config = STATUS_CONFIG[status];
  return <Circle size={size} fill={config.color} color={config.color} />;
};

export default function StudentsPage() {
  const {
    profiles,
    curriculumSets,
    studentStats,
    loading,
    error,
    approveUser,
    assignCurriculum,
    linkParentToStudent,
    refetch,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'parent' | 'pending'>('all');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'curriculum' | 'link' | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [saving, setSaving] = useState(false);

  // 학생/학부모 필터링
  const filteredProfiles = profiles.filter(profile => {
    if (profile.role === 'admin') return false;
    if (roleFilter !== 'all' && profile.role !== roleFilter) return false;
    if (searchQuery && !profile.name.includes(searchQuery) && !profile.email.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  // 학생 목록 (학부모 연결용)
  const students = profiles.filter(p => p.role === 'student');

  // 학생별 진행률 가져오기
  const getStudentStat = (studentId: string) => {
    return studentStats.find(s => s.userId === studentId);
  };

  // 승인 처리
  const handleApprove = async () => {
    if (!selectedProfile) return;
    setSaving(true);

    const { error } = await approveUser(
      selectedProfile.id,
      selectedRole,
      selectedRole === 'student' ? selectedCurriculumId : undefined
    );

    if (error) {
      alert('승인에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 커리큘럼 배정
  const handleAssignCurriculum = async () => {
    if (!selectedProfile || !selectedCurriculumId) return;
    setSaving(true);

    const { error } = await assignCurriculum(selectedProfile.id, selectedCurriculumId);

    if (error) {
      alert('커리큘럼 배정에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 학부모-학생 연결
  const handleLinkParent = async () => {
    if (!selectedProfile || !selectedStudentId) return;
    setSaving(true);

    const { error } = await linkParentToStudent(selectedProfile.id, selectedStudentId);

    if (error) {
      alert('연결에 실패했습니다.');
    } else {
      closeModal();
      refetch();
    }
    setSaving(false);
  };

  // 모달 열기
  const openModal = (profile: Profile, type: 'approve' | 'curriculum' | 'link') => {
    setSelectedProfile(profile);
    setModalType(type);
    setSelectedRole('student');
    setSelectedCurriculumId(profile.curriculum_id || curriculumSets[0]?.id || '');
    setSelectedStudentId(profile.linked_student_id || '');
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 검색 및 필터 */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'student' | 'parent' | 'pending')}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="pending">승인 대기</option>
            <option value="student">학생</option>
            <option value="parent">학부모</option>
          </select>
        </div>

        {/* 학생 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">커리큘럼</th>
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
                const curriculum = curriculumSets.find(c => c.id === profile.curriculum_id);
                const linkedStudent = isParent ? students.find(s => s.id === profile.linked_student_id) : null;

                return (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{profile.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{profile.email}</td>
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
                      {isStudent && (
                        <div className="flex items-center gap-1">
                          <span>{curriculum?.name || '미배정'}</span>
                          <button
                            onClick={() => openModal(profile, 'curriculum')}
                            className="text-blue-500 hover:text-blue-600"
                            title="커리큘럼 변경"
                          >
                            <Book size={14} />
                          </button>
                        </div>
                      )}
                      {isParent && linkedStudent && (
                        <div className="flex items-center gap-1">
                          <span>→ {linkedStudent.name}</span>
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
                      {isPending && '-'}
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
                      {isPending ? (
                        <button
                          onClick={() => openModal(profile, 'approve')}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg flex items-center gap-1 ml-auto"
                        >
                          <UserCheck size={14} />
                          승인
                        </button>
                      ) : isStudent ? (
                        <Link
                          href={`/admin/students/${profile.id}`}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          상세
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery || roleFilter !== 'all'
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

            <div className="space-y-4">
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

              {selectedRole === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">커리큘럼 배정</label>
                  <select
                    value={selectedCurriculumId}
                    onChange={(e) => setSelectedCurriculumId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    {curriculumSets.map(set => (
                      <option key={set.id} value={set.id}>{set.name}</option>
                    ))}
                  </select>
                </div>
              )}
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
                disabled={saving || (selectedRole === 'student' && !selectedCurriculumId)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '처리 중...' : '승인'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커리큘럼 변경 모달 */}
      {modalType === 'curriculum' && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">커리큘럼 변경</h3>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{selectedProfile.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">커리큘럼 선택</label>
              <select
                value={selectedCurriculumId}
                onChange={(e) => setSelectedCurriculumId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {curriculumSets.map(set => (
                  <option key={set.id} value={set.id}>{set.name}</option>
                ))}
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
                onClick={handleAssignCurriculum}
                disabled={saving || !selectedCurriculumId}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '처리 중...' : '변경'}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연결할 학생 선택</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
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
                onClick={handleLinkParent}
                disabled={saving || !selectedStudentId}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? '처리 중...' : '연결'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
