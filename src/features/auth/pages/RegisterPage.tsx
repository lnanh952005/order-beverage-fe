import { Link } from 'react-router';
import { Coffee, Award, Gift, Zap } from 'lucide-react';
import { RegisterForm } from '../components/RegisterForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { ROUTE_PATHS } from '@/shared/constants/routes';

export function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="w-full max-w-lg space-y-6">
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
          <p className="text-xs text-muted-foreground">
            Tham gia cộng đồng yêu thích trà sữa & cà phê thủ công
          </p>
        </div>

        {/* Member perks banner */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-card border text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <Gift className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Voucher 10%</span>
            <span className="text-[10px] text-muted-foreground">Đơn đầu tiên</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-border/60">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-foreground">Tích điểm đổi quà</span>
            <span className="text-[10px] text-muted-foreground">Mỗi đơn hàng</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-foreground">Theo dõi đơn</span>
            <span className="text-[10px] text-muted-foreground">Thời gian thực</span>
          </div>
        </div>

        {/* Register Card */}
        <Card className="border-border/60 shadow-md">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</CardTitle>
            <CardDescription className="text-xs">
              Điền các thông tin bên dưới để bắt đầu đặt món yêu thích
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
