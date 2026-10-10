export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}
