import React, { useState, useEffect, useRef } from "react";
import { Vertex } from "@/lib/Vertex";
import { astar, dijkstra, heuristic } from "@/lib/Algo";
import { motion } from "framer-motion";
import { Edge } from "@/lib/Edge";

type Props = {
  width: number;
  height: number;
  mobile: boolean;
};

type Algorithm = "dijkstra" | "astar";

const Grid: React.FC<Props> = ({ width, height, mobile }) => {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [startVertex, setStartVertex] = useState<Vertex | null>(null);
  const [endVertex, setEndVertex] = useState<Vertex | null>(null);

  const [visitedEdges, setVisitedEdges] = useState<Edge[]>([]);
  const [shortestPathEdges, setShortestPathEdges] = useState<Edge[]>([]);

  const [algorithm, setAlgorithm] = useState<Algorithm>("dijkstra");
  const [amount, setAmount] = useState(32);
  const [density, setDensity] = useState(0.5);

  const [isAnimating, setIsAnimating] = useState(false);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const initVertices = (): Vertex[] => {
    const minDistance = 50; // min dist for 2 pts in px
    const margin = 10;
    const maxAttempts = amount * 3;

    let verts = [];
    let attempts = 0;

    while (verts.length < amount && attempts < maxAttempts) {
      const x = Math.random() * width;
      const y = Math.random() * height;

      if (
        x < margin ||
        x > width - margin ||
        y < margin ||
        y > height - margin
      ) {
        continue;
      }

      let isFarEnough = true;

      for (let vertex of verts) {
        const distance = Math.sqrt(
          Math.pow(vertex.x - x, 2) + Math.pow(vertex.y - y, 2),
        );
        if (distance < minDistance) {
          isFarEnough = false;
          break;
        }
      }

      if (isFarEnough) {
        verts.push(new Vertex(x, y));
      }

      attempts++;
    }

    if (verts.length < amount) {
      console.warn(
        `Only able to place ${verts.length} out of ${amount} vertices due to spacing constraints.`,
      );
    }

    return verts;
  };

  const connectVertices = (
    vertices: Vertex[],
  ): { from: Vertex; to: Vertex; weight: number }[] => {
    let conns: { from: Vertex; to: Vertex; weight: number }[] = [];
    const maxConnectionsPerVertex = 3; // max connects per vertex
    const distanceThreshold = Math.min(width, height) * density; // graph density (0.5 default)

    vertices.forEach((vertex, i) => {
      let connectionsMade = 0;
      for (
        let j = 0;
        j < vertices.length && connectionsMade < maxConnectionsPerVertex;
        j++
      ) {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(vertex.x - vertices[j].x, 2) +
              Math.pow(vertex.y - vertices[j].y, 2),
          );
          if (distance < distanceThreshold) {
            conns.push({ from: vertex, to: vertices[j], weight: distance });
            conns.push({ from: vertices[j], to: vertex, weight: distance });
            connectionsMade++;
          }
        }
      }
    });

    return conns;
  };

  const clearAnimationTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const animatePath = (pathVertices: Vertex[], visited: Edge[]) => {
    setIsAnimating(true);
    clearAnimationTimeouts();
    let animationDelay = 75;
    const visitedBatch: Edge[] = [];
    visited.forEach((edge, index) => {
      setTimeout(() => {
        visitedBatch.push(edge);
        setVisitedEdges([...visitedBatch]);
      }, index * animationDelay);
    });

    const shortestPathDelay = visited.length * animationDelay;
    const shortestPathTimeout = setTimeout(() => {
      const shortestPathBatch: Edge[] = [];
      pathVertices.forEach((vertex, index) => {
        if (index < pathVertices.length - 1) {
          const timeout = setTimeout(() => {
            const nextEdge = edges.find(
              (edge) =>
                (edge.from === vertex && edge.to === pathVertices[index + 1]) ||
                (edge.to === vertex && edge.from === pathVertices[index + 1]),
            );
            if (nextEdge) {
              shortestPathBatch.push(nextEdge);
              setShortestPathEdges([...shortestPathBatch]);
            }
          }, index * 100);
          timeoutRefs.current.push(timeout);
        }
      });
    }, shortestPathDelay);
    timeoutRefs.current.push(shortestPathTimeout);

    const totalAnimationTime =
      visited.length * animationDelay + pathVertices.length * 100;

    const totalAnimationTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, totalAnimationTime);

    timeoutRefs.current.push(totalAnimationTimeout);
  };

  const handleVertexClick = (vertex: Vertex) => {
    if (!startVertex) {
      clearAnimationTimeouts();
      setStartVertex(vertex);
      setEndVertex(null);
      setVisitedEdges([]);
      setShortestPathEdges([]);
    } else if (!endVertex && vertex !== startVertex) {
      setEndVertex(vertex);
    } else if (startVertex && endVertex) {
      setStartVertex(vertex);
      setEndVertex(null);
      setVisitedEdges([]);
      setShortestPathEdges([]);
    }
  };

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const verts = initVertices();
    setVertices(verts);
    setEdges(connectVertices(verts));
    setStartVertex(null);
    setEndVertex(null);
    setVisitedEdges([]);
    setShortestPathEdges([]);
  }, [width, height, density, amount]);

  useEffect(() => {
    clearAnimationTimeouts();
    setVisitedEdges([]);
    setShortestPathEdges([]);
    setIsAnimating(false);
  }, [algorithm, amount, density]);

  useEffect(() => {
    if (startVertex && endVertex) {
      let result: {
        path: Vertex[];
        visited: Edge[];
      } = { path: [], visited: [] };

      switch (algorithm) {
        case "dijkstra": {
          result = dijkstra(vertices, edges, startVertex, endVertex);
          break;
        }
        case "astar": {
          result = astar(vertices, edges, startVertex, endVertex, heuristic);
          break;
        }
        default: {
          result = { path: [], visited: [] };
        }
      }

      animatePath(result.path, result.visited);
    }
  }, [startVertex, endVertex, vertices, edges, algorithm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
      }}
      className="flex flex-col items-center justify-center gap-8 md:gap-16"
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-center font-bold uppercase">
            Graph traversal visualizer
          </h2>
          <p className="text-center text-sm text-neutral-400">
            Click two dots to find the shortest path and visualize algorithm
            behavior.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <div
              title="Select an algorithm"
              className="flex items-center justify-center rounded-lg border border-green-200 text-sm text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4ade80,0_0_8px_#4ade80,0_0_8px_#4ade80]"
            >
              <button
                onClick={() => setAlgorithm("dijkstra")}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background:
                    algorithm === "dijkstra" ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                Dijkstra
              </button>
              <button
                onClick={() => setAlgorithm("astar")}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background:
                    algorithm === "astar" ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                A*
              </button>
            </div>
            <div
              title="Select the amount of vertices"
              className="flex items-center justify-center rounded-lg border border-green-200 text-sm text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4ade80,0_0_8px_#4ade80,0_0_8px_#4ade80]"
            >
              <button
                disabled={isAnimating}
                onClick={() => setAmount(16)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: amount === 16 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                16
              </button>
              <button
                disabled={isAnimating}
                onClick={() => setAmount(32)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: amount === 32 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                32
              </button>
              <button
                disabled={isAnimating}
                onClick={() => setAmount(64)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: amount === 64 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                64
              </button>
            </div>
            <div
              title="Select the graph density"
              className="flex items-center justify-center rounded-lg border border-green-200 text-sm text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4ade80,0_0_8px_#4ade80,0_0_8px_#4ade80]"
            >
              <button
                disabled={isAnimating}
                onClick={() => setDensity(0.3)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: density === 0.3 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                Sparse
              </button>
              <button
                disabled={isAnimating}
                onClick={() => setDensity(0.5)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: density === 0.5 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                Normal
              </button>
              <button
                disabled={isAnimating}
                onClick={() => setDensity(0.7)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: density === 0.7 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                Dense
              </button>
            </div>
          </div>
        </div>
      </div>
      <motion.svg
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        width={width}
        height={height}
        className={"select-none"}
      >
        {edges.map((edge, i) => (
          <svg key={i} className="">
            <line
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              className="stroke-neutral-700"
              strokeWidth={1}
            />
            <text
              x={(edge.from.x + edge.to.x) / 2}
              y={(edge.from.y + edge.to.y) / 2}
              className="fill-neutral-700 text-sm"
            >
              {edge.weight.toFixed(2)}
            </text>
          </svg>
        ))}

        {visitedEdges.map((edge, i) => (
          <motion.line
            key={`visited-${i}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            className={"z-20 stroke-green-700"}
            strokeWidth={mobile ? 2 : 1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}

        {shortestPathEdges.map((edge, i) => (
          <motion.line
            key={`shortest-${i}`}
            x2={edge.from.x}
            y2={edge.from.y}
            x1={edge.to.x}
            y1={edge.to.y}
            className="stroke-green-300"
            strokeWidth={mobile ? 3 : 2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        ))}

        {vertices.map((vertex, i) => (
          <circle
            key={i}
            cx={vertex.x}
            cy={vertex.y}
            r={startVertex === vertex ? 8 : endVertex === vertex ? 8 : 4}
            onClick={() => {
              if (!isAnimating) handleVertexClick(vertex);
            }}
            className={`${isAnimating ? "cursor-not-allowed" : "cursor-pointer"} fill-white ${startVertex === vertex ? "fill-white" : endVertex === vertex ? "fill-white" : "fill-neutral-400"} stroke-2`}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
};

export default Grid;
