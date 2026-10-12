import { useState } from 'react';
import { Plus, Edit2, Trash2, CupSoda, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatMoney } from '@/shared/lib/formatters';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
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
  useAdminProducts,
  useToggleProductAvailability,
  useDeleteProduct,
} from '../../hooks/useAdminProducts';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAdminOptionGroups } from '../../hooks/useAdminOptionGroups';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import type { Product } from '../../types/catalog.types';

export function AdminProductsPage() {
  const { isAdmin, isStaff } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Queries
  const { data: productsData, isLoading } = useAdminProducts({
    categoryId: selectedCategoryId,
    q: searchQuery || undefined,
    page,
    limit: 10,
  });
  const { data: categoriesData } = useAdminCategories({ limit: 100 });
  const { data: optionGroups = [] } = useAdminOptionGroups();

  // Mutations
  const toggleAvailabilityMutation = useToggleProductAvailability();
  const deleteMutation = useDeleteProduct();

  const products = productsData?.data || [];
  const meta = productsData?.meta;
  const categories = categoriesData?.data || [];
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleToggleAvailability = (product: Product) => {
    toggleAvailabilityMutation.mutate({
      id: product.id,
      isAvailable: !product.isAvailable,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    await deleteMutation.mutateAsync(deletingProduct.id);
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý danh sách đồ uống, cập nhật giá, kích cỡ và trạng thái mở bán
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenCreate} className="gap-2 rounded-xl cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>Thêm món mới</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 bg-card"
          />
        </div>

        <select
          value={selectedCategoryId ?? ''}
          onChange={(e) => {
            setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
          className="h-10 w-full sm:w-56 rounded-md border border-input bg-card px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Chưa có món nào phù hợp với bộ lọc hiện tại."
            icon={<CupSoda className="h-6 w-6" />}
            action={
              isAdmin && (
                <Button onClick={handleOpenCreate} size="sm">
                  Thêm món ngay
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5">Món đồ uống</th>
                  <th className="px-4 py-3.5">Danh mục</th>
                  <th className="px-4 py-3.5">Giá cơ bản</th>
                  <th className="px-4 py-3.5">Kích cỡ</th>
                  <th className="px-4 py-3.5 text-center">Trạng thái bán</th>
                  {isAdmin && <th className="px-4 py-3.5 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    {/* Name & Thumb */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted/50 overflow-hidden shrink-0 border border-border/60">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                              <CupSoda className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            /{product.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-foreground">
                        {product.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>

                    {/* Base Price */}
                    <td className="px-4 py-3 font-semibold text-primary">
                      {formatMoney(product.basePrice)}
                    </td>

                    {/* Sizes */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes?.map((s) => (
                          <Badge
                            key={s.id}
                            variant={s.isDefault ? 'default' : 'outline'}
                            className="text-[11px] font-normal"
                          >
                            {s.name || s.sizeCode}
                            {s.priceDelta > 0 && ` (+${formatMoney(s.priceDelta)})`}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    {/* Available Toggle (Staff & Admin) */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        disabled={!isStaff || toggleAvailabilityMutation.isPending}
                        onClick={() => handleToggleAvailability(product)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          product.isAvailable
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        }`}
                        title="Nhấn để đổi trạng thái bán"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            product.isAvailable ? 'bg-emerald-500' : 'bg-destructive'
                          }`}
                        />
                        <span>{product.isAvailable ? 'Còn hàng' : 'Hết món'}</span>
                      </button>
                    </td>

                    {/* Actions (Admin Only) */}
                    {isAdmin && (
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(product)}
                          className="h-8 w-8 p-0 cursor-pointer"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingProduct(product)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                          title="Xóa sản phẩm"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-muted/10">
            <span className="text-xs text-muted-foreground">
              Tổng cộng {meta?.total} sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <span className="text-xs font-semibold px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        optionGroups={optionGroups}
        initialData={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Xác nhận xóa sản phẩm</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-foreground/80">
              Bạn có chắc chắn muốn xóa sản phẩm{' '}
              <span className="font-bold text-foreground">
                "{deletingProduct?.name}"
              </span>
              ? Món đồ uống sẽ được ẩn khỏi thực đơn và lưu trữ lịch sử theo quy định.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingProduct(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
              Xóa sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
