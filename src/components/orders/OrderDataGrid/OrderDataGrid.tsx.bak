import { useMemo } from 'react';
import type { Order, OrderSide, OrderStatus } from '@/types/order';
import { useOrderStore } from '@/stores/orderStore';
import BaseLoading from '@/components/BaseLoading/BaseLoading';
import styles from './OrderDataGrid.module.css';

interface OrderDataGridProps {
  onOrderSelect?: (order: Order) => void;
  showFilters?: boolean;
}

const OrderDataGrid = ({
  onOrderSelect,
  showFilters = true,
}: OrderDataGridProps) => {
  const {
    filters,
    pagination,
    isLoading,
    filteredOrders,
    updateFilter,
    resetFilters,
    updatePagination,
    goToPage,
  } = useOrderStore();

  const {
    data: orders,
    total,
    page,
    limit,
    totalPages,
  } = useMemo(() => {
    // Apply sorting
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const aValue = a[pagination.sortBy!];
      const bValue = b[pagination.sortBy!];

      // Handle undefined values
      if (aValue === undefined || bValue === undefined) {
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        return -1;
      }

      // At this point, both values are defined
      const aValueDefined = aValue as Exclude<typeof aValue, undefined>;
      const bValueDefined = bValue as Exclude<typeof bValue, undefined>;

      if (aValueDefined === bValueDefined) return 0;

      const comparison = aValueDefined < bValueDefined ? -1 : 1;
      return pagination.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = sortedOrders.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filteredOrders.length,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(filteredOrders.length / pagination.limit),
    };
  }, [filteredOrders, pagination]);

  const handleSort = (column: keyof Order) => {
    const newSortOrder =
      pagination.sortBy === column && pagination.sortOrder === 'asc'
        ? 'desc'
        : 'asc';

    updatePagination({
      sortBy: column,
      sortOrder: newSortOrder,
    });
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    updateFilter({ [key]: value });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      goToPage(newPage);
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'OPEN':
        return styles.statusOpen;
      case 'PARTIAL':
        return styles.statusPartial;
      case 'EXECUTED':
        return styles.statusExecuted;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const getSideBadgeClass = (side: OrderSide) => {
    return side === 'BUY' ? styles.sideBuy : styles.sideSell;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'instrument', label: 'Instrumento', sortable: true },
    { key: 'side', label: 'Lado', sortable: true },
    { key: 'price', label: 'Preço', sortable: true },
    { key: 'quantity', label: 'Quantidade', sortable: true },
    { key: 'remainingQuantity', label: 'Qtd. Restante', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Data/Hora', sortable: true },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <BaseLoading size="md" marginTopContainer="0" />
        <span className="text-gray-600">Carregando ordens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      {showFilters && (
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}>Filtros</h3>
          <div className={styles.filterGrid}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <input
                type="text"
                value={filters.id || ''}
                onChange={e => handleFilterChange('id', e.target.value)}
                placeholder="Digite o ID"
                className={styles.filterInput}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instrumento
              </label>
              <input
                type="text"
                value={filters.instrument || ''}
                onChange={e => handleFilterChange('instrument', e.target.value)}
                placeholder="Ex: PETR4, USD/BRL"
                className={styles.filterInput}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={e =>
                  handleFilterChange('status', e.target.value || undefined)
                }
                className={styles.filterSelect}
              >
                <option value="">Todos</option>
                <option value="OPEN">Aberta</option>
                <option value="PARTIAL">Parcial</option>
                <option value="EXECUTED">Executada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lado
              </label>
              <select
                value={filters.side || ''}
                onChange={e =>
                  handleFilterChange('side', e.target.value || undefined)
                }
                className={styles.filterSelect}
              >
                <option value="">Todos</option>
                <option value="BUY">Compra</option>
                <option value="SELL">Venda</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className={styles.filterResetButton}
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DataGrid Table */}
      <div className={styles.container}>
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead className={styles.header}>
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`${styles.headerCell} ${
                      pagination.sortBy === column.key
                        ? styles.headerCellSorted
                        : ''
                    }`}
                    onClick={() =>
                      column.sortable && handleSort(column.key as keyof Order)
                    }
                  >
                    <div className={styles.headerCellContent}>
                      {column.label}
                      {column.sortable && (
                        <span className={styles.sortIcon}>
                          {pagination.sortBy === column.key
                            ? pagination.sortOrder === 'asc'
                              ? '↑'
                              : '↓'
                            : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center"
                  >
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>📋</div>
                      <p className={styles.emptyStateText}>
                        Nenhuma ordem encontrada.{' '}
                        {showFilters && 'Tente ajustar os filtros.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order: Order) => (
                  <tr
                    key={order.id}
                    className={styles.row}
                    onClick={() => onOrderSelect?.(order)}
                  >
                    <td className={styles.cell}>
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {order.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className={styles.cell}>
                      <span className="font-medium">{order.instrument}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.sideBadge} ${getSideBadgeClass(order.side)}`}
                      >
                        {order.side === 'BUY' ? 'Compra' : 'Venda'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className="font-semibold">
                        {formatCurrency(order.price)}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      {order.quantity.toLocaleString('pt-BR')}
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`font-medium ${
                          order.remainingQuantity === 0
                            ? 'text-green-600'
                            : order.remainingQuantity < order.quantity
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {order.remainingQuantity.toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status === 'OPEN' && 'Aberta'}
                        {order.status === 'PARTIAL' && 'Parcial'}
                        {order.status === 'EXECUTED' && 'Executada'}
                        {order.status === 'CANCELLED' && 'Cancelada'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <div className="flex flex-col">
                        <span className="text-gray-900">
                          {formatDate(order.createdAt)}
                        </span>
                        {order.updatedAt !== order.createdAt && (
                          <span className="text-xs text-gray-500">
                            Atualizada: {formatDate(order.updatedAt)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Mostrando{' '}
              <span className="font-medium">{(page - 1) * limit + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(page * limit, total)}
              </span>{' '}
              de <span className="font-medium">{total}</span> ordens
            </div>
            <div className={styles.paginationButtons}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`${styles.paginationButton} ${
                        page === pageNum ? styles.paginationButtonActive : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={styles.paginationButton}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          <label className="mr-2">Itens por página:</label>
          <select
            value={limit}
            onChange={e =>
              updatePagination({ limit: Number(e.target.value), page: 1 })
            }
            className="rounded border border-gray-300 px-2 py-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          Página <span className="font-medium">{page}</span> de{' '}
          <span className="font-medium">{totalPages}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDataGrid;
