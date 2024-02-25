import { Vertex } from "@/lib/Vertex";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type Props = {
  width: number;
  height: number;
  amount: number;
};

export default function Hero({ width, height, amount }: Props) {
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<
    { from: Vertex; to: Vertex; weight: number }[]
  >([]);

  const initVertices = (): Vertex[] => {
    let verts = [new Vertex(width / 2, height / 2)];
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

    setVertices(verts);

    return verts;
  };

  const connectVertices = (
    vertices: Vertex[],
  ): { from: Vertex; to: Vertex; weight: number }[] => {
    let conns: { from: Vertex; to: Vertex; weight: number }[] = [];
    const maxConnectionsPerVertex = 4; // max connects per vertex
    const distanceThreshold = Math.min(width, height) * 0.7; // graph density (0.5 default)

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
    setEdges(connectVertices(verts));
  }, [width, height]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="flex flex-col items-center justify-center gap-2"
      >
        <h1 className="text-center font-bold uppercase">What are graphs?</h1>
        <p className="text-sm text-neutral-400">
          A{" "}
          <Link
            href="https://fullyhacks.acmcsuf.com/"
            target="_blank"
            referrerPolicy="no-referrer"
            className="underline hover:no-underline"
          >
            hackathon
          </Link>{" "}
          project by{" "}
          <Link
            href="https://www.joelee.info"
            target="_blank"
            referrerPolicy="no-referrer"
            className="underline hover:no-underline"
          >
            Joe Lee
          </Link>{" "}
          @{" "}
          <Link
            href="https://www.webverry.com"
            target="_blank"
            referrerPolicy="no-referrer"
            className="underline hover:no-underline"
          >
            Webverry
          </Link>
        </p>
      </motion.div>
      <svg width={width} height={height}>
        {edges.map((edge, i) => (
          <motion.line
            key={i}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            strokeWidth="1"
            className={`${edge.weight < 250 ? "stroke-pink-400" : "stroke-violet-400"} opacity-35`}
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.3, delay: i * 0.005 }} // Adjust delay as needed
          />
        ))}
        {vertices.map((vertex, i) => (
          <motion.circle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            key={i}
            cx={vertex.x}
            cy={vertex.y}
            r={4}
            className="fill-white"
          />
        ))}
      </svg>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
      >
        <KeyboardArrowDownIcon className="h-6 w-6 animate-bounce text-neutral-400" />
      </motion.div>
    </div>
  );
}
