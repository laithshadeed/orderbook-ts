import { Diff, OrderBookDiffs } from './OrderBookDiffs.ts';
import OrderBookSnapshot from './OrderBookSnapshot.ts';
import OrderBookSide from './OrderBookSide.ts';
import OrderBookPrinterSimple from './OrderBookPrinterSimple.ts';

interface Params {
  diffs?: OrderBookDiffs;
  snapshot?: OrderBookSnapshot;
  bids?: OrderBookSide;
  asks?: OrderBookSide;
  printer?: OrderBookPrinterSimple;
}

class OrderBook {
  private DEFAULT_PRINT_DEPTH = 5;
  private diffs: OrderBookDiffs;
  private snapshot: OrderBookSnapshot;
  private bids: OrderBookSide;
  private asks: OrderBookSide;
  private printer: OrderBookPrinterSimple;
  private isWaitingForFirstUpdate = true;
  private isFetchingSnapshot = false;
  private isSnapshotFetched = false;
  private lastUpdateId = 0;

  constructor({ diffs, snapshot, bids, asks, printer }: Params = {}) {
    this.diffs = diffs || new OrderBookDiffs();
    this.snapshot = snapshot || new OrderBookSnapshot();
    this.bids = bids || new OrderBookSide({ sort: OrderBookSide.DECR });
    this.asks = asks || new OrderBookSide({ sort: OrderBookSide.INCR });
    this.printer = printer || new OrderBookPrinterSimple();
  }

  // We need to wait for the buffered updates before start fetching the snapshot as per the docs
  // https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md#how-to-manage-a-local-order-book-correctly
  build() {
    return new Promise<void>((resolve) => {
      this.diffs.bus.addEventListener('update', async () => {
        if (this.isSnapshotFetched) {
          this.update();
        } else if (!this.isFetchingSnapshot && !this.isSnapshotFetched) {
          this.isFetchingSnapshot = true;
          console.log('Waiting to fetch the snapshot...');
          const { lastUpdateId, bids, asks } = await this.snapshot.get();
          this.lastUpdateId = lastUpdateId;
          this.bids.init(bids);
          this.asks.init(asks);
          this.isFetchingSnapshot = false;
          this.isSnapshotFetched = true;
          this.update();
          resolve();
        }
      });
    });
  }

  // Docs: https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md#how-to-manage-a-local-order-book-correctly
  update() {
    for (const { firstUpdateId, lastUpdateId, bids, asks } of this.diffs as unknown as Diff[]) {
      if (this.isWaitingForFirstUpdate) {
        if (lastUpdateId >= this.lastUpdateId + 1 && firstUpdateId <= this.lastUpdateId + 1) {
          this.isWaitingForFirstUpdate = false;
          this.lastUpdateId = lastUpdateId;
          this.bids.update(bids);
          this.asks.update(asks);
        }
      } else if (firstUpdateId === this.lastUpdateId + 1) {
        this.lastUpdateId = lastUpdateId;
        this.bids.update(bids);
        this.asks.update(asks);
      }
    }
  }

  print(depth = this.DEFAULT_PRINT_DEPTH) {
    this.printer.print({ asks: this.asks.top(depth), bids: this.bids.top(depth) });
  }
}

export default OrderBook;
