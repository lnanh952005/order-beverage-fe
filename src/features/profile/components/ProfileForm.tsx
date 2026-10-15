import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Phone,
  User as UserIcon,
  Camera,
  Trash2,
  Save,
  Shield,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Spinner } from '@/shared/components/feedback';
import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from '../schemas/profile.schemas';
import {
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
} from '../hooks/useProfile';
import type { User } from '../types/profile.types';

interface ProfileFormProps {
  user: User;
}

export const ProfileForm = ({ user }: ProfileFormProps) => {
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user.fullName || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
    },
  });

  const prevUserIdRef = React.useRef(user.id);

  // Keep form in sync only when user ID changes (e.g. account switch)
  React.useEffect(() => {
    if (prevUserIdRef.current !== user.id) {
      prevUserIdRef.current = user.id;
      reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UpdateProfileFormData) => {
    const trimmedPhone = data.phone?.trim();

    updateProfileMutation.mutate(
      {
        fullName: data.fullName.trim(),
        phone: trimmedPhone ? trimmedPhone : null,
      },
      {
        onSuccess: (updatedUser) => {
          reset({
            fullName: updatedUser.fullName || '',
            phone: updatedUser.phone || '',
            avatarUrl: updatedUser.avatarUrl || '',
          });
        },
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (JPEG, PNG, WEBP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 5MB');
      return;
    }

    uploadAvatarMutation.mutate(file);
    e.target.value = '';
  };

  const handleDeleteAvatar = () => {
    deleteAvatarMutation.mutate();
  };

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAvatarBusy =
    uploadAvatarMutation.isPending || deleteAvatarMutation.isPending;

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl">Hồ sơ cá nhân</CardTitle>
        <CardDescription>
          Cập nhật thông tin định danh và thông tin liên hệ của bạn trên hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section with direct Cloudinary File Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/30 border border-muted/50">
          <div className="flex items-center gap-4">
            {/* Interactive Avatar */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAvatarBusy}
                aria-label="Đổi ảnh đại diện"
                className="relative block w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer shadow-sm group-hover:opacity-90"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {getInitials(user.fullName)}
                  </div>
                )}

                {/* Hover overlay with Camera icon */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium leading-tight">Đổi ảnh</span>
                </div>

                {/* Loading spinner overlay */}
                {isAvatarBusy && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Spinner size={22} />
                  </div>
                )}
              </button>
            </div>

            {/* User Name, Email and Role Badge */}
            <div>
              <p className="font-semibold text-base text-foreground">
                {user.fullName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
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

          {/* Action buttons for Avatar */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 self-start sm:self-center">
            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isAvatarBusy}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs h-9 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isAvatarBusy ? 'Đang tải lên...' : 'Tải ảnh mới'}</span>
            </Button>

            {user.avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isAvatarBusy}
                onClick={handleDeleteAvatar}
                className="gap-1.5 text-xs h-9 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ảnh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Profile Information Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
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
              <Label
                htmlFor="phone"
                className="flex items-center gap-1.5 text-xs font-semibold"
              >
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

            {/* Email (Read-only, spans 2 cols on medium screens) */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="email"
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
              >
                <Mail className="w-3.5 h-3.5" />
                Địa chỉ Email (Cố định theo tài khoản)
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted/40 cursor-not-allowed max-w-md"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-muted/50">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
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
