import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useOrderStore } from '@/stores/orderStore';
import type { Order } from '@/types/order';
import {
  orderCreateSchema,
  type OrderCreateFormValues,
} from '@/utils/validation/orderSchemas';

let orderIdCounter = 1000;

const generateOrderId = () => {
  orderIdCounter += 1;
  return `ORD-${orderIdCounter.toString().padStart(3, '0')}`;
};

type CreateOrderFormProps = {
  onSuccess?: () => void;
};

const CreateOrderForm = ({ onSuccess }: CreateOrderFormProps) => {
  const addOrder = useOrderStore(state => state.addOrder);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderCreateFormValues>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      instrument: '',
      side: 'BUY',
      price: 0,
      quantity: 1,
    },
  });

  const onSubmit = (data: OrderCreateFormValues) => {
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: generateOrderId(),
      instrument: data.instrument.trim(),
      side: data.side,
      price: data.price,
      quantity: data.quantity,
      remainingQuantity: data.quantity,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
      userId: 'USER-LOCAL',
    };

    addOrder(newOrder);
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instrumento
        </label>
        <input
          type="text"
          {...register('instrument')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: PETR4, VALE3, USD/BRL"
        />
        {errors.instrument && (
          <p className="mt-1 text-xs text-red-600">
            {errors.instrument.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lado
          </label>
          <select
            {...register('side')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="BUY">Compra</option>
            <option value="SELL">Venda</option>
          </select>
          {errors.side && (
            <p className="mt-1 text-xs text-red-600">{errors.side.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0,00"
          />
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade
          </label>
          <input
            type="number"
            step="1"
            min="1"
            {...register('quantity', { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          Criar Ordem
        </button>
      </div>
    </form>
  );
};

export default CreateOrderForm;
