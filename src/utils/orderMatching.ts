import type { Order, OrderExecutionResult, OrderSide } from '@/types/order';

export interface MatchResult {
  /**
   * Lista completa de ordens após aplicar o matching,
   * incluindo a nova ordem já atualizada.
   */
  updatedOrders: Order[];

  /**
   * Eventos de execução gerados durante o matching.
   * newStatus e remainingQuantity referem-se SEMPRE à nova ordem (incoming).
   */
  executions: OrderExecutionResult[];

  /**
   * A nova ordem já atualizada (status/remainingQuantity/updatedAt).
   */
  newOrder: Order;
}

const isExecutableStatus = (status: Order['status']) =>
  status === 'OPEN' || status === 'PARTIAL';

/**
 * Determina se uma ordem candidata é elegível para casar com a ordem de entrada,
 * considerando instrumento, lado oposto, status e condição de preço.
 */
const isEligibleCounterpart = (incoming: Order, candidate: Order): boolean => {
  if (incoming.instrument !== candidate.instrument) return false;
  if (incoming.side === candidate.side) return false;
  if (!isExecutableStatus(candidate.status)) return false;

  // Condição de preço "igual ou mais agressivo"
  if (incoming.side === 'BUY') {
    // BUY casa com SELL de preço menor ou igual
    return candidate.price <= incoming.price;
  }

  // incoming SELL casa com BUY de preço maior ou igual
  return candidate.price >= incoming.price;
};

/**
 * Ordenação de contrapartes seguindo uma heurística preço-tempo:
 *
 * - Para BUY (comprador entrando):
 *   - Melhor para o comprador é o menor preço de venda.
 *   - Em caso de empate de preço, mais antiga primeiro (createdAt mais antigo).
 *
 * - Para SELL (vendedor entrando):
 *   - Melhor para o vendedor é o maior preço de compra.
 *   - Em caso de empate, mais antiga primeiro.
 */
const sortCounterparts = (
  incomingSide: OrderSide,
  a: Order,
  b: Order
): number => {
  if (incomingSide === 'BUY') {
    // Menor preço de venda primeiro
    if (a.price !== b.price) return a.price - b.price;
  } else {
    // Maior preço de compra primeiro
    if (a.price !== b.price) return b.price - a.price;
  }

  // Desempate por tempo (mais antiga primeiro)
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  return timeA - timeB;
};

/**
 * Aplica a lógica de execução de ordens para uma nova ordem de entrada
 * contra o book atual (`existingOrders`).
 *
 * Regras principais:
 * - Casa apenas com contrapartes (lado oposto) do mesmo instrumento.
 * - Condição de preço: BUY x SELL com preço do SELL <= preço do BUY;
 *                      SELL x BUY com preço do BUY >= preço do SELL.
 * - Quantidade executada é o mínimo entre as quantidades restantes.
 * - Status/remainingQuantity são atualizados para ambas as partes.
 */
export function matchOrder(
  incoming: Order,
  existingOrders: Order[]
): MatchResult {
  const now = new Date().toISOString();

  // Candidatos elegíveis para casar
  const eligibleCounterparts = existingOrders.filter(order =>
    isEligibleCounterpart(incoming, order)
  );

  const sortedCounterparts = [...eligibleCounterparts].sort((a, b) =>
    sortCounterparts(incoming.side, a, b)
  );

  const executions: OrderExecutionResult[] = [];

  let remainingIncoming = incoming.remainingQuantity;
  const updatedCounterparts = new Map<string, Order>();
  let anyExecuted = false;

  for (const counter of sortedCounterparts) {
    if (remainingIncoming <= 0) break;

    const counterRemaining = counter.remainingQuantity;
    if (counterRemaining <= 0) continue;

    const executedQuantity = Math.min(remainingIncoming, counterRemaining);
    if (executedQuantity <= 0) continue;

    anyExecuted = true;

    const newCounterRemaining = counterRemaining - executedQuantity;

    const updatedCounter: Order = {
      ...counter,
      remainingQuantity: newCounterRemaining,
      status: newCounterRemaining === 0 ? 'EXECUTED' : 'PARTIAL',
      updatedAt: now,
    };

    updatedCounterparts.set(updatedCounter.id, updatedCounter);

    remainingIncoming -= executedQuantity;

    const incomingStatusAfterTrade: Order['status'] =
      remainingIncoming === 0 ? 'EXECUTED' : 'PARTIAL';

    executions.push({
      orderId: incoming.id,
      matchedOrderId: counter.id,
      executedQuantity,
      remainingQuantity: remainingIncoming,
      newStatus: incomingStatusAfterTrade,
      timestamp: now,
    });
  }

  let updatedIncoming: Order;

  if (!anyExecuted) {
    // Nenhuma execução: mantemos a ordem como veio
    updatedIncoming = { ...incoming };
  } else {
    updatedIncoming = {
      ...incoming,
      remainingQuantity: remainingIncoming,
      status: remainingIncoming === 0 ? 'EXECUTED' : 'PARTIAL',
      updatedAt: now,
    };
  }

  // Reconstrói o book com as contrapartes atualizadas
  const updatedOrders = existingOrders.map(
    order => updatedCounterparts.get(order.id) ?? order
  );

  // Inclui a nova ordem no book (mesmo que EXECUTED, para manter histórico)
  updatedOrders.unshift(updatedIncoming);

  return {
    updatedOrders,
    executions,
    newOrder: updatedIncoming,
  };
}
