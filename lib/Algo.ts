import { Edge } from "./Edge";
import { Vertex } from "./Vertex";
import { PriorityQueue } from "./PriorityQueue";

export function dijkstra(
  vertices: Vertex[],
  edges: Edge[],
  startVertex: Vertex,
  endVertex: Vertex,
): {
  path: Vertex[];
  visited: Edge[];
} {
  const distances = new Map<Vertex, number>();
  const previous = new Map<Vertex, Vertex | null>();
  const queue: Vertex[] = [];
  const visited: Edge[] = [];

  vertices.forEach((vertex) => {
    distances.set(vertex, vertex === startVertex ? 0 : Infinity);
    previous.set(vertex, null);
    queue.push(vertex);
  });

  while (queue.length > 0) {
    queue.sort(
      (a, b) => (distances.get(a) ?? Infinity) - (distances.get(b) ?? Infinity),
    );

    const currentVertex = queue.shift();
    if (!currentVertex) break;

    visited.push(
      new Edge(previous.get(currentVertex) ?? currentVertex, currentVertex, 0),
    );

    if (currentVertex === endVertex) break;

    const currentDistance = distances.get(currentVertex) ?? Infinity;

    edges
      .filter((edge) => edge.from === currentVertex)
      .forEach((edge) => {
        const alt = currentDistance + edge.weight;
        if (alt < (distances.get(edge.to) ?? Infinity)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, currentVertex);
        }
      });
  }

  // Reconstruct path
  let path: Vertex[] = [];
  let current: Vertex | null = endVertex;
  while (current !== startVertex && current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }
  if (current === startVertex) path.unshift(startVertex);

  return { path, visited };
}

export function heuristic(a: Vertex, b: Vertex) {
  // euclidean distance
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  // manhattan distance
  // return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function astar(
  vertices: Vertex[],
  edges: Edge[],
  startVertex: Vertex,
  endVertex: Vertex,
  heuristic: (a: Vertex, b: Vertex) => number,
): {
  path: Vertex[];
  visited: Edge[];
} {
  const distances = new Map();
  const previous = new Map();
  const queue = new PriorityQueue();
  const visited: Edge[] = [];

  vertices.forEach((vertex) => {
    distances.set(vertex, vertex === startVertex ? 0 : Infinity);
    previous.set(vertex, null);
    queue.enqueue(vertex, vertex === startVertex ? 0 : Infinity);
  });

  while (!queue.isEmpty()) {
    const currentVertex = queue.dequeue();

    if (currentVertex === endVertex) {
      break;
    }

    edges
      .filter((edge) => edge.from === currentVertex)
      .forEach((edge) => {
        const alt = distances.get(currentVertex) + edge.weight;
        if (alt < distances.get(edge.to)) {
          distances.set(edge.to, alt);
          previous.set(edge.to, currentVertex);
          queue.enqueue(edge.to, alt + heuristic(edge.to, endVertex));
          visited.push(edge);
        }
      });
  }

  let path = [];
  let current = endVertex;
  while (current !== startVertex && current !== null) {
    path.unshift(current);
    current = previous.get(current);
  }
  if (current === startVertex) path.unshift(startVertex);

  return { path, visited };
}
