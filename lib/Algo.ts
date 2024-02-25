import { Edge } from "./Edge";
import { Vertex } from "./Vertex";

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
