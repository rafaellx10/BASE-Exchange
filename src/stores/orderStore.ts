import { create } from 'zustand';
import type {
  Order,
  OrderFilter,
  PaginationParams,
  OrderStatus,
} from '@/types/order';
import { matchOrder } from '@/utils/orderMatching';

interface OrderStore {
  // State
  orders: Order[];
  filteredOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Filters and pagination
  filters: OrderFilter;
  pagination: PaginationParams;
  totalItems: number;

  // Actions
  setOrders: (orders: Order[]) => void;
  setFilteredOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter actions
  updateFilter: (filter: Partial<OrderFilter>) => void;
  resetFilters: () => void;

  // Pagination actions
  updatePagination: (pagination: Partial<PaginationParams>) => void;
  goToPage: (page: number) => void;

  // Order actions
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
}

const defaultFilters: OrderFilter = {
  id: '',
  instrument: '',
  status: undefined,
  side: undefined,
  startDate: '',
  endDate: '',
};

const defaultPagination: PaginationParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// Helper function to apply filters to orders
const applyFilters = (orders: Order[], filters: OrderFilter): Order[] => {
  console.log('Applying filters:', filters);
  return orders.filter(order => {
    // Filter by ID (partial match, case-insensitive)
    if (
      filters.id &&
      !order.id.toLowerCase().includes(filters.id.toLowerCase())
    ) {
      return false;
    }

    // Filter by instrument (partial match, case-insensitive)
    if (
      filters.instrument &&
      !order.instrument.toLowerCase().includes(filters.instrument.toLowerCase())
    ) {
      return false;
    }

    // Filter by status (exact match)
    if (filters.status && order.status !== filters.status) {
      return false;
    }

    // Filter by side (exact match)
    if (filters.side && order.side !== filters.side) {
      return false;
    }

    // Filter by date range (if dates are provided)
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const orderDate = new Date(order.createdAt);
      if (orderDate < startDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      const orderDate = new Date(order.createdAt);
      if (orderDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

export const useOrderStore = create<OrderStore>()(set => ({
  // Initial state
  orders: [],
  filteredOrders: [],
  selectedOrder: null,
  isLoading: true, // Começa como true para mostrar loading na primeira renderização
  error: null,
  filters: defaultFilters,
  pagination: defaultPagination,
  totalItems: 0,

  // Actions
  setOrders: (orders: Order[]) =>
    set(state => {
      // Garante que status esteja sempre alinhado com OrderStatus
      const normalizedOrders: Order[] = orders.map(order => ({
        ...order,
        status: order.status as OrderStatus,
      }));

      const filteredOrders = applyFilters(normalizedOrders, state.filters);

      return {
        orders: normalizedOrders,
        filteredOrders,
        totalItems: filteredOrders.length,
      };
    }),
  setFilteredOrders: filteredOrders =>
    set({ filteredOrders, totalItems: filteredOrders.length }),
  setSelectedOrder: selectedOrder => set({ selectedOrder }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  updateFilter: filterUpdates =>
    set(state => {
      const newFilters = { ...state.filters, ...filterUpdates };
      const filteredOrders = applyFilters(state.orders, newFilters);
      return {
        filters: newFilters,
        filteredOrders,
        pagination: { ...state.pagination, page: 1 }, // Reset to first page when filter changes
        totalItems: filteredOrders.length,
      };
    }),

  resetFilters: () =>
    set(state => {
      const filteredOrders = applyFilters(state.orders, defaultFilters);
      return {
        filters: defaultFilters,
        filteredOrders,
        pagination: { ...defaultPagination, page: 1 },
        totalItems: filteredOrders.length,
      };
    }),

  updatePagination: paginationUpdates =>
    set(state => ({
      pagination: { ...state.pagination, ...paginationUpdates },
    })),

  goToPage: page =>
    set(state => ({
      pagination: { ...state.pagination, page },
    })),

  addOrder: order =>
    set(state => {
      const { updatedOrders } = matchOrder(order, state.orders);
      const filteredOrders = applyFilters(updatedOrders, state.filters);
      return {
        orders: updatedOrders,
        filteredOrders,
        totalItems: filteredOrders.length,
      };
    }),

  updateOrder: (id, updates) =>
    set(state => {
      const updateOrderInArray = (orders: Order[]): Order[] =>
        orders.map<Order>(order =>
          order.id === id
            ? { ...order, ...updates, updatedAt: new Date().toISOString() }
            : order
        );

      const newOrders: Order[] = updateOrderInArray(state.orders);
      const filteredOrders = applyFilters(newOrders, state.filters);

      return {
        orders: newOrders,
        filteredOrders,
        selectedOrder:
          state.selectedOrder?.id === id
            ? {
                ...state.selectedOrder,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : state.selectedOrder,
        totalItems: filteredOrders.length,
      };
    }),

  deleteOrder: id =>
    set(state => {
      const filterOrderFromArray = (orders: Order[]): Order[] =>
        orders.filter(order => order.id !== id);

      const newOrders: Order[] = filterOrderFromArray(state.orders);
      const filteredOrders = applyFilters(newOrders, state.filters);

      return {
        orders: newOrders,
        filteredOrders,
        selectedOrder:
          state.selectedOrder?.id === id ? null : state.selectedOrder,
        totalItems: filteredOrders.length,
      };
    }),

  cancelOrder: id =>
    set(state => {
      const target = state.orders.find(order => order.id === id);

      if (!target) {
        return state;
      }

      if (target.status !== 'OPEN' && target.status !== 'PARTIAL') {
        // Apenas ordens Abertas ou Parciais podem ser canceladas
        return state;
      }

      const now = new Date().toISOString();

      const cancelInArray = (orders: Order[]): Order[] =>
        orders.map<Order>(order =>
          order.id === id
            ? { ...order, status: 'CANCELLED', updatedAt: now }
            : order
        );

      const newOrders: Order[] = cancelInArray(state.orders);
      const filteredOrders = applyFilters(newOrders, state.filters);

      return {
        orders: newOrders,
        filteredOrders,
        selectedOrder:
          state.selectedOrder?.id === id
            ? { ...state.selectedOrder, status: 'CANCELLED', updatedAt: now }
            : state.selectedOrder,
        totalItems: filteredOrders.length,
      };
    }),
}));
