import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { env } from '@/core/config/env';
import { toast } from 'sonner';

interface GoogleLoginButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (error?: unknown) => void;
  disabled?: boolean;
  isLoading?: boolean;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  disabled,
  isLoading,
  text = 'continue_with',
}: GoogleLoginButtonProps) {
  const isGoogleConfigured = Boolean(env.VITE_GOOGLE_CLIENT_ID);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      onSuccess(credentialResponse.credential);
    } else {
      toast.error('Không nhận được mã xác thực từ Google.');
      onError?.(new Error('Missing credential'));
    }
  };

  const handleError = () => {
    toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    onError?.();
  };

  if (!isGoogleConfigured) {
    return (
      <div className="w-full flex justify-center py-2.5 px-4 rounded-md border border-input bg-muted/40 text-muted-foreground text-xs text-center">
        Đăng nhập Google tạm thời chưa cấu hình
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border border-input bg-muted/50 text-muted-foreground text-sm font-medium animate-pulse"
      >
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Đang xác thực với Google...</span>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="w-full flex items-center justify-center py-2.5 px-4 rounded-md border border-input bg-muted/30 text-muted-foreground text-sm opacity-60 cursor-not-allowed">
        <span>Google Login</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:!w-full [&>div>iframe]:!mx-auto">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        shape="rectangular"
        width="100%"
        text={text}
      />
    </div>
  );
}

