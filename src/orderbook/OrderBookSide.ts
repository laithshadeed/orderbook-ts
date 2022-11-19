import { createRBTree, RedBlackTree } from '../data-structures/RBTree.ts';

/**
 * TODO:
 * 1. [stretch] Experiment with Skip List instead Red-black Tree
 * 2. [stretch] Experiment with combining the Ordered Set with Hash Table to improve lookup time to O(1)
 * 3. [stretch] Write Red-black tree from scratch instead of using 3rd party code
 */

class OrderBookSide {
  static INCR = 'increasing';
  static DECR = 'decreasing';
  private cmp: (a: number, b: number) => number;
  private tree: RedBlackTree<number, Array<number>>;
  constructor({ sort }: { sort: string }) {
    this.cmp = sort === OrderBookSide.INCR ? this.increasingComprator : this.decreasingComprator;
    this.tree = createRBTree(this.cmp);
  }

  init(list: Array<Array<number>>) {
    for (let [price, quantity] of list) {
      price -= 0; // str to num faster than Number.parseFloat
      quantity -= 0; //  str to num faster than Number.parseFloat
      this.tree = this.tree.insert(price, [price, quantity]);
    }
  }

  // Insipred by:
  // - https://github.com/fasenderos/hft-limit-order-book/blob/a0fba7342ac36d2dd03df07be5127f3fc59f9476/src/orderside.ts#L40
  // - https://steemit.com/utopian-io/@steempytutorials/part-2-manage-local-steem-orderbook-via-websocket-stream-from-exchange
  // - https://web.archive.org/web/20110219163448/http://howtohft.wordpress.com/2011/02/15/how-to-build-a-fast-limit-order-book/
  update(list: Array<Array<number>>) {
    for (let [price, quantity] of list) {
      price -= 0; // str to num faster than Number.parseFloat
      quantity -= 0; //  str to num faster than Number.parseFloat
      if (this.tree.get(price)) {
        if (quantity === 0) {
          this.tree = this.tree.remove(price);
        } else {
          this.tree.get(price).value = [price, quantity];
        }
      } else if (quantity === 0) {
        continue;
      } else {
        this.tree = this.tree.insert(price, [price, quantity]);
      }
    }
  }

  top(len: number) {
    return this.tree.values.slice(0, len);
  }

  protected increasingComprator(a: number, b: number) {
    return a - b;
  }

  protected decreasingComprator(a: number, b: number) {
    return b - a;
  }
}

export default OrderBookSide;
