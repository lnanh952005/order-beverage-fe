import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, User as UserIcon, Image as ImageIcon, Save, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Spinner } from '@/shared/components/feedback';
import { updateProfileSchema, type UpdateProfileFormData } from '../schemas/profile.schemas';
import { useUpdateProfile } from '../hooks/useProfile';
import type { User } from '../types/profile.types';

interface ProfileFormProps {
  user: User;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
    },
  });

  // Keep form in sync when user prop changes
  React.useEffect(() => {
    reset({
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, [user, reset]);

  const watchedAvatarUrl = useWatch({ control, name: 'avatarUrl' });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate({
      fullName: data.fullName,
      phone: data.phone ? data.phone : null,
      avatarUrl: data.avatarUrl ? data.avatarUrl : null,
    });
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl">Hồ sơ cá nhân</CardTitle>
        <CardDescription>
          Cập nhật thông tin định danh và thông tin liên hệ của bạn trên hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar display & preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-muted/50">
            <div className="relative">
              {watchedAvatarUrl ? (
                <img
                  src={watchedAvatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                  onError={(e) => {
                    // Fallback to placeholder if broken image
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border-2 border-primary/20 shadow-xs">
                  {getInitials(user.fullName)}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={
                    user.role === 'admin'
                      ? 'destructive'
                      : user.role === 'staff'
                        ? 'default'
                        : 'secondary'
                  }
                  className="text-[11px]"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role === 'admin'
                    ? 'Quản trị viên'
                    : user.role === 'staff'
                      ? 'Nhân viên cửa hàng'
                      : 'Khách hàng thân thiết'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                Địa chỉ Email (Cố định)
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted/40 cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-1.5 text-xs font-semibold">
                <UserIcon className="w-3.5 h-3.5" />
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Nhập họ và tên đầy đủ"
                {...register('fullName')}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-semibold">
                <Phone className="w-3.5 h-3.5" />
                Số điện thoại liên lạc
              </Label>
              <Input
                id="phone"
                placeholder="Ví dụ: 0901234567"
                {...register('phone')}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="flex items-center gap-1.5 text-xs font-semibold">
                <ImageIcon className="w-3.5 h-3.5" />
                Đường dẫn ảnh đại diện (URL)
              </Label>
              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatarUrl')}
                aria-invalid={Boolean(errors.avatarUrl)}
              />
              {errors.avatarUrl && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.avatarUrl.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending || !isDirty}
              className="gap-2 min-w-[140px]"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Spinner size={16} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
