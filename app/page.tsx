"use client";

import Grid from "@/components/Grid";
import NorthernLights from "@/components/NorthernLights";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false); // [1
  const [width, setWidth] = useState(960);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth * 0.6);
    setIsMobile(window.innerWidth < 700 ? true : false);

    if (isMobile) {
      setWidth(window.innerWidth * 0.9);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  });

  return (
    <section>
      <div className="relative flex min-h-screen items-center justify-center">
        {/* <NorthernLights /> */}
      </div>
      <div className="relative flex min-h-screen items-center justify-center">
        <Grid
          width={width}
          height={(width * 9) / 16}
          amount={isMobile ? 4 : 16}
        />
      </div>
    </section>
  );
}
