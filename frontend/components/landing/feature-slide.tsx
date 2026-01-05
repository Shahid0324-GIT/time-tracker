import { Feature } from "@/lib/utils/constants";
import { MotionValue, useTransform, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- SUB-COMPONENT FOR SLIDES ---

export default function FeatureSlide({
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
}) {
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
    <section
      id="features"
      className="w-screen h-screen shrink-0 flex items-center justify-center px-6 md:px-12 lg:px-20 relative overflow-hidden bg-black scroll-mt-28"
    >
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
    </section>
  );
}
