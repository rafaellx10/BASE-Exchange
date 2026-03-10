import { useMemo } from 'react';
import { useOrderStore } from '@/stores/orderStore';

const OrderStats = () => {
  const { orders } = useOrderStore();

  const stats = useMemo(() => {
    const total = orders.length;
    const open = orders.filter(order => order.status === 'OPEN').length;
    const executed = orders.filter(order => order.status === 'EXECUTED').length;
    const partial = orders.filter(order => order.status === 'PARTIAL').length;
    const cancelled = orders.filter(
      order => order.status === 'CANCELLED'
    ).length;
    const buyOrders = orders.filter(order => order.side === 'BUY').length;
    const sellOrders = orders.filter(order => order.side === 'SELL').length;

    return {
      total,
      open,
      executed,
      partial,
      cancelled,
      buyOrders,
      sellOrders,
    };
  }, [orders]);

  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="font-medium text-green-800 mb-1">Total de Ordens</h3>
      <p className="text-green-600 text-sm">
        {stats.total} ordens carregadas • {stats.open} abertas •{' '}
        {stats.executed} executadas
      </p>
      <div className="mt-2 text-xs text-green-600">
        <span className="inline-block mr-2">{stats.partial} parciais •</span>
        <span className="inline-block mr-2">
          {stats.cancelled} canceladas •
        </span>
        <span className="inline-block">
          {stats.buyOrders} compras • {stats.sellOrders} vendas
        </span>
      </div>
    </div>
  );
};

export default OrderStats;
