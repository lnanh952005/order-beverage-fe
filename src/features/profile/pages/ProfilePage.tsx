import { User } from 'lucide-react';
import { Skeleton } from '@/shared/components/feedback/Skeleton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useProfile } from '../hooks/useProfile';
import { ProfileNavTabs } from '../components/ProfileNavTabs';
import { ProfileForm } from '../components/ProfileForm';
import { GoogleIdentityCard } from '../components/GoogleIdentityCard';

export const ProfilePage = () => {
  const { data: user, isLoading, isError, error, refetch } = useProfile();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <ErrorState
          title="Không thể tải thông tin tài khoản"
          message={error instanceof Error ? error.message : 'Vui lòng kiểm tra lại kết nối và thử lại.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
          <User className="w-4 h-4" />
          <span>Tài khoản của tôi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Quản lý thông tin cá nhân
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cập nhật thông tin định danh, số điện thoại và các tài khoản liên kết
        </p>
      </div>

      {/* Navigation Tabs */}
      <ProfileNavTabs />

      {/* Main Content Grid */}
      <div className="space-y-6">
        <ProfileForm user={user} />
        <GoogleIdentityCard user={user} />
      </div>
    </div>
  );
};
