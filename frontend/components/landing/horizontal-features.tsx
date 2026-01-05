"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

// Define the Feature type for better TS support
type Feature = {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
};

const features: Feature[] = [
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

// --- SUB-COMPONENT FOR SLIDES ---
const FeatureSlide = ({
  feature,
  index,
  total,
  progress,
  onSelect,
}: {
  feature: Feature;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onSelect: (feature: Feature) => void;
}) => {
  const step = 1 / (total - 1);
  const start = step * (index - 1);
  const end = step * (index + 1);

  // Parallax: Shift image slightly right while container moves left
  const parallaxX = useTransform(progress, [start, end], ["-250px", "250px"]);
  const textOpacity = useTransform(
    progress,
    [start, step * index, end],
    [0, 1, 0]
  );

  return (
    <div className="w-screen h-screen shrink-0 flex items-center justify-center px-6 md:px-12 lg:px-20 relative overflow-hidden bg-black">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-450 z-10 relative">
        {/* Text Side */}
        <motion.div
          className="lg:col-span-5 order-2 lg:order-1 space-y-8 pointer-events-none md:pointer-events-auto"
          style={{ opacity: textOpacity }}
        >
          <div
            className={`text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-br ${feature.color} opacity-20`}
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
            <Link href="/register" className="font-medium text-lg">
              Get Started
            </Link>
            <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Image Side */}
        <div className="lg:col-span-7 order-1 lg:order-2 relative w-full group">
          <div
            className={`absolute -inset-10 bg-linear-to-r ${feature.color} blur-[120px] opacity-10 group-hover:opacity-25 transition-opacity duration-700`}
          />

          <div className="relative rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-2xl overflow-hidden shadow-2xl aspect-16/10">
            <motion.div
              className="absolute inset-0 w-full h-full cursor-zoom-in"
              style={{ x: parallaxX, scale: 1.1 }}
              onClick={() => onSelect(feature)}
              layoutId={`feature-image-${feature.id}`}
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={index === 0}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
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
