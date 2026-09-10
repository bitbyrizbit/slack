import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodyFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// We can just reuse Playfair Display for the signature or use it directly inline
const signatureFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-signature",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Slack - Effortless Travel",
  description: "Experience effortless journeys and perfectly orchestrated itineraries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} ${signatureFont.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-[var(--border)]">
        <ErrorBoundary>
          <AuthGuard>{children}</AuthGuard>
        </ErrorBoundary>
      </body>
    </html>
  );
}
