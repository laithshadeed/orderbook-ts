export default interface OrderBookPrinter {
  print({}: { bids: Array<Array<number>>; asks: Array<Array<number>> }): void;
}
