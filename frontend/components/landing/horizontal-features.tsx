"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Command Center",
    description: "Your entire freelance business at a glance...",
    image: "/landing/feature-overview.png",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: 2,
    title: "Project Workflow",
    description: "Manage clients and projects without the clutter...",
    image: "/landing/feature-projects.png",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "Get Paid Faster",
    description: "Turn tracked hours into professional invoices...",
    image: "/landing/feature-invoices.png",
    color: "from-green-500 to-emerald-500",
  },
];

export default function HorizontalFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // FIX: Use 'vw' instead of '%' to avoid math errors with the wide container.
  // If we have 3 items, we want to shift -200vw (shift 2 screens to the left)
  const x = useTransform(
    smoothProgress,
    [0, 1],
    ["0vw", `-${(features.length - 1) * 100}vw`]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.round(latest * (features.length - 1));
    if (index !== activeIndex) setActiveIndex(index);
  });

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      // Height controls the speed. 300vh = 3 screens worth of scrolling.
      style={{ height: `${features.length * 100}vh` }}
    >
      {/* STICKY PARENT:
        This 'top-0' is what creates the pinning effect.
        If this doesn't stick, check your global CSS for overflow:hidden on parent tags.
      */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-50 pointer-events-none">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500"
            style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
          />
        </div>

        {/* Progress Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-4 items-center bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                activeIndex === index ? "w-8 bg-white" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Horizontal Track */}
        <motion.div style={{ x }} className="flex h-full will-change-transform">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="w-screen h-screen flex-shrink-0 flex items-center justify-center px-6 md:px-12 lg:px-20 relative overflow-hidden bg-black"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-[1800px] z-10 relative">
                {/* Text Side */}
                <div className="lg:col-span-5 order-2 lg:order-1 space-y-8">
                  <div
                    className={`text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br ${feature.color} opacity-20`}
                  >
                    0{feature.id}
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                      {feature.title}
                    </h2>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-lg">
                      {feature.description}
                    </p>
                  </div>
                  <button className="flex items-center text-white/80 group cursor-pointer w-fit py-2">
                    <span className="text-lg mr-2 font-medium">
                      Explore feature
                    </span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </button>
                </div>

                {/* Image Side */}
                <div className="lg:col-span-7 order-1 lg:order-2 relative w-full group">
                  <div
                    className={`absolute -inset-10 bg-gradient-to-r ${feature.color} blur-[120px] opacity-10 group-hover:opacity-25 transition-opacity duration-700`}
                  />
                  <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={1600}
                      height={1000}
                      className="w-full h-auto object-cover"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
