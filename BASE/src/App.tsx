import { useEffect, useState } from 'react';
import OrderDataGrid from '@/components/Orders/OrderDataGrid/OrderDataGrid';
import { useOrderStore } from '@/stores/orderStore';
import type { Order } from '@/types/order';
import BaseLoading from '@/components/BaseLoading/BaseLoading';
import BaseModal from '@/components/BaseModal/BaseModal';
import CreateOrderForm from '@/components/Orders/CreateOrderForm';
import './App.css';

// Import mock data directly
import mockOrdersData from '@/mock/db.json';
import type { RawOrder } from '@/models/orderModel';
import { convertToTypedOrders } from '@/utils/mappers/orderMappers';

function App() {
  const { setOrders, setLoading, setError, isLoading } = useOrderStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const cancelOrder = useOrderStore(state => state.cancelOrder);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000); // 1 segundos de loading forçado

    const loadOrders = async () => {
      try {
        setLoading(true);
        // Usa os dados fixos do db.json e converte explicitamente para Order
        const typedOrders = convertToTypedOrders(
          mockOrdersData.orders as RawOrder[]
        );
        console.log('Loading orders from db.json:', typedOrders.length);
        setOrders(typedOrders);
      } catch (error) {
        setError('Failed to load orders');
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    return () => clearTimeout(timer);
  }, [setOrders, setLoading, setError]);

  const handleOrderSelect = (order: Order) => {
    console.log('Selected order:', order);
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCancelSelectedOrder = () => {
    if (!selectedOrder) return;

    if (selectedOrder.status !== 'OPEN' && selectedOrder.status !== 'PARTIAL') {
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar esta ordem?'
    );

    if (!confirmed) return;

    cancelOrder(selectedOrder.id);
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  // Show loading during initial 3 seconds or when store is loading
  const showLoading = isInitialLoading || isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {showLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
          <BaseLoading marginTopContainer="0" size="lg" />
          <div className="mt-6 text-center">
            <p className="text-gray-700 font-medium mb-2">
              Carregando sistema de ordens...
            </p>
            <p className="text-gray-500 text-sm">
              A preparação da plataforma pode levar alguns instantes
            </p>
          </div>
        </div>
      )}

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
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsCreateOrderModalOpen(true)}
            >
              Nova Ordem
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Relatórios
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${showLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
          ></span>
          <span>
            {showLoading
              ? 'Conectando à API...'
              : 'Sistema operacional - Conectado à API'}
          </span>
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
                  {showLoading
                    ? 'Inicializando...'
                    : 'Todas as funcionalidades estão operacionais'}
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

      {/* Modal de criação de ordem */}
      <BaseModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Nova Ordem</h2>
          <p className="text-sm text-gray-600">
            Preencha os dados abaixo para criar uma nova ordem. Toda nova ordem
            será criada com status <strong>Aberta</strong>.
          </p>
          <CreateOrderForm onSuccess={() => setIsCreateOrderModalOpen(false)} />
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes da Ordem
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID:</span>
                <p className="text-gray-900 break-all">{selectedOrder.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Instrumento:</span>
                <p className="text-gray-900">{selectedOrder.instrument}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Lado:</span>
                <p className="text-gray-900">
                  {selectedOrder.side === 'BUY' ? 'Compra' : 'Venda'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <p className="text-gray-900">{selectedOrder.status}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Preço:</span>
                <p className="text-gray-900">
                  {selectedOrder.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Quantidade:</span>
                <p className="text-gray-900">
                  {selectedOrder.quantity.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Quantidade Restante:
                </span>
                <p className="text-gray-900">
                  {selectedOrder.remainingQuantity.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Criada em:</span>
                <p className="text-gray-900">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                <div>
                  <span className="font-medium text-gray-700">
                    Atualizada em:
                  </span>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-gray-500">
                {(selectedOrder.status === 'OPEN' ||
                  selectedOrder.status === 'PARTIAL') &&
                  'Apenas ordens Abertas ou Parciais podem ser canceladas.'}
                {(selectedOrder.status === 'EXECUTED' ||
                  selectedOrder.status === 'CANCELLED') &&
                  'Esta ordem não pode mais ser cancelada.'}
              </div>
              <div className="flex space-x-2">
                {(selectedOrder.status === 'OPEN' ||
                  selectedOrder.status === 'PARTIAL') && (
                  <button
                    type="button"
                    onClick={handleCancelSelectedOrder}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </BaseModal>

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
