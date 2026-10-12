import * as React from 'react';
import { CheckCircle2, AlertTriangle, Unlink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/feedback';
import { useUnlinkGoogle } from '../hooks/useProfile';
import type { User } from '../types/profile.types';

interface GoogleIdentityCardProps {
  user: User;
}

export const GoogleIdentityCard = ({ user }: GoogleIdentityCardProps) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const unlinkMutation = useUnlinkGoogle();

  const isGoogleLinked = user.linkedProviders?.includes('google');
  const canUnlink = isGoogleLinked && user.hasPassword === true;

  const handleConfirmUnlink = async () => {
    try {
      await unlinkMutation.mutateAsync();
      setConfirmOpen(false);
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <>
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-xl">Liên kết mạng xã hội</CardTitle>
          <CardDescription>
            Quản lý tài khoản đăng nhập bên ngoài được kết nối với tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
            <div className="flex items-center gap-3">
              {/* Google Brand SVG */}
              <div className="w-10 h-10 rounded-lg bg-background border flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Tài khoản Google</span>
                  {isGoogleLinked ? (
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Đã liên kết
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Chưa liên kết
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isGoogleLinked
                    ? 'Bạn có thể đăng nhập nhanh chóng bằng tài khoản Google'
                    : 'Chưa có thông tin định danh Google được kết nối'}
                </p>
              </div>
            </div>

            {isGoogleLinked && (
              <div>
                {canUnlink ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Hủy liên kết</span>
                  </Button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Không thể hủy liên kết (đây là phương thức đăng nhập duy nhất).</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy liên kết Google?</DialogTitle>
            <DialogDescription>
              Sau khi hủy liên kết, bạn sẽ không thể sử dụng phương thức đăng nhập bằng Google cho đến khi liên kết lại. Bạn vẫn có thể đăng nhập bằng mật khẩu tài khoản.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={unlinkMutation.isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmUnlink}
              disabled={unlinkMutation.isPending}
              className="gap-2"
            >
              {unlinkMutation.isPending ? (
                <>
                  <Spinner size={16} />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Xác nhận hủy liên kết</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
