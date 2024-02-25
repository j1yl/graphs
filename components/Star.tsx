import { Vertex } from "@/lib/Vertex";
import React, { RefObject } from "react";

type Props = {
  x: number;
  y: number;
  nodeRef: RefObject<HTMLDivElement>;
  vertex: Vertex;
};

export default function Star({ x, y, nodeRef, vertex }: Props) {
  return <div data-x={x} data-y={y} className="h-2 w-2 rounded-xl bg-white" />;
}
