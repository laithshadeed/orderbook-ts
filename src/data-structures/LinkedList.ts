class LinkedListNode<T> {
  val: T | undefined = undefined;
  next: LinkedListNode<T> | undefined = undefined;

  constructor(val?: T) {
    this.val = val;
  }
}

export default class LinkedList<T> {
  private head: LinkedListNode<T> | undefined = undefined;
  private tail: LinkedListNode<T> | undefined = undefined;

  append(value: T) {
    const newNode = new LinkedListNode(value);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      return this;
    } else if (this.tail) {
      this.tail.next = newNode;
      this.tail = newNode;
      return this;
    }

    throw new Error('You should execute this line!');
  }

  deleteHead() {
    if (!this.head) {
      return null;
    }

    const deletedHead = this.head;
    if (this.head.next) {
      this.head = this.head.next;
    } else {
      this.head = undefined;
      this.tail = undefined;
    }

    return deletedHead;
  }

  toArray() {
    const nodes = [];
    let currentNode = this.head;
    while (currentNode) {
      nodes.push(currentNode.val);
      currentNode = currentNode.next;
    }

    return nodes;
  }
}
