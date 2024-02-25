"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicSketch = dynamic(() => import("./Sketch"), {
  ssr: false,
  loading: () => null,
});

export default function NorthernLights() {
  return (
    <div className="absolute left-0 top-0 flex h-full min-h-screen w-full items-center justify-center overflow-hidden">
      <div className="scale-200">
        <DynamicSketch />
      </div>
    </div>
  );
}
