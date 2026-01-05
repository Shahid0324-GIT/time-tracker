"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useCheckAuth } from "@/lib/hooks/useRequireAuth";
import Image from "next/image";
import { navLinks } from "@/lib/utils/constants";

export function LandingNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isLoading } = useCheckAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = isScrolled;
    if (latest > 50 && !previous) {
      setIsScrolled(true);
    } else if (latest <= 50 && previous) {
      setIsScrolled(false);
    }
  });

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
      <motion.nav
        initial={{
          width: "100%",
          borderRadius: "0px",
          backgroundColor: "rgba(0,0,0,0)",
          border: "1px solid transparent",
        }}
        animate={{
          width: isScrolled ? "auto" : "100%",
          maxWidth: isScrolled ? "800px" : "1280px",
          borderRadius: isScrolled ? "9999px" : "0px",
          backgroundColor: isScrolled
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(0, 0, 0, 0)",
          borderColor: isScrolled ? "rgba(255, 255, 255, 0.1)" : "transparent",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`pointer-events-auto flex items-center justify-between px-6 py-3 backdrop-blur-md transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_0_20px_rgba(34,211,238,0.1)] border border-white/10"
            : ""
        }`}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Image
              height={48}
              width={48}
              src={"/logo.svg"}
              alt="Logo"
              className="rounded-xl"
            />
          </div>
          <span
            className={`font-bold text-lg tracking-tight text-white ${
              isScrolled ? "hidden md:block" : "block"
            }`}
          >
            TimeTracker
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-purple-500/20 cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* AUTH ACTIONS */}
        <div className="flex items-center gap-4 ml-8">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className={`rounded-full font-semibold transition-all ${
                        isScrolled
                          ? "bg-linear-to-r from-cyan-500 to-purple-600 hover:scale-105 shadow-lg shadow-purple-500/20 text-white border-0"
                          : "bg-white text-black hover:bg-gray-200"
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* GRADIENT BORDER (Visible only when scrolled) */}
        {isScrolled && (
          <div className="absolute inset-0 rounded-full p-px -z-10 bg-linear-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 mask-gradient" />
        )}
      </motion.nav>
    </div>
  );
}
