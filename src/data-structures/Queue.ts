import LinkedList from './LinkedList.ts';

export default class Queue<T> {
  private linkedlist: LinkedList<T>;
  private size: number;

  constructor() {
    this.linkedlist = new LinkedList();
    this.size = 0;
  }

  enqueue(x: T) {
    this.size += 1;
    this.linkedlist.append(x);
  }

  dequeue() {
    this.size -= 1;
    const removedHead = this.linkedlist.deleteHead();
    return removedHead?.val ?? null;
  }

  get length() {
    return this.size;
  }
}
