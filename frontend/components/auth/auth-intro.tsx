"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Receipt, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function AuthIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Title Animation
      tl.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.2,
      })
        // Description Animation
        .from(
          descRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6"
        )
        // Cards Animation (Staggered)
        .from(
          ".feature-card",
          {
            x: -50,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            clearProps: "all", // Allows hover effects to work properly after animation
          },
          "-=0.4"
        );

      gsap.to(".floating-icon", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          from: "random",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Smart Time Tracking",
      desc: "Effortless timers & manual logging",
    },
    {
      icon: (
        <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      ),
      title: "Instant Invoicing",
      desc: "Turn hours into paid invoices",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: "Revenue Analytics",
      desc: "Visualize your growth in real-time",
    },
  ];

  return (
    <div ref={containerRef} className="relative z-10 w-full max-w-lg">
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-8">
            <h1
              ref={titleRef}
              className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
            >
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Productivity
              </span>
            </h1>
            <p
              ref={descRef}
              className="text-lg text-slate-700 dark:text-slate-300 font-medium leading-relaxed"
            >
              The professional&apos;s choice for tracking time, managing
              projects, and getting paid faster.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card flex items-center gap-4 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 p-4 rounded-xl border border-white/40 dark:border-white/5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default"
              >
                <div className="p-3 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200/30 dark:border-white/10 flex items-center gap-2 feature-card">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Free templates & invoicing guides included
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
