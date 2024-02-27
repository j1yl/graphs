"use client";

import Accordion from "@/components/Accordion";
import Grid from "@/components/Grid";
import CodeIcon from "@mui/icons-material/Code";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Hero from "@/components/Hero";
import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const [width, setWidth] = useState(960);

  const handleWindowSizeChange = () => {
    const currentWidth = window.innerWidth;
    setIsMobile(currentWidth < 700);
    setWidth(currentWidth * (currentWidth < 700 ? 0.9 : 0.6));
  };

  useEffect(() => {
    handleWindowSizeChange(); // Call on mount to set initial size
    window.addEventListener("resize", handleWindowSizeChange);

    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  return (
    <section>
      <motion.span
        style={{
          scaleX: scrollYProgress,
        }}
        className="pointer-events-none fixed left-0 top-0 z-40 h-1 w-full origin-left bg-white"
      />
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="absolute right-0 top-0 mr-4 mt-4 flex justify-center gap-2">
          <Link
            className="aspect-square h-8 w-8 rounded p-2 transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-white/20"
            target="_blank"
            title="View 24h hackathon branch"
            referrerPolicy="no-referrer"
            href="https://github.com/j1yl/graphs/tree/hackathon-archive"
          >
            <span className="sr-only">View hackathon branch</span>
            <AccessTimeIcon className="h-4 w-4" />
          </Link>
          <Link
            className="aspect-square h-8 w-8 rounded p-2 transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-white/20"
            target="_blank"
            title="View source code"
            referrerPolicy="no-referrer"
            href="https://github.com/j1yl/graphs"
          >
            <span className="sr-only">Source code</span>
            <CodeIcon className="h-4 w-4" />
          </Link>
        </div>
        <Hero
          width={width}
          height={(width * 9) / 16}
          amount={isMobile ? 16 : 48}
        />
      </div>
      <div className="relative mx-auto flex flex-col items-center justify-center gap-4 px-4 py-16 md:max-w-2xl md:py-32">
        <Accordion
          expanded
          question="What is a graph in computer science and what are its components?"
        >
          <div>
            In computer science, a graph is a data structure that represents a
            set of objects (vertices or nodes) connected by links (edges or
            arcs). <br />
            <br />
            Graphs are used to model pairwise relations between objects. A
            graph&apos;s main components are:
            <ul className="ml-4 list-disc">
              <li>
                <span className="text-sky-400">Vertices (Nodes)</span>: The
                entities in a graph.
              </li>
              <li>
                <span className="text-violet-400">Edges (Links)</span>: The
                connections between the vertices.
              </li>
            </ul>
            <br />
            Edges can be <span className="text-pink-400">directed</span>{" "}
            (indicating a one-way relationship) or
            <span className="text-pink-400"> undirected</span> (indicating a
            two-way relationship).
            <br />
            <br />
            Graphs are widely used in various computer science domains like
            social networks, computer networks, and transportation systems,
            among others.
          </div>
        </Accordion>
        <Accordion question="Can you explain the different types of graphs?">
          <p>
            Yes, graphs can be categorized into several types based on their
            properties:
          </p>
          <ul className="ml-4 list-disc">
            <li>
              <span className="text-sky-400">Undirected Graphs</span>: Graphs
              where edges have no direction. The edges imply a two-way
              relationship, meaning if vertex <i>A</i> is connected to vertex{" "}
              <i> B</i>, vertex
              <i> B</i> is also connected to vertex <i>A</i>.
            </li>
            <li>
              <span className="text-violet-400">
                Directed Graphs (Digraphs)
              </span>
              : Graphs where edges have a direction. Each edge moves from one
              vertex to another, not necessarily in both directions.
            </li>
            <li>
              <span className="text-pink-400">Weighted Graphs</span>: Graphs
              where edges have weights or costs associated with them,
              representing the cost of moving from one vertex to another.
            </li>
            <li>
              <span className="text-yellow-400">Unweighted Graphs</span>: Graphs
              where edges have no weights.
            </li>

            <li>
              <span className="text-green-400">Cyclic Graphs</span>: Graphs that
              contain cycles (a path that starts and ends at the same vertex).
            </li>
            <li>
              <span className="text-blue-400">Acyclic Graphs</span>: Graphs with
              no cycles. A special case of acyclic graphs is a Tree, where there
              is exactly one path between any two vertices.
            </li>
          </ul>
        </Accordion>
        <Accordion question="What defines a cycle in a graph?">
          <div>
            A <span className="text-blue-400">cycle</span> in a graph is a path
            of edges and vertices wherein a vertex is reachable from itself
            through a sequence of edges, with the stipulations that no edge is
            repeated and at least one edge is used.
            <br />
            <br />
            In simpler terms, if you can start at a vertex,{" "}
            <span className="text-green-400">
              travel along the graph&apos;s edges, and return to the starting
              vertex without traversing any edge more than once
            </span>
            , you&apos;ve completed a cycle. <br />
            <br />
            Cycles are pertinent in directed graphs (where they are called
            directed cycles) and undirected graphs alike.
          </div>
        </Accordion>
        <Accordion question="What is the purpose of graph algorithms, and how do they work?">
          <div>
            Graph algorithms are a set of instructions or rules designed to
            solve problems related to graphs, such as searching for the shortest
            path between two nodes, finding the minimum spanning tree, or
            detecting cycles within the graph.
            <br />
            <br />
            These algorithms work by systematically exploring the vertices and
            edges of the graph, usually starting from a specific node, to find
            the solution to the problem at hand.
            <br />
            <br />
            Common graph algorithms include{" "}
            <span className="text-green-400">Dijkstra&apos;s</span> algorithm
            for shortest paths,{" "}
            <span className="text-pink-400">Kruskal&apos;s</span> or{" "}
            <span className="text-yellow-400">Prim&apos;s</span> algorithm for
            minimum spanning trees, and{" "}
            <span className="text-blue-400">
              Depth-First Search (DFS) or Breadth-First Search (BFS)
            </span>{" "}
            for graph traversal.
          </div>
        </Accordion>
        <Accordion question="What are some practical applications of graphs in real life?">
          <div>
            Graphs have a wide array of practical applications across different
            fields:
            <ul className="ml-4 list-disc">
              <li>
                <span className="text-green-400">Social Networks</span>:
                Modeling users as vertices and their relationships as edges.
              </li>
              <li>
                <span className="text-pink-400">Internet and Web Pages</span>:
                Representing web pages as vertices and links between them as
                edges.
              </li>
              <li>
                <span className="text-yellow-400">Transportation Networks</span>
                : Mapping locations as vertices and routes between them as
                edges.
              </li>
              <li>
                <span className="text-red-400">Biological Networks</span>:
                Modeling biological systems, like neural networks or ecological
                food webs.
              </li>
              <li>
                <span className="text-blue-400">Computer Networks</span>:
                Designing and analyzing computer networks, with devices as
                vertices and connections as edges.
              </li>
            </ul>
          </div>
        </Accordion>
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <Grid width={width} height={(width * 9) / 16} mobile={isMobile} />
      </div>
      <div className="relative flex items-center justify-center py-4 md:py-8">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Joe L. Lee. All rights reserved.
        </p>
      </div>
    </section>
  );
}
