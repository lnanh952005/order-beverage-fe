import * as React from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/feedback/Skeleton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useAddresses } from '../hooks/useAddresses';
import { ProfileNavTabs } from '../components/ProfileNavTabs';
import { AddressCard } from '../components/AddressCard';
import { AddressDialog } from '../components/AddressDialog';
import { DeleteAddressDialog } from '../components/DeleteAddressDialog';
import type { Address } from '../types/profile.types';

export const AddressesPage = () => {
  const { data: addresses, isLoading, isError, error, refetch } = useAddresses();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingAddress, setDeletingAddress] = React.useState<Address | null>(null);

  const handleAddNew = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleDelete = (address: Address) => {
    setDeletingAddress(address);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span>Địa chỉ nhận hàng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sổ địa chỉ giao hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lưu các địa chỉ thường dùng để đặt nước uống nhanh chóng và thuận tiện hơn
          </p>
        </div>

        <Button onClick={handleAddNew} className="gap-2 shrink-0 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Thêm địa chỉ mới</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <ProfileNavTabs />

      {/* Content States */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách địa chỉ"
          message={error instanceof Error ? error.message : 'Vui lòng kiểm tra lại kết nối mạng.'}
          onRetry={() => refetch()}
        />
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-12 h-12 text-muted-foreground" />}
          title="Bạn chưa lưu địa chỉ giao hàng nào"
          description="Thêm địa chỉ nhận hàng để trải nghiệm đặt đồ uống nhanh chóng và nhận nhiều ưu đãi giao hàng."
          action={
            <Button onClick={handleAddNew} className="gap-2 mt-2">
              <Plus className="w-4 h-4" />
              <span>Thêm địa chỉ đầu tiên</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Address Dialog */}
      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingAddress}
      />

      {/* Delete Address Dialog */}
      <DeleteAddressDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        address={deletingAddress}
      />
    </div>
  );
};
