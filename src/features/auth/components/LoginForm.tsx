import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';

import { loginSchema, type LoginFormValues } from '../schemas/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { GoogleLoginButton } from './GoogleLoginButton';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { ROUTE_PATHS } from '@/shared/constants/routes';

export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || ROUTE_PATHS.HOME;

  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      toast.success('Đăng nhập thành công!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'USE_GOOGLE_SIGN_IN') {
          setServerError(
            'Tài khoản này được đăng ký bằng Google. Vui lòng bấm vào nút "Đăng nhập với Google" bên dưới để tiếp tục.',
          );
          return;
        }
        if (err.details && err.details.length > 0) {
          err.details.forEach((d) => {
            if (d.field === 'email' || d.field === 'password') {
              setError(d.field, { message: d.message });
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
      navigate(redirectPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(getErrorMessage(err.code, err.message));
      } else {
        setServerError('Đăng nhập bằng Google không thành công. Vui lòng thử lại.');
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
        {/* Email field */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
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

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Mật khẩu</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={isSubmitting || isGoogleLoading}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
        text="signin_with"
      />

      {/* Footer link to register */}
      <div className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link
          to={ROUTE_PATHS.REGISTER}
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
