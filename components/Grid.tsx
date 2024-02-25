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
  const [amount, setAmount] = useState(48);
  const [density, setDensity] = useState(0.5);

  const [isAnimating, setIsAnimating] = useState(false);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const initVertices = (): Vertex[] => {
    const minDistance = 50; // min dist for 2 pts in px
    const maxAttempts = amount * 3;

    let verts = [];
    let attempts = 0;

    while (verts.length < amount && attempts < maxAttempts) {
      const x = Math.random() * width;
      const y = Math.random() * height;
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
    const maxConnectionsPerVertex = 4; // max connects per vertex
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
    if (startVertex && endVertex) {
      let result: {
        path: Vertex[];
        visited: Edge[];
      } = { path: [], visited: [] };

      switch (algorithm) {
        case "dijkstra": {
          result = dijkstra(vertices, edges, startVertex, endVertex);
          console.log(result);
          break;
        }
        case "astar": {
          result = astar(vertices, edges, startVertex, endVertex, heuristic);
          console.log(result);
          break;
        }
        default: {
          result = { path: [], visited: [] };
        }
      }

      animatePath(result.path, result.visited);
    }
  }, [startVertex, endVertex, vertices, edges, algorithm]);

  // const animatePath = (pathVertices: Vertex[], visited: Edge[]) => {
  //   setVisitedEdges([]);
  //   setShortestPathEdges([]);

  //   visited.forEach((edge, index) => {
  //     setTimeout(() => {
  //       setVisitedEdges((currentEdges) => [...currentEdges, edge]);
  //     }, index * 50);
  //   });

  //   const delayBeforeShortestPath = visitedEdges.length * 100;
  //   setTimeout(() => {
  //     pathVertices.forEach((vertex, index) => {
  //       if (index < pathVertices.length - 1) {
  //         const delay = index * 500;
  //         setTimeout(() => {
  //           setShortestPathEdges((currentEdges) => [
  //             ...currentEdges,
  //             edges.find(
  //               (edge) =>
  //                 (edge.from === vertex &&
  //                   edge.to === pathVertices[index + 1]) ||
  //                 (edge.to === vertex && edge.from === pathVertices[index + 1]),
  //             ) as Edge,
  //           ]);
  //         }, delay);
  //       }
  //     });
  //   }, delayBeforeShortestPath);
  // };

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
      clearAnimationTimeouts(); // Clear existing animations
      setStartVertex(vertex);
      setEndVertex(null);
      setVisitedEdges([]);
      setShortestPathEdges([]);
    } else if (!endVertex && vertex !== startVertex) {
      setEndVertex(vertex);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
      }}
      className="flex flex-col items-center justify-center gap-4 md:gap-8"
    >
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-center font-bold uppercase">
            Bidirectional graph traversal (Dijkstra&apos;s algorithm)
          </h2>
          <p className="text-center text-xs text-neutral-400">
            Click two dots to find the shortest path and visualize algorithm
            behavior.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg border border-green-200 text-xs text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4ade80,0_0_8px_#4ade80,0_0_8px_#4ade80]">
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
            <div className="flex items-center justify-center rounded-lg border border-green-200 text-xs text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4ade80,0_0_8px_#4ade80,0_0_8px_#4ade80]">
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
                onClick={() => setAmount(48)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: amount === 48 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                48
              </button>
              <button
                disabled={isAnimating}
                onClick={() => setAmount(100)}
                className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-green-300/30 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-neutral-400`}
                style={{
                  background: amount === 100 ? "rgba(134, 239, 172, 0.3)" : "",
                }}
              >
                100
              </button>
            </div>
            <div className="flex items-center justify-center rounded-lg border border-green-200 text-xs text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4ade80,0_0_8px_#4ade80,0_0_8px_#4ade80]">
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
              className="fill-neutral-700 text-xs"
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
            className={"stroke-green-800"}
            strokeWidth={1}
            filter={"url(#glow)"}
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
            className="stroke-green-400"
            strokeWidth={2}
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
            onClick={() => handleVertexClick(vertex)}
            className={`cursor-pointer fill-white ${startVertex === vertex ? "fill-white" : endVertex === vertex ? "fill-white" : "fill-neutral-400"} stroke-2`}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
};

export default Grid;
