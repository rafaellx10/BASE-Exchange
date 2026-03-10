export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'PARTIAL' | 'EXECUTED' | 'CANCELLED';

import { z } from 'zod';

// Modelo de domínio forte usado dentro da aplicação
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

/**
 * Runtime validation/parsing
 *
 * Objetivo: evitar `as Order` espalhado pelo código quando os dados vêm
 * de JSON/API. Em vez disso, fazemos parse/validação e retornamos um `Order`
 * confiável para o domínio.
 */
export const orderSchema = z.object({
  id: z.string(),
  instrument: z.string(),
  side: z.enum(['BUY', 'SELL']),
  price: z.number(),
  quantity: z.number(),
  remainingQuantity: z.number(),
  status: z.enum(['OPEN', 'PARTIAL', 'EXECUTED', 'CANCELLED']),
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.string().optional(),
});

export const ordersSchema = z.array(orderSchema);

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
