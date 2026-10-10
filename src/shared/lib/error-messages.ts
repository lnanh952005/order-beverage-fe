/**
 * Central map of backend error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Common errors
  INTERNAL_SERVER_ERROR: 'Đã có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau.',
  UNAUTHENTICATED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',

  // Auth
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  EMAIL_ALREADY_EXISTS: 'Email này đã được sử dụng.',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  USE_GOOGLE_SIGN_IN: 'Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập với Google.',

  // Cart & Catalog
  CART_EMPTY: 'Giỏ hàng của bạn đang trống.',
  PRODUCT_UNAVAILABLE: 'Một số sản phẩm không còn khả dụng. Vui lòng kiểm tra lại giỏ hàng.',
  INSUFFICIENT_STOCK: 'Số lượng sản phẩm trong kho không đủ.',

  // Promotions
  VOUCHER_NOT_FOUND: 'Mã giảm giá không tồn tại.',
  VOUCHER_EXPIRED: 'Mã giảm giá đã hết hạn sử dụng.',
  VOUCHER_USAGE_LIMIT_EXCEEDED: 'Mã giảm giá đã hết lượt sử dụng.',
  VOUCHER_MIN_ORDER_NOT_MET: 'Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá này.',

  // Orders
  ORDER_NOT_FOUND: 'Không tìm thấy thông tin đơn hàng.',
  ORDER_NOT_CANCELLABLE: 'Không thể hủy đơn hàng ở giai đoạn này.',
};

export function getErrorMessage(code: string, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  return ERROR_MESSAGES[code] || fallback;
}
