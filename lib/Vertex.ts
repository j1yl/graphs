export class Vertex {
  adjacencyList: Map<Vertex, number>;

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {
    this.adjacencyList = new Map<Vertex, number>();
  }

  addNeighbor(neighbor: Vertex, weight: number = 1): void {
    this.adjacencyList.set(neighbor, weight);
  }

  getNeighbors(): Vertex[] {
    return Array.from(this.adjacencyList.keys());
  }

  getWeight(neighbor: Vertex): number {
    return this.adjacencyList.get(neighbor) || 0;
  }
}
