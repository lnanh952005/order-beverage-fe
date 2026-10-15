import { useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
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
  useAdminCategories,
  useDeleteCategory,
} from '../../hooks/useAdminCategories';
import { CategoryFormModal } from '../../components/admin/CategoryFormModal';
import type { Category } from '../../types/catalog.types';

export function AdminCategoriesPage() {
  const { isAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete confirmation dialog state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: categoriesData, isLoading } = useAdminCategories({ limit: 100 });
  const deleteMutation = useDeleteCategory();

  const categories = categoriesData?.data || [];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quản lý danh mục
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh mục phân loại đồ uống trên thực đơn
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenCreate} className="gap-2 rounded-xl cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Thêm danh mục</span>
          </Button>
        )}
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="Chưa có danh mục nào"
            description="Hãy tạo danh mục đầu tiên để phân loại đồ uống của bạn."
            icon={<FolderTree className="h-6 w-6" />}
            action={
              isAdmin && (
                <Button onClick={handleOpenCreate} size="sm">
                  Thêm danh mục ngay
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 w-16">Hình ảnh</th>
                  <th className="px-5 py-3.5">Tên danh mục</th>
                  <th className="px-5 py-3.5">Slug (URL)</th>
                  <th className="px-5 py-3.5 text-center">Thứ tự</th>
                  <th className="px-5 py-3.5 text-center">Trạng thái</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-10 w-10 rounded-lg object-cover border border-border/60 bg-muted/20"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary/70 border border-primary/20">
                          <FolderTree className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {cat.name}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-4 text-center font-medium">
                      {cat.sortOrder}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge
                        variant={cat.isActive ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {cat.isActive ? 'Hoạt động' : 'Đang ẩn'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}
                          className="h-8 w-8 p-0 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingCategory(cat)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingCategory}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Xác nhận xóa danh mục</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground/80">
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <span className="font-bold text-foreground">
                "{deletingCategory?.name}"
              </span>
              ? Danh mục chỉ có thể xóa nếu không còn sản phẩm nào thuộc về nó.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingCategory(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Xóa danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
