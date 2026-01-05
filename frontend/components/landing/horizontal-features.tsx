"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { X } from "lucide-react";
import { Feature, features } from "@/lib/utils/constants";
import FeatureSlide from "./feature-slide";

export default function HorizontalFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const x = useTransform(
    smoothProgress,
    [0, 1],
    ["0vw", `-${(features.length - 1) * 100}vw`]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.round(latest * (features.length - 1));
    if (index !== activeIndex) setActiveIndex(index);
  });

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedFeature(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-black"
      style={{ height: `${features.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-40 pointer-events-none">
          <motion.div
            className="h-full bg-linear-to-r from-cyan-500 via-purple-500 to-green-500"
            style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
          />
        </div>

        {/* Track */}
        <motion.div style={{ x }} className="flex h-full will-change-transform">
          {features.map((feature, index) => (
            <FeatureSlide
              key={feature.id}
              feature={feature}
              index={index}
              total={features.length}
              progress={smoothProgress}
              onSelect={setSelectedFeature}
            />
          ))}
        </motion.div>

        {/* Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex gap-4 items-center bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                activeIndex === index ? "w-8 bg-white" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* --- IMAGE MODAL --- */}
        <AnimatePresence>
          {selectedFeature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 cursor-zoom-out"
            >
              <div
                className="relative w-full max-w-5xl aspect-video"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  layoutId={`feature-image-${selectedFeature.id}`}
                  className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                >
                  <Image
                    src={selectedFeature.image}
                    alt={selectedFeature.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="absolute -top-4 -right-4 md:-right-10 md:top-0 p-2 text-white/50 hover:text-white transition-colors bg-black/50 rounded-full md:bg-transparent"
                >
                  <X size={32} />
                </button>

                {/* Caption (Optional) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-16 left-0 text-white"
                >
                  <h3 className="text-2xl font-bold">
                    {selectedFeature.title}
                  </h3>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
