import { describe, it, expect } from 'vitest';
import type { Order } from '@/types/order';
import { matchOrder } from '@/utils/orderMatching';

const baseOrder = (overrides: Partial<Order>): Order => ({
  id: overrides.id ?? 'ORD-BASE',
  instrument: overrides.instrument ?? 'PETR4',
  side: overrides.side ?? 'BUY',
  price: overrides.price ?? 10,
  quantity: overrides.quantity ?? 1000,
  remainingQuantity: overrides.remainingQuantity ?? overrides.quantity ?? 1000,
  status: overrides.status ?? 'OPEN',
  createdAt: overrides.createdAt ?? '2026-03-08T10:00:00Z',
  updatedAt: overrides.updatedAt ?? '2026-03-08T10:00:00Z',
  userId: overrides.userId ?? 'USER-1',
});

describe('matchOrder', () => {
  it('não deve executar quando não há contraparte compatível', () => {
    const incoming = baseOrder({
      id: 'IN-1',
      side: 'BUY',
      price: 10,
      quantity: 100,
      remainingQuantity: 100,
    });

    const existing = [
      // Mesmo lado
      baseOrder({ id: 'EX-1', side: 'BUY', price: 9 }),
      // Instrumento diferente
      baseOrder({ id: 'EX-2', side: 'SELL', instrument: 'VALE3', price: 9 }),
      // Preço não compatível (SELL mais caro que BUY)
      baseOrder({ id: 'EX-3', side: 'SELL', price: 11 }),
      // Status não executável
      baseOrder({ id: 'EX-4', side: 'SELL', price: 9, status: 'EXECUTED' }),
    ];

    const result = matchOrder(incoming, existing);

    expect(result.executions).toHaveLength(0);
    expect(result.newOrder.status).toBe('OPEN');
    expect(result.newOrder.remainingQuantity).toBe(100);
    expect(result.updatedOrders).toHaveLength(existing.length + 1);

    // Nenhuma ordem existente deve ter mudado
    for (const ex of existing) {
      const updated = result.updatedOrders.find(o => o.id === ex.id)!;
      expect(updated.status).toBe(ex.status);
      expect(updated.remainingQuantity).toBe(ex.remainingQuantity);
    }
  });

  it('deve executar totalmente quando quantidades são iguais', () => {
    const incoming = baseOrder({
      id: 'IN-1',
      side: 'BUY',
      quantity: 100,
      remainingQuantity: 100,
      price: 10,
    });
    const counter = baseOrder({
      id: 'EX-1',
      side: 'SELL',
      quantity: 100,
      remainingQuantity: 100,
      price: 10,
    });

    const result = matchOrder(incoming, [counter]);

    expect(result.executions).toHaveLength(1);
    const exec = result.executions[0];
    expect(exec.executedQuantity).toBe(100);
    expect(exec.remainingQuantity).toBe(0);
    expect(exec.newStatus).toBe('EXECUTED');

    const updatedIncoming = result.newOrder;
    const updatedCounter = result.updatedOrders.find(o => o.id === counter.id)!;

    expect(updatedIncoming.status).toBe('EXECUTED');
    expect(updatedIncoming.remainingQuantity).toBe(0);
    expect(updatedCounter.status).toBe('EXECUTED');
    expect(updatedCounter.remainingQuantity).toBe(0);
  });

  it('deve deixar nova ordem parcial quando quantidade é maior que a contraparte', () => {
    const incoming = baseOrder({
      id: 'IN-1',
      side: 'BUY',
      quantity: 1000,
      remainingQuantity: 1000,
      price: 10,
    });
    const counter = baseOrder({
      id: 'EX-1',
      side: 'SELL',
      quantity: 600,
      remainingQuantity: 600,
      price: 10,
    });

    const result = matchOrder(incoming, [counter]);

    expect(result.executions).toHaveLength(1);
    const exec = result.executions[0];
    expect(exec.executedQuantity).toBe(600);
    expect(exec.remainingQuantity).toBe(400);
    expect(exec.newStatus).toBe('PARTIAL');

    const updatedIncoming = result.newOrder;
    const updatedCounter = result.updatedOrders.find(o => o.id === counter.id)!;

    expect(updatedIncoming.status).toBe('PARTIAL');
    expect(updatedIncoming.remainingQuantity).toBe(400);
    expect(updatedCounter.status).toBe('EXECUTED');
    expect(updatedCounter.remainingQuantity).toBe(0);
  });

  it('deve deixar contraparte parcial quando nova ordem tem quantidade menor', () => {
    const incoming = baseOrder({
      id: 'IN-1',
      side: 'BUY',
      quantity: 500,
      remainingQuantity: 500,
      price: 10,
    });
    const counter = baseOrder({
      id: 'EX-1',
      side: 'SELL',
      quantity: 800,
      remainingQuantity: 800,
      price: 10,
    });

    const result = matchOrder(incoming, [counter]);

    expect(result.executions).toHaveLength(1);
    const exec = result.executions[0];
    expect(exec.executedQuantity).toBe(500);
    expect(exec.remainingQuantity).toBe(0);
    expect(exec.newStatus).toBe('EXECUTED');

    const updatedIncoming = result.newOrder;
    const updatedCounter = result.updatedOrders.find(o => o.id === counter.id)!;

    expect(updatedIncoming.status).toBe('EXECUTED');
    expect(updatedIncoming.remainingQuantity).toBe(0);
    expect(updatedCounter.status).toBe('PARTIAL');
    expect(updatedCounter.remainingQuantity).toBe(300);
  });

  it('deve casar contra múltiplas contrapartes respeitando prioridade preço-tempo (BUY)', () => {
    const incoming = baseOrder({
      id: 'IN-1',
      side: 'BUY',
      quantity: 700,
      remainingQuantity: 700,
      price: 11,
    });

    const sellA = baseOrder({
      id: 'S-A',
      side: 'SELL',
      price: 10,
      quantity: 300,
      remainingQuantity: 300,
      createdAt: '2026-03-08T09:00:00Z',
    });

    const sellB = baseOrder({
      id: 'S-B',
      side: 'SELL',
      price: 9,
      quantity: 400,
      remainingQuantity: 400,
      createdAt: '2026-03-08T09:30:00Z',
    });

    const sellC = baseOrder({
      id: 'S-C',
      side: 'SELL',
      price: 11,
      quantity: 500,
      remainingQuantity: 500,
      createdAt: '2026-03-08T08:00:00Z',
    });

    const result = matchOrder(incoming, [sellA, sellB, sellC]);

    // BUY deve casar primeiro com menor preço (S-B), depois S-A; S-C fica intacto
    expect(result.executions).toHaveLength(2);
    expect(result.executions[0].matchedOrderId).toBe('S-B');
    expect(result.executions[0].executedQuantity).toBe(400);
    expect(result.executions[1].matchedOrderId).toBe('S-A');
    expect(result.executions[1].executedQuantity).toBe(300);

    const updatedIncoming = result.newOrder;
    expect(updatedIncoming.status).toBe('EXECUTED');
    expect(updatedIncoming.remainingQuantity).toBe(0);

    const updatedA = result.updatedOrders.find(o => o.id === 'S-A')!;
    const updatedB = result.updatedOrders.find(o => o.id === 'S-B')!;
    const updatedC = result.updatedOrders.find(o => o.id === 'S-C')!;

    expect(updatedA.status).toBe('EXECUTED');
    expect(updatedA.remainingQuantity).toBe(0);
    expect(updatedB.status).toBe('EXECUTED');
    expect(updatedB.remainingQuantity).toBe(0);
    expect(updatedC.status).toBe('OPEN');
    expect(updatedC.remainingQuantity).toBe(500);
  });

  it('deve respeitar condição de preço para SELL contra BUY', () => {
    const incoming = baseOrder({
      id: 'IN-1',
      side: 'SELL',
      price: 10,
      quantity: 100,
      remainingQuantity: 100,
    });

    const buyTooLow = baseOrder({
      id: 'B-1',
      side: 'BUY',
      price: 9,
      quantity: 200,
      remainingQuantity: 200,
    });
    const buyOk = baseOrder({
      id: 'B-2',
      side: 'BUY',
      price: 10,
      quantity: 200,
      remainingQuantity: 200,
    });

    const result = matchOrder(incoming, [buyTooLow, buyOk]);

    expect(result.executions).toHaveLength(1);
    const exec = result.executions[0];
    expect(exec.matchedOrderId).toBe('B-2');

    const updatedTooLow = result.updatedOrders.find(o => o.id === 'B-1')!;
    const updatedOk = result.updatedOrders.find(o => o.id === 'B-2')!;

    expect(updatedTooLow.status).toBe('OPEN');
    expect(updatedTooLow.remainingQuantity).toBe(200);
    expect(updatedOk.status).toBe('PARTIAL');
    expect(updatedOk.remainingQuantity).toBe(100);
  });
});
