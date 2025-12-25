import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/Providers/providers";
import { Toaster } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Time Tracker - Track your time, invoice your clients",
  description: "Professional time tracking and invoicing application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
