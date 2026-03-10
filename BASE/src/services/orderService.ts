import api from './api';
import type {
  Order,
  OrderCreateRequest,
  OrderUpdateRequest,
  OrderFilter,
  PaginationParams,
  PaginatedResponse,
} from '@/types/order';

class OrderService {
  private basePath = '/orders';

  async getAllOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>(this.basePath);
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get<Order>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createOrder(orderData: OrderCreateRequest): Promise<Order> {
    const response = await api.post<Order>(this.basePath, orderData);
    return response.data;
  }

  async updateOrder(id: string, updates: OrderUpdateRequest): Promise<Order> {
    const response = await api.patch<Order>(`${this.basePath}/${id}`, updates);
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrder(id, { status: 'CANCELLED' });
  }

  async getOrdersWithFilters(
    filters: OrderFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Order>> {
    const params = {
      ...filters,
      _page: pagination.page,
      _limit: pagination.limit,
      _sort: pagination.sortBy,
      _order: pagination.sortOrder,
    };

    // Remove undefined or empty values
    Object.keys(params).forEach(key => {
      if (
        params[key as keyof typeof params] === undefined ||
        params[key as keyof typeof params] === ''
      ) {
        delete params[key as keyof typeof params];
      }
    });

    const response = await api.get<Order[]>(this.basePath, { params });

    // JSON Server doesn't return total count by default
    // We need to get total count separately or use a workaround
    // For now, we'll assume response.data contains all filtered items
    const totalResponse = await api.get<Order[]>(this.basePath, {
      params: { ...filters, _limit: 1000 }, // Get all to count
    });

    const total = totalResponse.data.length;

    return {
      data: response.data,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  // Mock data generation for development
  generateMockOrder(overrides?: Partial<Order>): Order {
    const instruments = [
      'PETR4',
      'VALE3',
      'ITUB4',
      'BBDC4',
      'ABEV3',
      'USD/BRL',
      'EUR/BRL',
      'BTC/USD',
    ];
    const sides = ['BUY', 'SELL'] as const;
    const statuses = ['OPEN', 'PARTIAL', 'EXECUTED', 'CANCELLED'] as const;

    const instrument =
      instruments[Math.floor(Math.random() * instruments.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const price = parseFloat((Math.random() * 100 + 10).toFixed(2));
    const quantity = Math.floor(Math.random() * 1000) + 100;
    const remainingQuantity =
      status === 'EXECUTED'
        ? 0
        : status === 'PARTIAL'
          ? Math.floor(quantity * Math.random())
          : quantity;

    const now = new Date();
    const createdAt = new Date(
      now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const updatedAt =
      status !== 'OPEN'
        ? new Date(
            new Date(createdAt).getTime() + Math.random() * 60 * 60 * 1000
          ).toISOString()
        : createdAt;

    const baseOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      instrument,
      side,
      price,
      quantity,
      remainingQuantity,
      status,
      createdAt,
      updatedAt,
      userId: `USER-${Math.floor(Math.random() * 10) + 1}`,
    };

    return { ...baseOrder, ...overrides };
  }

  // Simulate order execution logic
  simulateOrderExecution(): Partial<Order> {
    // This is a simplified simulation of order execution
    return {
      status: 'EXECUTED',
      remainingQuantity: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const orderService = new OrderService();
export default orderService;
