export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface OrderStatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  description: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    label: 'Chờ xác nhận',
    variant: 'secondary',
    description: 'Đơn hàng đang chờ nhân viên xác nhận',
  },
  confirmed: {
    label: 'Đã xác nhận',
    variant: 'outline',
    description: 'Đơn hàng đã được xác nhận',
  },
  preparing: {
    label: 'Đang chuẩn bị',
    variant: 'warning',
    description: 'Cửa hàng đang chuẩn bị món',
  },
  ready: {
    label: 'Sẵn sàng',
    variant: 'default',
    description: 'Món đã sẵn sàng để lấy hoặc giao',
  },
  delivering: {
    label: 'Đang giao',
    variant: 'default',
    description: 'Tài xế đang giao đơn hàng đến bạn',
  },
  completed: {
    label: 'Hoàn thành',
    variant: 'success',
    description: 'Đơn hàng đã hoàn thành',
  },
  cancelled: {
    label: 'Đã hủy',
    variant: 'destructive',
    description: 'Đơn hàng đã bị hủy',
  },
};
