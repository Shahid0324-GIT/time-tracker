"use client";

import { HeroSection } from "@/components/landing/hero-section";
import HorizontalFeatures from "@/components/landing/horizontal-features";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full bg-black overflow-x-clip">
      <HeroSection />

      {/* 2. Exploded Dashboard View */}
      <HorizontalFeatures />

      {/* Spacer for next sections */}
      <div className="h-screen bg-black flex items-center justify-center">
        <h2 className="text-white text-3xl">Next: Bento Grid...</h2>
      </div>
    </div>
  );
}
