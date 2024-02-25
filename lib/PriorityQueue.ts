export class PriorityQueue {
  private queue: [number, any][] = [];

  enqueue(item: any, priority: number) {
    this.queue.push([priority, item]);
    this.queue.sort((a, b) => a[0] - b[0]);

    // for (let i = 0; i < this.queue.length; i++) {
    //   if (this.queue[i][0] > priority) {
    //     this.queue.splice(i, 0, [priority, item]);
    //     break;
    //   }
    // }
  }

  dequeue() {
    return this.queue.shift()?.[1];
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}
