"use client";

import { useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
  SVGMotionProps,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User } from "lucide-react";
import { useCheckAuth } from "@/lib/hooks/useRequireAuth";
import Image from "next/image";
import { navLinks } from "@/lib/utils/constants";
import { ThemeToggle } from "../ui/theme-toggle";
import { useIsMobile } from "@/lib/hooks/use-mobile";

export function LandingNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useCheckAuth();
  const isMobile = useIsMobile();

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
    setIsMobileMenuOpen(false);

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navVariants = {
    initial: {
      width: "100%",
      borderRadius: "0px",
      backgroundColor: "rgba(0,0,0,0)",
      border: "1px solid transparent",
    },
    animate: {
      width: isScrolled ? "auto" : "100%",
      maxWidth: isScrolled ? "800px" : "1280px",
      borderRadius: isScrolled ? "9999px" : "0px",
    },
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-6 px-4 pointer-events-none">
      <motion.nav
        initial="initial"
        animate="animate"
        variants={navVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`pointer-events-auto relative flex items-center justify-between px-6 py-3 backdrop-blur-md transition-all duration-300 z-50 ${
          isScrolled
            ? "bg-black/60 dark:bg-black/60 border border-white/10 dark:border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
            : "bg-transparent"
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
            className={`font-bold text-lg tracking-tight text-white dark:text-white ${
              isScrolled ? "hidden md:block" : "block"
            }`}
          >
            Freelance Flow
          </span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-medium dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="flex items-center gap-4 ml-auto md:ml-8">
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      <LayoutDashboard
                        className={`w-4 h-4 ${isMobile ? "m-0" : "mr-2"}`}
                      />
                      {isMobile ? null : "Dashboard"}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="hidden sm:block text-sm font-medium text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors"
                    >
                      <Button
                        size="sm"
                        className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        <User
                          className={`w-4 h-4 ${isMobile ? "m-0" : "mr-2"}`}
                        />
                        {isMobile ? null : "Login"}
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        size="sm"
                        className={`rounded-full font-semibold transition-all ${
                          isScrolled
                            ? "bg-linear-to-r from-cyan-500 to-purple-600 hover:scale-105 shadow-lg shadow-purple-500/20 text-white border-0"
                            : "bg-white dark:bg-white text-black dark:text-black hover:bg-gray-200 dark:hover:bg-gray-200"
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

          <div className="hidden md:block mx-4">
            <ThemeToggle />
          </div>

          {/* MOBILE HAMBURGER TOGGLE */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="23" height="23" viewBox="0 0 23 23">
              <Path
                variants={{
                  closed: { d: "M 2 2.5 L 20 2.5" },
                  open: { d: "M 3 16.5 L 17 2.5" },
                }}
                animate={isMobileMenuOpen ? "open" : "closed"}
              />
              <Path
                d="M 2 9.423 L 20 9.423"
                variants={{
                  closed: { opacity: 1 },
                  open: { opacity: 0 },
                }}
                transition={{ duration: 0.1 }}
                animate={isMobileMenuOpen ? "open" : "closed"}
              />
              <Path
                variants={{
                  closed: { d: "M 2 16.346 L 20 16.346" },
                  open: { d: "M 3 2.5 L 17 16.346" },
                }}
                animate={isMobileMenuOpen ? "open" : "closed"}
              />
            </svg>
          </button>
        </div>

        {/* GRADIENT BORDER */}
        {isScrolled && (
          <div className="absolute inset-0 rounded-full p-px -z-10 bg-linear-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50" />
        )}
      </motion.nav>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute top-full mt-2 w-full max-w-[90%] md:hidden bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-4 z-40"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScroll(e, link.href)}
                  className="block px-4 py-3 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="h-px bg-white/10 w-full" />

            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-gray-400">Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <User className="w-4 h-4 mr-2" /> Login
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-linear-to-r from-cyan-500 to-purple-600 text-white border-0">
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-white/10 border border-white/10 text-white">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Path = (props: SVGMotionProps<SVGPathElement>) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="currentColor"
    strokeLinecap="round"
    className="text-white dark:text-white"
    {...props}
  />
);
