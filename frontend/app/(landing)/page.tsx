"use client";

import { BentoGrid } from "@/components/landing/bento-grid";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import HorizontalFeatures from "@/components/landing/horizontal-features";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full overflow-x-clip">
      {/* 1. Hero: The Hook */}
      <HeroSection />

      {/* 2. Features: The Tour */}
      <HorizontalFeatures />

      {/* 3. Details: The Specs */}
      <BentoGrid />

      {/* 4. CTA: The Close */}
      <CTASection />

      {/* 5. Footer: The Brand */}
      <Footer />
    </div>
  );
}
