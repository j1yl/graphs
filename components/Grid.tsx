import React, { useState, useEffect } from "react";
import { Vertex } from "@/lib/Vertex";
import { dijkstra } from "@/lib/Algo";
import { motion } from "framer-motion";

type Props = {
  width: number;
  height: number;
  amount: number;
};

const Grid: React.FC<Props> = ({ width, height, amount }) => {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<
    { from: Vertex; to: Vertex; weight: number }[]
  >([]);
  const [startVertex, setStartVertex] = useState<Vertex | null>(null);
  const [endVertex, setEndVertex] = useState<Vertex | null>(null);

  const [visitedEdges, setVisitedEdges] = useState<
    { from: Vertex; to: Vertex }[]
  >([]);
  const [shortestPathEdges, setShortestPathEdges] = useState<
    { from: Vertex; to: Vertex }[]
  >([]);
  const [density, setDensity] = useState(0.5);

  const initVertices = (): Vertex[] => {
    let verts = [];
    const minDistance = 50; // Minimum distance between any two vertices
    let attempts = 0;
    const maxAttempts = amount * 3; // Avoid infinite loops

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

  useEffect(() => {
    const verts = initVertices();
    setVertices(verts);
    setEdges(connectVertices(verts));
  }, [width, height, density, amount]);

  useEffect(() => {
    if (startVertex && endVertex) {
      const { path, visited } = dijkstra(
        vertices,
        edges,
        startVertex,
        endVertex,
      );
      animatePath(path, visited);
    }
  }, [startVertex, endVertex, vertices, edges]);

  const animatePath = (
    pathVertices: Vertex[],
    visited: { from: Vertex; to: Vertex }[],
  ) => {
    setVisitedEdges([]);
    setShortestPathEdges([]);

    visited.forEach((edge, index) => {
      setTimeout(() => {
        setVisitedEdges((currentEdges) => [...currentEdges, edge]);
      }, index * 50); // Adjust timing as needed
    });

    const delayBeforeShortestPath = visitedEdges.length * 100;
    setTimeout(() => {
      pathVertices.forEach((vertex, index) => {
        if (index < pathVertices.length - 1) {
          // Delay each edge of the shortest path based on its position in the path.
          const delay = index * 500; // Adjust timing as needed.
          setTimeout(() => {
            setShortestPathEdges((currentEdges) => [
              ...currentEdges,
              { from: vertex, to: pathVertices[index + 1] },
            ]);
          }, delay);
        }
      });
    }, delayBeforeShortestPath);
  };

  const handleVertexClick = (vertex: Vertex) => {
    if (!startVertex) {
      setStartVertex(vertex);
    } else if (!endVertex && vertex !== startVertex) {
      setEndVertex(vertex);
    } else {
      setStartVertex(vertex);
      setEndVertex(null);
      setVisitedEdges([]);
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
          <div className="flex items-center justify-center rounded-lg border border-blue-200 text-xs text-white shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_2px_#4bf,0_0_8px_#4bf,0_0_8px_#4bf]">
            <button
              onClick={() => setDensity(0.3)}
              className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-white/30`}
              style={{
                background: density === 0.3 ? "rgba(255, 255, 255, 0.3)" : "",
              }}
            >
              Sparse
            </button>
            <button
              onClick={() => setDensity(0.5)}
              className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-white/30`}
              style={{
                background: density === 0.5 ? "rgba(255, 255, 255, 0.3)" : "",
              }}
            >
              Normal
            </button>
            <button
              onClick={() => setDensity(0.7)}
              className={`px-2 py-1 transition-colors duration-200 ease-in-out hover:bg-white/30`}
              style={{
                background: density === 0.7 ? "rgba(255, 255, 255, 0.3)" : "",
              }}
            >
              Dense
            </button>
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
        // className="border border-red-500"
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

        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, staggerChildren: 2 }}
        >
          {/* Render visited edges */}
          {visitedEdges.map((edge, i) => (
            <motion.line
              key={`visited-${i}`}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              className={"stroke-sky-700"}
              strokeWidth={1}
              filter={"url(#glow)"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}

          {/* Render shortest path edges */}
          {shortestPathEdges.map((edge, i) => (
            <motion.line
              key={`shortest-${i}`}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              className="stroke-sky-500"
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
          ))}
        </motion.svg>

        {vertices.map((vertex, i) => (
          <circle
            key={i}
            cx={vertex.x}
            cy={vertex.y}
            r={startVertex === vertex ? 6 : endVertex === vertex ? 6 : 4}
            onClick={() => handleVertexClick(vertex)}
            className={`cursor-pointer fill-white ${startVertex === vertex ? "fill-white" : endVertex === vertex ? "fill-white" : "fill-neutral-400"} stroke-2`}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
};

export default Grid;
