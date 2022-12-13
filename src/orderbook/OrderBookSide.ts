import { ascend, descend, RedBlackTree } from "https://deno.land/std@0.167.0/collections/red_black_tree.ts";

/**
 * TODO:
 * 1. [stretch] Experiment with Skip List instead Red-black Tree
 * 2. [stretch] Experiment with combining the Ordered Set with Hash Table to improve lookup time to O(1)
 */

class OrderBookSide {
  static INCR = 'increasing';
  static DECR = 'decreasing';
  private cmp: (a: number[], b: number[]) => number;
  private tree: RedBlackTree<number[]>;
  constructor({ sort }: { sort: string }) {
    this.cmp = sort === OrderBookSide.INCR ? this.increasingComprator : this.decreasingComprator;
    this.tree = new RedBlackTree<number[]>(this.cmp);
  }

  init(list: Array<Array<number>>) {
    for (let [price, quantity] of list) {
      price -= 0; // str to num faster than Number.parseFloat
      quantity -= 0; //  str to num faster than Number.parseFloat
      this.tree.insert([price, quantity]);
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
      const value = this.tree.find([price, quantity]);
      if (value) {
        this.tree.remove(value);
        if (quantity !== 0) {
          this.tree.remove(value)
          this.tree.insert([price, quantity]);
        }
      } else if (quantity === 0) {
        continue;
      } else {
        this.tree.insert([price, quantity]);
      }
    }
  }

  top(len: number): number[][] {
    return [...this.tree].slice(0, len);
  }

  protected increasingComprator(a: number[], b: number[]) {
    return ascend(a[0], b[0]);
  }

  protected decreasingComprator(a: number[], b: number[]) {
    return descend(a[0], b[0]);
  }
}

export default OrderBookSide;
