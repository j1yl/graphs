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

  useEffect(() => {
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

    const verts = initVertices();
    setVertices(verts);
    setEdges(connectVertices(verts));
  }, [width, height]);

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

    const delayBeforeShortestPath = visitedEdges.length * 50;
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

  const connectVertices = (
    vertices: Vertex[],
  ): { from: Vertex; to: Vertex; weight: number }[] => {
    let conns: { from: Vertex; to: Vertex; weight: number }[] = [];
    const maxConnectionsPerVertex = 4; // max connects per vertex
    const distanceThreshold = Math.min(width, height) * 0.5; // graph density

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
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      width={width}
      height={height}
      className="grid"
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
            className={"stroke-teal-700"}
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
            className="stroke-teal-500"
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
  );
};

export default Grid;
