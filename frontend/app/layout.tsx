import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/Providers/providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Freelance Flow- Track your time, invoice your clients",
  description: "Professional time tracking and invoicing application",
  generator: "v0.app",
  openGraph: {
    title: "Freelance Flow- Track your time, invoice your clients",
    description: "Professional time tracking and invoicing application",
    images: [
      {
        url: "https://ogcdn.net/904e879f-a9bb-4c56-9362-06e6c8fe3ac6/v5/https%3A%2F%2Fopengraph.b-cdn.net%2Fproduction%2Fimages%2Fe76f52ee-2b7d-40bd-9cd2-ec80432b5a2e.png%3Ftoken%3DQxvW8fQaSdGmLLuaROQ8HcmN6rZKd_hwCDL2BZKN9b0%26height%3D555%26width%3D1200%26expires%3D33304062235/og.png",
        width: 1200,
        height: 630,
        alt: "Freelance Flow- Professional time tracking and invoicing",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Flow- Track your time, invoice your clients",
    description: "Professional time tracking and invoicing application",
  },
  icons: {
    icon: [
      {
        url: "/favicon-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors`}
      >
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
