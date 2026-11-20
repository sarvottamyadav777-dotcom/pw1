import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Elite Study with SachinCoderX — Learning Platform",
  description:
    "Open your study dashboard, explore Physics Wallah batches, watch lectures and view or download study notes.",
  keywords: [
    "Elite Study",
    "study platform",
    "lectures",
    "notes",
    "JEE",
    "NEET",
    "batches",
    "video player",
  ],
  authors: [{ name: "Elite Study with SachinCoderX" }],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Elite Study with SachinCoderX — Learning Platform",
    description: "A focused place to learn, practice and grow with Elite Study.",
    siteName: "Elite Study",
    type: "website",
    images: ["/elite-study-logo.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Study",
    description: "A focused place to learn, practice and grow with Elite Study.",
    images: ["/elite-study-logo.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8faff",
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
      <head>
        {/* Loaded as a stylesheet: next/font/google fails under Turbopack builds. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="elite-study-theme">
          <div className="sb-aurora" aria-hidden="true" />
          <div className="sb-grain" aria-hidden="true" />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
