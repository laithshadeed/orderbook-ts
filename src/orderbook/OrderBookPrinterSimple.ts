import OrderBookPrinter from './OrderBookPrinter.ts';

export default class OrderBookPrinterSimple implements OrderBookPrinter {
  print({ bids, asks }: { bids: Array<Array<number>>; asks: Array<Array<number>> }) {
    console.clear();
    console.log(
      asks
        .reverse()
        .map(([price, quantity]) => [price.toFixed(2), quantity.toFixed(5)])
        .map(([price, quantity]) => `\x1b[31m${price}\x1b[0m  ${quantity}`)
        .join('\n') +
        '\n' +
        bids
          .map(([price, quantity]) => [price.toFixed(2), quantity.toFixed(5)])
          .map(([price, quantity]) => `\x1b[32m${price}\x1b[0m  ${quantity}`)
          .join('\n'),
    );
  }
}
