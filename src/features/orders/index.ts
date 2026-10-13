// Routes
export { ordersRoutes, ordersAdminRoutes } from './routes';

// Hooks
export {
  useOrders,
  useOrder,
  useCheckout,
  useCancelOrder,
  useAdminOrders,
  useUpdateOrderStatus,
} from './hooks';

// Components
export {
  OrderStatusBadge,
  OrderCard,
  OrderTimeline,
  CancelOrderDialog,
  AdminOrderStatusActions,
  CheckoutAddressSection,
  CheckoutPaymentSection,
  CheckoutVoucherSection,
  CheckoutSummary,
} from './components';

// Services & Keys
export { ordersService } from './services/orders.service';
export { ordersKeys } from './services/orders.keys';

// Stores (Zustand)
export { useCheckoutStore } from './stores/checkout.store';

// Schemas
export {
  checkoutSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  type CheckoutFormValues,
  type CancelOrderFormValues,
  type UpdateOrderStatusFormValues,
} from './schemas/orders.schemas';

// Types
export type {
  OrderStatus,
  FulfillmentType,
  PaymentMethod,
  PaymentStatus,
  OrderItemOptionDetail,
  OrderItemDetail,
  OrderStatusHistoryItem,
  OrderPaymentRecord,
  OrderDetail,
  OrderSummary,
  AdminOrderSummary,
  CreateOrderPayload,
  CancelOrderPayload,
  UpdateOrderStatusPayload,
  OrderFilters,
  AdminOrderFilters,
  PaginatedResult,
  // Backward compatibility
  Order,
  OrderItem,
  OrderItemOption,
  OrderStatusHistory,
  CheckoutInput,
} from './types/orders.types';
