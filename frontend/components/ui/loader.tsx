"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FreelanceLoader() {
  const [isClock, setIsClock] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsClock((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-10 p-10 text-current">
      {/* 1. Icon Container */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        <AnimatePresence mode="wait">
          {!isClock ? <Spinner key="spinner" /> : <Clock key="clock" />}
        </AnimatePresence>
      </div>

      {/* 2. Text Container */}
      <SequentialText text="FREELANCE FLOW" />
    </div>
  );
}

// --- Sub-Components ---

function Spinner() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-16 w-16"
      initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
      transition={{ duration: 0.4 }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="transparent"
        strokeLinecap="round"
        initial={{ pathLength: 0.2 }}
        animate={{
          pathLength: [0.2, 0.7, 0.2],
          rotate: [0, 360],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="opacity-90"
      />
    </motion.svg>
  );
}

function Clock() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-16 w-16"
      initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
      transition={{ duration: 0.4 }}
    >
      {/* Simple Clock Ring */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="transparent"
      />

      {/* MINUTE HAND 
         Drawn from y=5 (top) to y=12 (center).
         originY: 1 means "Rotate around the bottom of this line" (which is the center)
      */}
      <motion.line
        x1="12"
        y1="5"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        style={{ originX: 0.5, originY: 1 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* HOUR HAND
         Drawn from y=8 (top) to y=12 (center).
      */}
      <motion.line
        x1="12"
        y1="8"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ rotate: 0 }}
        animate={{ rotate: 120 }}
        style={{ originX: 0.5, originY: 1 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.svg>
  );
}

function SequentialText({ text }: { text: string }) {
  const letters = text.split("");

  // -- SPEED CONFIGURATION --
  const STAGGER_DELAY = 0.15;
  const ANIMATION_DURATION = 0.5;
  const TOTAL_CYCLE = letters.length * STAGGER_DELAY;

  return (
    <div className="flex flex-wrap justify-center text-center text-2xl font-black tracking-[0.15em] uppercase sm:text-2xl md:text-3xl md:tracking-[0.3em]">
      {letters.map((letter, index) => {
        const repeatDelay = TOTAL_CYCLE - ANIMATION_DURATION;

        return (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ opacity: 0.3, y: 0 }}
            animate={{
              opacity: [0.3, 1, 0.3],
              y: ["0%", "-15%", "0%"],
            }}
            transition={{
              duration: ANIMATION_DURATION,
              delay: index * STAGGER_DELAY,
              repeat: Infinity,
              repeatDelay: repeatDelay > 0 ? repeatDelay : 0,
              ease: "easeInOut",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        );
      })}
    </div>
  );
}
