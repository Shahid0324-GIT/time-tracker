import type { Metadata } from "next";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import "@/app/globals.css";
import { LandingNavbar } from "@/components/landing/landing-navbar";

export const metadata: Metadata = {
  title: "FreelanceFlow - Master Your Time",
  description: "The ultimate time tracking and invoicing tool for freelancers.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <LandingNavbar />
      <main className="relative min-h-screen w-fullbg-white dark:bg-gray-900 transition-colors duration-500">
        {children}
      </main>
    </SmoothScroll>
  );
}
