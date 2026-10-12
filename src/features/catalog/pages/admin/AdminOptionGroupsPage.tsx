import { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney } from '@/shared/lib/formatters';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Skeleton, EmptyState, Spinner } from '@/shared/components/feedback';
import {
  useAdminOptionGroups,
  useDeleteOptionGroup,
  useUpdateOption,
  useDeleteOption,
} from '../../hooks/useAdminOptionGroups';
import { OptionGroupFormModal } from '../../components/admin/OptionGroupFormModal';
import { OptionFormModal } from '../../components/admin/OptionFormModal';
import type { Option, OptionGroup } from '../../types/catalog.types';

export function AdminOptionGroupsPage() {
  const { isAdmin, isStaff } = useAuth();

  // Modals state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);

  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [editingOption, setEditingOption] = useState<Option | null>(null);

  // Deletion state
  const [deletingGroup, setDeletingGroup] = useState<OptionGroup | null>(null);
  const [deletingOption, setDeletingOption] = useState<Option | null>(null);

  // Queries & Mutations
  const { data: optionGroups = [], isLoading } = useAdminOptionGroups();
  const deleteGroupMutation = useDeleteOptionGroup();
  const updateOptionMutation = useUpdateOption();
  const deleteOptionMutation = useDeleteOption();

  // Handlers for Option Group
  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: OptionGroup) => {
    setEditingGroup(group);
    setGroupModalOpen(true);
  };

  const handleConfirmDeleteGroup = async () => {
    if (!deletingGroup) return;
    await deleteGroupMutation.mutateAsync(deletingGroup.id);
    setDeletingGroup(null);
  };

  // Handlers for Option
  const handleOpenCreateOption = (groupId: number) => {
    setActiveGroupId(groupId);
    setEditingOption(null);
    setOptionModalOpen(true);
  };

  const handleOpenEditOption = (groupId: number, option: Option) => {
    setActiveGroupId(groupId);
    setEditingOption(option);
    setOptionModalOpen(true);
  };

  const handleToggleOptionAvailability = (option: Option) => {
    updateOptionMutation.mutate({
      id: option.id,
      data: { isAvailable: !option.isAvailable },
    });
  };

  const handleConfirmDeleteOption = async () => {
    if (!deletingOption) return;
    await deleteOptionMutation.mutateAsync(deletingOption.id);
    setDeletingOption(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Nhóm tùy chọn & Topping
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cấu hình mức đường, đá, topping và các tùy chọn bổ sung cho đồ uống
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenCreateGroup} className="gap-2 rounded-xl cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Thêm nhóm tùy chọn</span>
          </Button>
        )}
      </div>

      {/* Groups List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : optionGroups.length === 0 ? (
        <EmptyState
          title="Chưa có nhóm tùy chọn nào"
          description="Tạo các nhóm tùy chọn như 'Mức đường', 'Mức đá' hoặc 'Topping' để khách hàng tùy biến món."
          icon={<Layers className="h-6 w-6" />}
          action={
            isAdmin && (
              <Button onClick={handleOpenCreateGroup} size="sm">
                Tạo nhóm đầu tiên
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-6">
          {optionGroups.map((group) => {
            const isSingle = group.selectType === 'single';

            return (
              <div
                key={group.id}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs"
              >
                {/* Group Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border bg-muted/20">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-foreground">
                      {group.name}
                    </h2>
                    <Badge variant={isSingle ? 'secondary' : 'default'} className="text-xs">
                      {isSingle ? 'Chọn 1 (Single)' : 'Chọn nhiều (Multiple)'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {group.minSelect > 0
                        ? `Bắt buộc (${group.minSelect} - ${group.maxSelect} món)`
                        : `Tối đa ${group.maxSelect} món`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreateOption(group.id)}
                          className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Thêm tùy chọn</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditGroup(group)}
                          className="h-8 w-8 p-0 cursor-pointer"
                          title="Sửa nhóm"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingGroup(group)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                          title="Xóa nhóm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Options Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border/60 bg-muted/10 text-[11px] font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-5 py-2.5">Tên tùy chọn</th>
                        <th className="px-5 py-2.5">Giá thêm</th>
                        <th className="px-5 py-2.5 text-center">Mặc định</th>
                        <th className="px-5 py-2.5 text-center">Trạng thái bán</th>
                        {isAdmin && <th className="px-5 py-2.5 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {!group.options || group.options.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-6 text-center text-xs text-muted-foreground"
                          >
                            Chưa có tùy chọn nào trong nhóm này.
                          </td>
                        </tr>
                      ) : (
                        group.options.map((option) => (
                          <tr key={option.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-3 font-medium text-foreground">
                              {option.name}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">
                              {option.priceDelta > 0
                                ? `+${formatMoney(option.priceDelta)}`
                                : '0 đ (Miễn phí)'}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {option.isDefault ? (
                                <Badge variant="secondary" className="text-[11px]">
                                  Mặc định
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground/40 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                type="button"
                                disabled={!isStaff || updateOptionMutation.isPending}
                                onClick={() => handleToggleOptionAvailability(option)}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                  option.isAvailable
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                                title="Nhấn để đổi trạng thái bán"
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    option.isAvailable ? 'bg-emerald-500' : 'bg-destructive'
                                  }`}
                                />
                                <span>{option.isAvailable ? 'Còn hàng' : 'Hết hàng'}</span>
                              </button>
                            </td>
                            {isAdmin && (
                              <td className="px-5 py-3 text-right space-x-1 whitespace-nowrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditOption(group.id, option)}
                                  className="h-7 w-7 p-0 cursor-pointer"
                                  title="Sửa tùy chọn"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingOption(option)}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive cursor-pointer"
                                  title="Xóa tùy chọn"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Group Form Modal */}
      <OptionGroupFormModal
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        initialData={editingGroup}
      />

      {/* Option Form Modal */}
      {activeGroupId && (
        <OptionFormModal
          open={optionModalOpen}
          onOpenChange={setOptionModalOpen}
          groupId={activeGroupId}
          initialData={editingOption}
        />
      )}

      {/* Delete Group Dialog */}
      <Dialog
        open={Boolean(deletingGroup)}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Xác nhận xóa nhóm tùy chọn</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground/80">
              Bạn có chắc chắn muốn xóa nhóm tùy chọn{' '}
              <span className="font-bold text-foreground">
                "{deletingGroup?.name}"
              </span>
              ? Nhóm tùy chọn sẽ bị hủy liên kết khỏi tất cả các sản phẩm đang áp dụng.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              disabled={deleteGroupMutation.isPending}
              onClick={() => setDeletingGroup(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={deleteGroupMutation.isPending}
              onClick={handleConfirmDeleteGroup}
            >
              {deleteGroupMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Xóa nhóm tùy chọn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Option Dialog */}
      <Dialog
        open={Boolean(deletingOption)}
        onOpenChange={(open) => !open && setDeletingOption(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Xác nhận xóa tùy chọn</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground/80">
              Bạn có chắc chắn muốn xóa tùy chọn{' '}
              <span className="font-bold text-foreground">
                "{deletingOption?.name}"
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              disabled={deleteOptionMutation.isPending}
              onClick={() => setDeletingOption(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={deleteOptionMutation.isPending}
              onClick={handleConfirmDeleteOption}
            >
              {deleteOptionMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Xóa tùy chọn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
