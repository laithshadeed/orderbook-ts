import OrderBook from './orderbook/OrderBook.ts';

try {
  const DEFAULT_TIMEOUT = 1000; // in ms
  const DEFAULT_SNAPSHOT_DEPTH = 5;
  const envTimeout = Number.parseInt(Deno.env.get('TIMEOUT') ?? '', 10);
  const timeout = Number.isNaN(envTimeout) ? DEFAULT_TIMEOUT : envTimeout;
  const envDepth = Number.parseInt(Deno.env.get('DEPTH') ?? '', 10);
  const depth = Number.isNaN(envDepth) ? DEFAULT_SNAPSHOT_DEPTH : envDepth;
  const orderBook = new OrderBook();
  await orderBook.build();
  orderBook.print(depth);
  setInterval(() => orderBook.print(depth), timeout);
} catch (e) {
  console.error(e);
  Deno.exit(1);
}

Deno.addSignalListener('SIGINT', () => {
  Deno.exit();
});
