import Queue from '../data-structures/Queue.ts';

/**
 * TODO:
 * 1. [stretch] Test 24 disconnection -> not needed for such a simple app
 * 2. [stretch] Test ping/pong frame, already covered with ws module
 * 3. [stretch] Replace ws dependency with in-house
 */

interface Params {
  symbol?: string;
  updateSpeed?: number;
  endpoint?: string;
  initialBufferSize?: number;
}

interface Diff {
  firstUpdateId: number;
  lastUpdateId: number;
  bids: Array<Array<number>>;
  asks: Array<Array<number>>;
}

class OrderBookDiffs {
  bus: EventTarget;

  private ENDPOINT = 'wss://stream.binance.com:9443/ws';
  private UPDATE_SPEED = 100;
  private EVENT_TYPE = 'depthUpdate';
  private DEFAULT_SYMBOL = 'btcusdt';
  private INITIAL_BUFFER_SIZE = 3;
  private initialBufferSize: number;
  private isFirstUpdateEvent: boolean;
  private symbol: string;
  private diffs: Queue<Diff>;
  private ws: WebSocket;

  constructor({ symbol, updateSpeed, endpoint, initialBufferSize }: Params = {}) {
    symbol = symbol ?? this.DEFAULT_SYMBOL;
    updateSpeed = updateSpeed ?? this.UPDATE_SPEED;
    endpoint = endpoint ?? this.ENDPOINT;
    this.initialBufferSize = initialBufferSize ?? this.INITIAL_BUFFER_SIZE;
    this.isFirstUpdateEvent = true;

    this.bus = new EventTarget();
    this.symbol = symbol;

    // Note the size of the diffs is very small
    // < 100; making using queue unnecessary optmization; however I used it for fun!
    // Instead, plain JS array is good enough
    this.diffs = new Queue();

    console.log('Waiting initial diffs buffer...');

    this.ws = new WebSocket(`${endpoint}/${symbol}@depth@${updateSpeed}ms`);
    this.ws.addEventListener('message', (m) => this.add(m.data));
    this.ws.addEventListener('error', (e) => {
      throw e;
    });
  }

  add(msg: string) {
    const { e: eventType, s: symbol, U: firstUpdateId, u: lastUpdateId, b: bids, a: asks } = JSON.parse(msg);
    if (symbol.toLowerCase() !== this.symbol) {
      console.warn(`Invalid symbol ${symbol.toLowerCase()} != ${this.symbol}, dropping diff`);
      return;
    }

    if (eventType !== this.EVENT_TYPE) {
      console.warn(`Invalid event type ${eventType} != ${this.EVENT_TYPE}, dropping diff`);
      return;
    }

    this.diffs.enqueue({
      firstUpdateId,
      lastUpdateId,
      bids,
      asks,
    });

    // Emit updates after we have at least few messages buffered as required by
    // https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md#how-to-manage-a-local-order-book-correctly
    if (this.isFirstUpdateEvent) {
      if (this.diffs.length >= this.initialBufferSize) {
        this.isFirstUpdateEvent = false;
        this.bus.dispatchEvent(new Event('update'));
      }
    } else {
      this.bus.dispatchEvent(new Event('update'));
    }
  }

  *[Symbol.iterator]() {
    while (this.diffs.length) {
      yield this.diffs.dequeue();
    }
  }
}

export type { Diff };
export { OrderBookDiffs }
