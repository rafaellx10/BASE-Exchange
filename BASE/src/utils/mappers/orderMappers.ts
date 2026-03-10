import type { Order } from '@/types/order';
import { ordersSchema } from '@/types/order';

// Converte/valida o input vindo de JSON/API para o tipo forte Order (runtime-safe)
export const convertToTypedOrders = (input: unknown): Order[] => {
  return ordersSchema.parse(input);
};
