import OrderDataGrid from '@/components/orders/OrderDataGrid/OrderDataGrid';
import { useOrderStore } from '@/stores/orderStore';
import { useEffect } from 'react';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types/order';
import './App.css';

function App() {
  const { setOrders, setLoading, setError } = useOrderStore();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from API
        // For now, we'll use the mock data directly
        const mockOrders = Array.from({ length: 15 }, () =>
          orderService.generateMockOrder()
        );
        setOrders(mockOrders);
      } catch (error) {
        setError('Failed to load orders');
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [setOrders, setLoading, setError]);

  const handleOrderSelect = (order: Order) => {
    console.log('Selected order:', order);
    // In a real app, you would open a modal or navigate to details
    alert(`Order ${order.id} selected`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              BASE Exchange - Gerenciamento de Ordens
            </h1>
            <p className="text-gray-600 mt-2">
              Visualize e gerencie ordens de compra e venda de ativos
              financeiros
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Nova Ordem
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Relatórios
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          <span>Sistema operacional - Conectado à API</span>
        </div>
      </header>

      <main>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Ordens de Negociação
            </h2>
            <p className="text-gray-600">
              Visualize todas as ordens, filtre por instrumento, status ou lado,
              e gerencie suas operações.
            </p>
          </div>

          <OrderDataGrid onOrderSelect={handleOrderSelect} showFilters={true} />

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1">
                  Status do Sistema
                </h3>
                <p className="text-blue-600 text-sm">
                  Todas as funcionalidades estão operacionais
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-1">
                  Total de Ordens
                </h3>
                <p className="text-green-600 text-sm">
                  15 ordens carregadas • 5 abertas • 3 executadas
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-1">
                  Última Atualização
                </h3>
                <p className="text-purple-600 text-sm">
                  {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>
          BASE Exchange Trading System • Desenvolvido com React, TypeScript e
          TailwindCSS
        </p>
        <p className="mt-1">
          This is a challenge by{' '}
          <a
            href="https://coodesh.com/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Coodesh
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
