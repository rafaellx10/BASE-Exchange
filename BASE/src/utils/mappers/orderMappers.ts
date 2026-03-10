import type { Order, OrderSide, OrderStatus } from '@/types/order';
import type { RawOrder } from '@/models/orderModel';

// Converte o modelo original (RawOrder) vindo de JSON/API para o tipo forte Order
export const convertToTypedOrders = (rawOrders: RawOrder[]): Order[] => {
  return rawOrders.map(order => ({
    id: order.id,
    instrument: order.instrument,
    side: order.side as OrderSide,
    price: order.price,
    quantity: order.quantity,
    remainingQuantity: order.remainingQuantity,
    status: order.status as OrderStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    userId: order.userId,
  }));
};
