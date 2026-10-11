import { Link } from 'react-router';
import { Coffee, Sparkles } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { ROUTE_PATHS } from '@/shared/constants/routes';

export function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            to={ROUTE_PATHS.HOME}
            className="inline-flex items-center gap-2 text-primary font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Coffee className="w-6 h-6" />
            </div>
            <span>Beverage Hub</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thưởng thức hương vị trọn vẹn</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-md">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Đăng nhập</CardTitle>
            <CardDescription className="text-xs">
              Nhập email và mật khẩu của bạn để tiếp tục đặt hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
