import { create } from 'zustand';
import type { Order, OrderFilter, PaginationParams } from '@/types/order';

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

export const useOrderStore = create<OrderStore>(set => ({
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
  setOrders: orders =>
    set({ orders, filteredOrders: orders, totalItems: orders.length }),
  setFilteredOrders: filteredOrders =>
    set({ filteredOrders, totalItems: filteredOrders.length }),
  setSelectedOrder: selectedOrder => set({ selectedOrder }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  updateFilter: filterUpdates =>
    set(state => ({
      filters: { ...state.filters, ...filterUpdates },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page when filter changes
    })),

  resetFilters: () =>
    set({
      filters: defaultFilters,
      pagination: { ...defaultPagination, page: 1 },
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
    set(state => ({
      orders: [order, ...state.orders],
      filteredOrders: [order, ...state.filteredOrders],
      totalItems: state.totalItems + 1,
    })),

  updateOrder: (id, updates) =>
    set(state => {
      const updateOrderInArray = (orders: Order[]) =>
        orders.map(order =>
          order.id === id
            ? { ...order, ...updates, updatedAt: new Date().toISOString() }
            : order
        );

      return {
        orders: updateOrderInArray(state.orders),
        filteredOrders: updateOrderInArray(state.filteredOrders),
        selectedOrder:
          state.selectedOrder?.id === id
            ? {
                ...state.selectedOrder,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : state.selectedOrder,
      };
    }),

  deleteOrder: id =>
    set(state => {
      const filterOrderFromArray = (orders: Order[]) =>
        orders.filter(order => order.id !== id);

      return {
        orders: filterOrderFromArray(state.orders),
        filteredOrders: filterOrderFromArray(state.filteredOrders),
        selectedOrder:
          state.selectedOrder?.id === id ? null : state.selectedOrder,
        totalItems: state.totalItems - 1,
      };
    }),
}));
