export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'PARTIAL' | 'EXECUTED' | 'CANCELLED';

export interface Order {
  id: string;
  instrument: string;
  side: OrderSide;
  price: number;
  quantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface OrderCreateRequest {
  instrument: string;
  side: OrderSide;
  price: number;
  quantity: number;
}

export interface OrderUpdateRequest {
  status?: OrderStatus;
  remainingQuantity?: number;
}

export interface OrderExecutionResult {
  orderId: string;
  matchedOrderId: string;
  executedQuantity: number;
  remainingQuantity: number;
  newStatus: OrderStatus;
  timestamp: string;
}

export interface OrderFilter {
  id?: string;
  instrument?: string;
  status?: OrderStatus;
  side?: OrderSide;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: keyof Order;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
