import type { OrderSide, OrderStatus } from '@/types/order';

// Modelo vindo de JSON/API, antes de ser convertido para o tipo forte Order
export interface RawOrder {
  id: string;
  instrument: string;
  side: string | OrderSide;
  price: number;
  quantity: number;
  remainingQuantity: number;
  status: string | OrderStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}
