import type { Metadata } from "next";
import { SmoothScroll } from "@/components/landing/smooth-scroll";
import "@/app/globals.css";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ThemeProvider } from "next-themes";

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SmoothScroll>
        <LandingNavbar />
        <main className="relative min-h-screen w-full  bg-gray-50 dark:bg-black">
          {children}
        </main>
      </SmoothScroll>
    </ThemeProvider>
  );
}
