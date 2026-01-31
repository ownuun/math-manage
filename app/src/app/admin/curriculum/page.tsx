'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ChevronUp, Folder, FileText, Plus, Pencil, Trash2, LogOut } from 'lucide-react';
import { CurriculumItem, CurriculumSet } from '@/types/database';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/components/AuthProvider';
import { buildTree, TreeNode } from '@/lib/sample-data';

// 항목 추가/편집 모달
function ItemModal({
  isOpen,
  onClose,
  onSave,
  parentId,
  parentDepth,
  editItem,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, isLeaf: boolean) => void;
  parentId: string | null;
  parentDepth: number;
  editItem?: TreeNode | null;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [isLeaf, setIsLeaf] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setIsLeaf(editItem.is_leaf);
    } else {
      setName('');
      setIsLeaf(false);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const isMaxDepth = parentDepth >= 9; // depth 10이 최대

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editItem ? '항목 편집' : '새 항목 추가'}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">항목 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 분수의 덧셈"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {!editItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">항목 유형</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isLeaf}
                      onChange={() => setIsLeaf(false)}
                      disabled={isMaxDepth}
                      className="w-4 h-4 text-blue-500"
                    />
                    <Folder size={16} className="text-yellow-500" />
                    <span className="text-sm text-gray-700">폴더</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isLeaf}
                      onChange={() => setIsLeaf(true)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <FileText size={16} className="text-blue-500" />
                    <span className="text-sm text-gray-700">학습 항목</span>
                  </label>
                </div>
                {isMaxDepth && (
                  <p className="text-xs text-orange-500 mt-1">최대 깊이(10단계)에 도달하여 폴더를 추가할 수 없습니다.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (name.trim()) {
                  onSave(name.trim(), isMaxDepth ? true : isLeaf);
                }
              }}
              disabled={!name.trim() || saving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : editItem ? '저장' : '추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 삭제 확인 모달
function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  hasChildren,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  hasChildren: boolean;
  saving: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">항목 삭제</h3>
        <p className="text-sm text-gray-600 mb-4">
          "{itemName}"을(를) 삭제하시겠습니까?
          {hasChildren && (
            <span className="block text-red-500 mt-1">
              하위 항목도 모두 삭제됩니다.
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 커리큘럼 세트 추가/편집 모달
function SetModal({
  isOpen,
  onClose,
  onSave,
  editSet,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  editSet?: CurriculumSet | null;
  saving: boolean;
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (editSet) {
      setName(editSet.name);
    } else {
      setName('');
    }
  }, [editSet, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editSet ? '커리큘럼 이름 변경' : '새 커리큘럼 추가'}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">커리큘럼 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 중1 수학"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (name.trim()) {
                  onSave(name.trim());
                }
              }}
              disabled={!name.trim() || saving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : editSet ? '저장' : '추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 커리큘럼 세트 삭제 확인 모달
function SetDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  setName,
  itemCount,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteItems: boolean) => void;
  setName: string;
  itemCount: number;
  saving: boolean;
}) {
  const [deleteItems, setDeleteItems] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">커리큘럼 삭제</h3>
        <p className="text-sm text-gray-600 mb-4">
          &quot;{setName}&quot; 커리큘럼을 삭제하시겠습니까?
        </p>

        {itemCount > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteItems}
                onChange={(e) => setDeleteItems(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-red-500"
              />
              <span className="text-sm text-yellow-700">
                하위 항목 {itemCount}개도 함께 삭제
              </span>
            </label>
          </div>
        )}

        <p className="text-xs text-gray-500 mb-4">
          이 커리큘럼을 사용 중인 학생들은 커리큘럼 미배정 상태가 됩니다.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(deleteItems)}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 트리 노드 컴포넌트
function TreeNodeComponent({
  node,
  depth = 0,
  expandedNodes,
  toggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  node: TreeNode;
  depth?: number;
  expandedNodes: Set<string>;
  toggleExpand: (id: string) => void;
  onAddChild: (parentId: string, parentDepth: number) => void;
  onEdit: (node: TreeNode) => void;
  onDelete: (node: TreeNode) => void;
  onMoveUp: (node: TreeNode) => void;
  onMoveDown: (node: TreeNode) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isLeaf = node.is_leaf;
  const canAddChild = !isLeaf && node.depth < 10;

  return (
    <div>
      <div
        className="group flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-gray-50 rounded-lg"
        style={{ marginLeft: depth * 12 }}
      >
        {/* 확장/축소 아이콘 */}
        <button
          className="w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center flex-shrink-0"
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} className="sm:w-4 sm:h-4 text-gray-400" />
            ) : (
              <ChevronRight size={14} className="sm:w-4 sm:h-4 text-gray-400" />
            )
          ) : (
            <span className="w-3 sm:w-4" />
          )}
        </button>

        {/* 폴더/파일 아이콘 */}
        {isLeaf ? (
          <FileText size={14} className="sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <Folder size={14} className="sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
        )}

        {/* 이름 */}
        <span className={`flex-1 text-xs sm:text-sm truncate ${isLeaf ? 'text-gray-700' : 'font-medium text-gray-800'}`}>
          {node.name}
        </span>

        {/* 액션 버튼 - 모바일에서 항상 보임 */}
        <div className="flex items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(node);
            }}
            disabled={isFirst}
            className={`w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded hover:bg-gray-200 ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="위로 이동"
          >
            <ChevronUp size={12} className="sm:w-3.5 sm:h-3.5 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(node);
            }}
            disabled={isLast}
            className={`w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded hover:bg-gray-200 ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="아래로 이동"
          >
            <ChevronDown size={12} className="sm:w-3.5 sm:h-3.5 text-gray-600" />
          </button>
          {canAddChild && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(node.id, node.depth);
              }}
              className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded hover:bg-gray-200"
              title="하위 항목 추가"
            >
              <Plus size={12} className="sm:w-3.5 sm:h-3.5 text-green-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded hover:bg-gray-200"
            title="편집"
          >
            <Pencil size={12} className="sm:w-3.5 sm:h-3.5 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded hover:bg-gray-200"
            title="삭제"
          >
            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5 text-red-600" />
          </button>
        </div>

        {/* depth 표시 - 모바일에서 숨김 */}
        <span className="hidden sm:inline text-xs text-gray-400 ml-2">depth {node.depth}</span>
      </div>

      {/* 자식 노드 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={index === 0}
              isLast={index === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CurriculumPage() {
  const { signOut } = useAuth();
  const {
    curriculumSets,
    curriculumItems,
    loading,
    error,
    addCurriculumItem,
    updateCurriculumItem,
    deleteCurriculumItem,
    addCurriculumSet,
    updateCurriculumSet,
    deleteCurriculumSet,
    moveCurriculumItem,
    refetch,
  } = useAdmin();

  const [selectedSet, setSelectedSet] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [addParentDepth, setAddParentDepth] = useState(0);
  const [editNode, setEditNode] = useState<TreeNode | null>(null);
  const [deleteNode, setDeleteNode] = useState<TreeNode | null>(null);

  // 커리큘럼 세트 모달 상태
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [isSetDeleteModalOpen, setIsSetDeleteModalOpen] = useState(false);
  const [editSet, setEditSet] = useState<CurriculumSet | null>(null);
  const [deleteSet, setDeleteSet] = useState<CurriculumSet | null>(null);

  // 커리큘럼 세트가 로드되면 첫 번째 선택
  useEffect(() => {
    if (curriculumSets.length > 0 && !selectedSet) {
      setSelectedSet(curriculumSets[0].id);
    }
  }, [curriculumSets, selectedSet]);

  // 선택된 커리큘럼의 아이템 필터링
  const filteredItems = useMemo(() =>
    curriculumItems.filter(item => item.set_id === selectedSet),
    [curriculumItems, selectedSet]
  );

  // 트리 구조 생성
  const tree = useMemo(() => buildTree(filteredItems), [filteredItems]);

  // 통계 계산
  const leafCount = filteredItems.filter(item => item.is_leaf).length;
  const folderCount = filteredItems.filter(item => !item.is_leaf).length;
  const maxDepth = Math.max(...filteredItems.map(item => item.depth), 0);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = filteredItems.filter(item => !item.is_leaf).map(item => item.id);
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // 항목 추가
  const handleAddItem = async (name: string, isLeaf: boolean) => {
    setSaving(true);
    const newDepth = addParentId ? addParentDepth + 1 : 1;
    const siblings = curriculumItems.filter(item => item.set_id === selectedSet && item.parent_id === addParentId);
    const newOrder = siblings.length + 1;

    const newItem = {
      id: `item-${Date.now()}`,
      set_id: selectedSet,
      parent_id: addParentId,
      name,
      is_leaf: isLeaf,
      order: newOrder,
      depth: newDepth,
    };

    const { error } = await addCurriculumItem(newItem);

    if (error) {
      alert('항목 추가에 실패했습니다.');
    } else {
      setIsAddModalOpen(false);
      // 부모 노드 펼치기
      if (addParentId) {
        setExpandedNodes(prev => new Set([...prev, addParentId]));
      }
    }
    setSaving(false);
  };

  // 항목 편집
  const handleEditItem = async (name: string) => {
    if (!editNode) return;
    setSaving(true);

    const { error } = await updateCurriculumItem(editNode.id, { name });

    if (error) {
      alert('항목 수정에 실패했습니다.');
    } else {
      setIsAddModalOpen(false);
      setEditNode(null);
    }
    setSaving(false);
  };

  // 항목 삭제
  const handleDeleteItem = async () => {
    if (!deleteNode) return;
    setSaving(true);

    const { error } = await deleteCurriculumItem(deleteNode.id);

    if (error) {
      alert('항목 삭제에 실패했습니다.');
    } else {
      setIsDeleteModalOpen(false);
      setDeleteNode(null);
    }
    setSaving(false);
  };

  // 루트 레벨에 추가
  const handleAddRoot = () => {
    setAddParentId(null);
    setAddParentDepth(0);
    setEditNode(null);
    setIsAddModalOpen(true);
  };

  // 하위 항목 추가
  const handleAddChild = (parentId: string, parentDepth: number) => {
    setAddParentId(parentId);
    setAddParentDepth(parentDepth);
    setEditNode(null);
    setIsAddModalOpen(true);
  };

  // 편집
  const handleEdit = (node: TreeNode) => {
    setEditNode(node);
    setIsAddModalOpen(true);
  };

  // 삭제
  const handleDelete = (node: TreeNode) => {
    setDeleteNode(node);
    setIsDeleteModalOpen(true);
  };

  // 커리큘럼 세트 추가
  const handleAddSet = () => {
    setEditSet(null);
    setIsSetModalOpen(true);
  };

  // 커리큘럼 세트 편집
  const handleEditSet = () => {
    const currentSet = curriculumSets.find(s => s.id === selectedSet);
    if (currentSet) {
      setEditSet(currentSet);
      setIsSetModalOpen(true);
    }
  };

  // 커리큘럼 세트 삭제
  const handleDeleteSet = () => {
    const currentSet = curriculumSets.find(s => s.id === selectedSet);
    if (currentSet) {
      setDeleteSet(currentSet);
      setIsSetDeleteModalOpen(true);
    }
  };

  // 커리큘럼 세트 저장
  const handleSaveSet = async (name: string) => {
    setSaving(true);
    if (editSet) {
      const { error } = await updateCurriculumSet(editSet.id, name);
      if (error) {
        alert('커리큘럼 이름 변경에 실패했습니다.');
      } else {
        setIsSetModalOpen(false);
        setEditSet(null);
      }
    } else {
      const { data, error } = await addCurriculumSet(name);
      if (error) {
        alert('커리큘럼 추가에 실패했습니다.');
      } else {
        setIsSetModalOpen(false);
        if (data) {
          setSelectedSet(data.id);
        }
      }
    }
    setSaving(false);
  };

  // 커리큘럼 세트 삭제 확인
  const handleConfirmDeleteSet = async (deleteItems: boolean) => {
    if (!deleteSet) return;
    setSaving(true);

    const { error } = await deleteCurriculumSet(deleteSet.id, deleteItems);

    if (error) {
      alert('커리큘럼 삭제에 실패했습니다.');
    } else {
      setIsSetDeleteModalOpen(false);
      setDeleteSet(null);
      // 첫 번째 커리큘럼 선택
      const remaining = curriculumSets.filter(s => s.id !== deleteSet.id);
      if (remaining.length > 0) {
        setSelectedSet(remaining[0].id);
      } else {
        setSelectedSet('');
      }
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
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">커리큘럼 관리</h1>
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
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              학생 관리
            </Link>
            <Link
              href="/admin/curriculum"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              커리큘럼
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 커리큘럼 선택 및 컨트롤 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedSet}
              onChange={(e) => {
                setSelectedSet(e.target.value);
                setExpandedNodes(new Set());
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
            >
              {curriculumSets.map(set => (
                <option key={set.id} value={set.id}>{set.name}</option>
              ))}
            </select>

            {/* 커리큘럼 세트 관리 버튼들 */}
            <button
              onClick={handleAddSet}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
              title="새 커리큘럼 추가"
            >
              <Plus size={16} className="text-green-600" />
            </button>
            {selectedSet && (
              <>
                <button
                  onClick={handleEditSet}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  title="커리큘럼 이름 변경"
                >
                  <Pencil size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={handleDeleteSet}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                  title="커리큘럼 삭제"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAddRoot}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-500 text-white hover:bg-green-600 rounded-lg flex items-center gap-1 flex-1 sm:flex-none justify-center"
            >
              <Plus size={14} />
              <span>항목 추가</span>
            </button>
            <button
              onClick={expandAll}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 flex-1 sm:flex-none"
            >
              모두 펼치기
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 flex-1 sm:flex-none"
            >
              모두 접기
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>폴더: {folderCount}개</span>
          <span>학습 항목: {leafCount}개</span>
          <span>최대 깊이: {maxDepth}단계</span>
        </div>

        {/* 트리 뷰 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {tree.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>커리큘럼 항목이 없습니다.</p>
              <button
                onClick={handleAddRoot}
                className="mt-2 text-blue-500 hover:text-blue-600"
              >
                첫 항목 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {tree.map((node, index) => (
                <TreeNodeComponent
                  key={node.id}
                  node={node}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleExpand}
                  onAddChild={handleAddChild}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMoveUp={(n) => moveCurriculumItem(n.id, 'up')}
                  onMoveDown={(n) => moveCurriculumItem(n.id, 'down')}
                  isFirst={index === 0}
                  isLast={index === tree.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Folder size={16} className="text-yellow-500" />
            <span>폴더 (하위 항목 가능)</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            <span>학습 항목 (빙고판에 표시)</span>
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          학생별 진도는 대시보드에서 확인할 수 있습니다.
        </div>
      </main>

      {/* 항목 추가/편집 모달 */}
      <ItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditNode(null);
        }}
        onSave={editNode ? handleEditItem : handleAddItem}
        parentId={addParentId}
        parentDepth={addParentDepth}
        editItem={editNode}
        saving={saving}
      />

      {/* 삭제 확인 모달 */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteNode(null);
        }}
        onConfirm={handleDeleteItem}
        itemName={deleteNode?.name || ''}
        hasChildren={(deleteNode?.children?.length || 0) > 0}
        saving={saving}
      />

      {/* 커리큘럼 세트 추가/편집 모달 */}
      <SetModal
        isOpen={isSetModalOpen}
        onClose={() => {
          setIsSetModalOpen(false);
          setEditSet(null);
        }}
        onSave={handleSaveSet}
        editSet={editSet}
        saving={saving}
      />

      {/* 커리큘럼 세트 삭제 확인 모달 */}
      <SetDeleteModal
        isOpen={isSetDeleteModalOpen}
        onClose={() => {
          setIsSetDeleteModalOpen(false);
          setDeleteSet(null);
        }}
        onConfirm={handleConfirmDeleteSet}
        setName={deleteSet?.name || ''}
        itemCount={deleteSet ? curriculumItems.filter(i => i.set_id === deleteSet.id).length : 0}
        saving={saving}
      />
    </div>
  );
}
