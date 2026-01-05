"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Corrected Imports
import BlurText from "@/components/ui/react-bits/BlurText";
import TiltedCard from "@/components/ui/react-bits/TiltedCard";
import LightRays from "@/components/ui/react-bits/LightRays";

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-40 pb-32 bg-black">
      {/* 1. BACKGROUND: Dual Light Rays */}
      <div className="absolute inset-0 z-0">
        {/* Left Ray - Cyan */}
        <LightRays
          raysOrigin="top-center"
          raysColor="#8b5cf6"
          raysSpeed={1.5}
          lightSpread={1}
          rayLength={2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
          fadeDistance={2}
        />

        {/* Radial Fade to blend grid into black edges */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 px-4 w-full max-w-6xl">
        {/* Version Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 backdrop-blur-xl shadow-lg shadow-cyan-500/20"
        >
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse shadow-lg shadow-cyan-400/50"></span>
          <span className="font-semibold">v1.0 Now Live</span>
        </motion.div>

        {/* HEADLINE */}
        <div className="space-y-0 leading-none">
          {/* NOTE: We use solid colors (text-cyan-400) instead of bg-clip-text 
             because 'BlurText' splits words into spans, which breaks gradients.
          */}
          <BlurText
            text="TIME IS"
            className="text-7xl md:text-[10rem] font-black tracking-tighter text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            delay={50}
            animateBy="letters"
            direction="top"
          />
          <div className="h-4 md:h-8" /> {/* Small spacer between lines */}
          <BlurText
            text="MONEY."
            className="text-7xl md:text-[10rem] font-black tracking-tighter text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            delay={50}
            animateBy="letters"
            direction="bottom"
          />
        </div>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light pt-6"
        >
          The <span className="text-white font-semibold">operating system</span>{" "}
          for high-performance freelancers.
          <br className="hidden md:block" />
          Track time, invoice clients, and analyze profit{" "}
          <span className="text-cyan-400">without the chaos</span>.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 px-10 text-lg rounded-full bg-linear-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30 font-semibold border-0"
            >
              Start for Free
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="ghost"
              size="lg"
              className="h-14 px-8 rounded-full text-lg group text-gray-300 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
            >
              Login{" "}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* 3. HERO ASSET: Tilted Card */}
        {/* Increased 'mt-32' to push it down further from the buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="relative mt-32 w-full flex justify-center"
        >
          <div className="relative z-20">
            <TiltedCard
              imageSrc="/landing/hero-timer.png" // Updated to .png
              altText="FreelanceFlow Timer Interface"
              captionText="Live Activity Tracking"
              containerHeight="500px"
              containerWidth="900px"
              imageHeight="500px"
              imageWidth="900px"
              rotateAmplitude={12}
              scaleOnHover={1.05}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              overlayContent={
                <div className="absolute bottom-8 left-8 p-5 bg-black/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 text-white shadow-2xl shadow-cyan-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></span>
                    <p className="font-bold text-xl">Active Session</p>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">
                    Jarvis UI Update •{" "}
                    <span className="text-cyan-400">01:23:45</span>
                  </p>
                </div>
              }
            />
          </div>

          {/* Glow Effect Behind Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-150 bg-linear-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </motion.div>
      </div>

      {/* Bottom fade for smooth section transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
