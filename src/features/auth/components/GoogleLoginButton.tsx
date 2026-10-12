import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { env } from '@/core/config/env';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface GoogleLoginButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
  className?: string;
  onSuccess?: (idToken: string) => void;
  onError?: (error?: unknown) => void;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-4 h-4 shrink-0', className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
      />
    </svg>
  );
}

export function GoogleLoginButton({
  disabled,
  isLoading: externalLoading,
  text = 'signin_with',
  className,
}: GoogleLoginButtonProps) {
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const label =
    text === 'signup_with'
      ? 'Đăng ký với Google'
      : text === 'continue_with'
        ? 'Tiếp tục với Google'
        : 'Đăng nhập với Google';

  const handleClick = () => {
    setIsRedirecting(true);
    const backendOAuthUrl = `${env.VITE_API_BASE_URL}/auth/google`;
    window.location.href = backendOAuthUrl;
  };

  const isLoading = externalLoading || isRedirecting;

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'w-full flex items-center justify-center gap-3 py-5 font-medium border-input hover:bg-muted/60 transition-colors',
        className,
      )}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Đang chuyển hướng tới Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
