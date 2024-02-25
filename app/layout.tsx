import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";

const poppins = Overpass({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "What are graphs?",
  description: "A web page that explains what graphs are with a visualizer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} leading-none tracking-wide text-white`}
      >
        {children}
      </body>
    </html>
  );
}
