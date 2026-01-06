"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BlurText from "../ui/react-bits/BlurText";

export function CTASection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Divide by 20 to make the movement subtle (magnetic feel)
    setMousePosition({ x: x / 20, y: y / 20 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden py-20"
    >
      {/* Background radial gradient that moves with mouse - light mode */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out opacity-40 dark:hidden"
        style={{
          background: `radial-gradient(800px circle at ${
            50 + mousePosition.x * 2
          }% ${
            50 + mousePosition.y * 2
          }%, rgba(34, 211, 238, 0.05), transparent 40%)`,
        }}
      />

      {/* Background radial gradient that moves with mouse - dark mode */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-200 ease-out opacity-40 hidden dark:block"
        style={{
          background: `radial-gradient(800px circle at ${
            50 + mousePosition.x * 2
          }% ${
            50 + mousePosition.y * 2
          }%, rgba(34, 211, 238, 0.15), transparent 40%)`,
        }}
      />

      <div className="relative z-10 text-center space-y-8 px-4">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-black dark:text-white">
          Ready to take <br />
          <div className="text-center flex gap-2 justify-center">
            <BlurText
              text="Control?"
              className="text-cyan-600 dark:text-cyan-400"
              delay={200}
              animateBy="letters"
              direction="top"
            />
          </div>
        </h2>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Join thousands of high-performance freelancers who have stopped
          guessing and started tracking.
        </p>

        <motion.div
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="pt-8"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="h-20 px-12 text-2xl rounded-full 
              bg-black text-white hover:bg-cyan-950 shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_80px_rgba(34,211,238,0.3)] 
              dark:bg-white dark:text-black dark:hover:bg-cyan-50 dark:shadow-[0_0_50px_rgba(255,255,255,0.3)] dark:hover:shadow-[0_0_80px_rgba(34,211,238,0.5)] 
              hover:scale-105 transition-all"
            >
              Start Tracking Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
