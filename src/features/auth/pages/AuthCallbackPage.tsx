import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { tokenStorage } from '@/shared/api/token-storage';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { useAuthStore } from '../stores/auth.store';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasHandled = React.useRef(false);

  React.useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    const error = searchParams.get('error');

    if (error || !accessToken || !refreshToken) {
      toast.error('Đăng nhập với Google không thành công. Vui lòng thử lại.');
      navigate(ROUTE_PATHS.LOGIN, { replace: true });
      return;
    }

    tokenStorage.setAccessToken(accessToken);
    tokenStorage.setRefreshToken(refreshToken);

    void useAuthStore
      .getState()
      .initAuth()
      .then(() => {
        if (isNewUser) {
          toast.success('Chào mừng bạn gia nhập Beverage Hub!');
        } else {
          toast.success('Đăng nhập Google thành công!', {
            duration: 1500
          });
        }
        navigate(ROUTE_PATHS.HOME, { replace: true });
      })
      .catch(() => {
        toast.error('Không thể đồng bộ thông tin tài khoản. Vui lòng thử lại.');
        navigate(ROUTE_PATHS.LOGIN, { replace: true });
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm font-medium animate-pulse">
        Đang hoàn tất đăng nhập Google...
      </p>
    </div>
  );
}
