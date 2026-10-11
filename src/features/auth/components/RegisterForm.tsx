import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { registerSchema, type RegisterFormValues } from '../schemas/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { GoogleLoginButton } from './GoogleLoginButton';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { ROUTE_PATHS } from '@/shared/constants/routes';

export function RegisterForm() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone ? values.phone : undefined,
      });
      toast.success('Đăng ký tài khoản thành công!');
      navigate(ROUTE_PATHS.HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_ALREADY_EXISTS') {
          setError('email', { message: 'Email này đã được sử dụng.' });
        }
        if (err.details && err.details.length > 0) {
          err.details.forEach((d) => {
            if (
              d.field === 'email' ||
              d.field === 'password' ||
              d.field === 'fullName' ||
              d.field === 'phone'
            ) {
              setError(d.field as keyof RegisterFormValues, { message: d.message });
            }
          });
        }
        setServerError(getErrorMessage(err.code, err.message));
      } else {
        setServerError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    }
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setServerError(null);
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle(idToken);
      if (result.isNewUser) {
        toast.success('Chào mừng bạn gia nhập Beverage Hub!');
      } else {
        toast.success('Đăng nhập Google thành công!');
      }
      navigate(ROUTE_PATHS.HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(getErrorMessage(err.code, err.message));
      } else {
        setServerError('Đăng ký bằng Google không thành công. Vui lòng thử lại.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{serverError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="register-fullName">Họ và tên</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-fullName"
              placeholder="Nguyễn Văn A"
              className="pl-9"
              disabled={isSubmitting || isGoogleLoading}
              error={Boolean(errors.fullName)}
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-destructive font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              placeholder="ban@example.com"
              className="pl-9"
              disabled={isSubmitting || isGoogleLoading}
              error={Boolean(errors.email)}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="register-phone">
            Số điện thoại <span className="text-muted-foreground font-normal">(không bắt buộc)</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-phone"
              type="tel"
              placeholder="0901234567"
              className="pl-9"
              disabled={isSubmitting || isGoogleLoading}
              error={Boolean(errors.phone)}
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive font-medium">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="register-password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 8 ký tự"
              className="pl-9 pr-10"
              disabled={isSubmitting || isGoogleLoading}
              error={Boolean(errors.password)}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              disabled={isSubmitting || isGoogleLoading}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="register-confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="register-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              className="pl-9 pr-10"
              disabled={isSubmitting || isGoogleLoading}
              error={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              disabled={isSubmitting || isGoogleLoading}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={isSubmitting || isGoogleLoading}
        >
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        disabled={isSubmitting || isGoogleLoading}
        isLoading={isGoogleLoading}
        text="signup_with"
      />

      {/* Footer link to login */}
      <div className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link
          to={ROUTE_PATHS.LOGIN}
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
