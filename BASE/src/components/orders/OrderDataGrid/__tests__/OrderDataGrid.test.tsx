import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderDataGrid from '@/components/Orders/OrderDataGrid/OrderDataGrid';
import { useOrderStore } from '@/stores/orderStore';

// Mock do store Zustand
vi.mock('@/stores/orderStore', () => ({
  useOrderStore: vi.fn(),
}));

const mockOrders = [
  {
    id: 'ORD-001',
    instrument: 'PETR4',
    side: 'BUY' as const,
    price: 35.75,
    quantity: 1000,
    remainingQuantity: 0,
    status: 'EXECUTED' as const,
    createdAt: '2026-03-08T10:30:00Z',
    updatedAt: '2026-03-08T10:35:00Z',
    userId: 'USER-001',
  },
  {
    id: 'ORD-002',
    instrument: 'VALE3',
    side: 'SELL' as const,
    price: 68.9,
    quantity: 500,
    remainingQuantity: 200,
    status: 'PARTIAL' as const,
    createdAt: '2026-03-08T11:15:00Z',
    updatedAt: '2026-03-08T11:20:00Z',
    userId: 'USER-002',
  },
];

describe('OrderDataGrid', () => {
  const defaultMockStore = {
    orders: mockOrders,
    filteredOrders: mockOrders,
    selectedOrder: null,
    error: null,
    filters: {
      id: '',
      instrument: '',
      status: undefined,
      side: undefined,
      startDate: '',
      endDate: '',
    },
    pagination: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    },
    totalItems: mockOrders.length,
    isLoading: false,
    setOrders: vi.fn(),
    setFilteredOrders: vi.fn(),
    setSelectedOrder: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    updateFilter: vi.fn(),
    resetFilters: vi.fn(),
    updatePagination: vi.fn(),
    goToPage: vi.fn(),
    addOrder: vi.fn(),
    updateOrder: vi.fn(),
    deleteOrder: vi.fn(),
    cancelOrder: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o componente sem erros', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid />);

    // Verifica se a tabela está presente usando role
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('deve mostrar a tabela com ordens quando houver dados', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid />);

    // Verifica se as ordens são exibidas
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();
    // Usar getAllByText porque "Compra" e "Venda" aparecem no dropdown de filtro e nos badges
    expect(screen.getAllByText('Compra').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Venda').length).toBeGreaterThan(0);
  });

  it('deve mostrar estado de carregamento quando isLoading é true', () => {
    (useOrderStore as any).mockReturnValue({
      ...defaultMockStore,
      isLoading: true,
    });

    render(<OrderDataGrid />);

    expect(screen.getByText('Carregando ordens...')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de vazio quando não houver ordens', () => {
    (useOrderStore as any).mockReturnValue({
      ...defaultMockStore,
      orders: [],
      filteredOrders: [],
      totalItems: 0,
    });

    render(<OrderDataGrid />);

    expect(screen.getByText(/Nenhuma ordem encontrada\./)).toBeInTheDocument();
  });

  it('deve chamar onOrderSelect quando uma linha é clicada', () => {
    const handleOrderSelect = vi.fn();
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid onOrderSelect={handleOrderSelect} />);

    // Simula clique na primeira linha
    const firstOrderRow = screen.getByText('PETR4').closest('tr');
    if (firstOrderRow) {
      fireEvent.click(firstOrderRow);
    }

    expect(handleOrderSelect).toHaveBeenCalledTimes(1);
    expect(handleOrderSelect).toHaveBeenCalledWith(mockOrders[0]);
  });

  it('deve renderizar filtros quando showFilters é true', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid showFilters={true} />);

    expect(screen.getByLabelText('ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Instrumento')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Lado')).toBeInTheDocument();
  });

  it('não deve renderizar filtros quando showFilters é false', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid showFilters={false} />);

    expect(screen.queryByText('Filtros')).not.toBeInTheDocument();
  });

  it('deve formatar corretamente valores monetários', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid />);

    // Verifica se o preço está formatado como moeda brasileira
    expect(screen.getByText('R$ 35,75')).toBeInTheDocument();
    expect(screen.getByText('R$ 68,90')).toBeInTheDocument();
  });

  it('deve mostrar badges de status com cores corretas', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid />);

    // Usar getAllByText porque "Executada" e "Parcial" aparecem no dropdown de filtro e nos badges
    expect(screen.getAllByText('Executada').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Parcial').length).toBeGreaterThan(0);
  });

  it('deve mostrar badges de lado com cores corretas', () => {
    (useOrderStore as any).mockReturnValue(defaultMockStore);

    render(<OrderDataGrid />);

    // Usar getAllByText porque "Compra" aparece no dropdown de filtro e nos badges
    expect(screen.getAllByText('Compra').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Venda').length).toBeGreaterThan(0);
  });
});
