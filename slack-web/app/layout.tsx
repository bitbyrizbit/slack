import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, La_Belle_Aurore } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bodyFont = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const signatureFont = La_Belle_Aurore({
  subsets: ["latin"],
  variable: "--font-signature",
  weight: "400",
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
