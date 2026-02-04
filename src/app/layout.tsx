import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TubeDigest - AI Video Summaries",
    template: "%s | TubeDigest",
  },
  description:
    "Transform YouTube videos into actionable knowledge with AI-powered summaries, interactive mind maps, and full-text search.",
  keywords: ["YouTube", "AI", "summaries", "video", "mind maps", "knowledge"],
  authors: [{ name: "TubeDigest" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "TubeDigest",
    title: "TubeDigest - AI Video Summaries",
    description:
      "Transform YouTube videos into actionable knowledge with AI-powered summaries.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TubeDigest - AI Video Summaries",
    description:
      "Transform YouTube videos into actionable knowledge with AI-powered summaries.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
