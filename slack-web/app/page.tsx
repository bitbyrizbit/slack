"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowRight,
  GitBranch,
  ShieldAlert,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { HelpModal } from "@/components/HelpModal";
import { seedDemoTrip, loginUser } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthed(true);
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      if (!isAuthenticated()) {
        await loginUser("owner@demo.com", "demo1234");
      }
      const res = await seedDemoTrip(true);
      router.push(`/trips/${res.trip.id}`);
    } catch (err) {
      console.error("Failed to load demo trip:", err);
      // Fallback navigation to dashboard if authenticated
      router.push("/dashboard");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--border)]">
      {/* Top Navigation */}
      <header className="border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-50 px-8 py-5">
        <div className="flex items-center justify-between w-full">
          {/* Left Elements */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 transform -rotate-3 relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-[#18181A] h-full"></div>
                <div className="w-1/2 bg-[var(--accent)] h-full"></div>
              </div>
              <span className="relative font-[family-name:var(--font-signature)] text-4xl font-normal text-[var(--foreground)] z-10 px-4 py-1 pb-2">
                Slack
              </span>
            </div>
            <span className="hidden sm:inline text-sm text-[var(--muted-foreground)] tracking-wide font-medium ml-2">
              Your Ultimate Travel Assistant
            </span>
          </div>

          {/* Right Elements */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              How it works
            </button>
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-6 py-2.5 rounded-full text-sm font-semibold text-[#18181A] hover:bg-[#D5B98A] transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 pt-20 pb-20 sm:pt-32 sm:pb-28">
        <div className="w-full max-w-5xl text-left">
          <div className="inline-flex items-center gap-2 border border-[var(--border-strong)] bg-[var(--card)] px-4 py-2 mb-8 rounded-full shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="text-xs font-semibold tracking-wider text-[var(--muted-foreground)]">
              Intelligent Travel Assistant
            </span>
          </div>

          <h1 className="font-serif-heading text-5xl sm:text-7xl font-normal tracking-tight text-[var(--foreground)] leading-[1.1]">
            A trip is a chain of connections, <br className="hidden sm:inline" />
            <span className="text-[var(--accent)] italic">not a flat list of dates</span>.
          </h1>

          <p className="mt-8 max-w-2xl text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed font-light">
            Calendar apps show dates in isolation. Slack tracks how your bookings actually connect - your transfer depends on your flight landing on time, and your hotel check-in depends on the transfer. When delays strike, we detect the ripple effect early and generate immediate alternative options before connections break.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-start gap-4">
            <button
              id="hero-try-demo-button"
              onClick={handleLoadDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-2 border border-[var(--foreground)] bg-[var(--foreground)] px-8 py-4 rounded-full text-sm font-semibold text-[#18181A] hover:bg-[var(--accent)] hover:border-[var(--accent)] shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer disabled:opacity-50"
            >
              <span>{isDemoLoading ? "Opening Demo Trip..." : "Try a Demo"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              id="hero-create-account-button"
              href="/signup"
              className="flex items-center gap-2 border border-[var(--border-strong)] bg-transparent px-8 py-4 rounded-full text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--card)] transition-all"
            >
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Visual Concept Breakdown */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] px-8 py-20 sm:py-32">
        <div className="w-full max-w-5xl">
          <div className="text-left max-w-2xl mb-16">
            <h2 className="font-serif-heading text-4xl sm:text-5xl font-normal text-[var(--foreground)]">
              How Travel Disruption Works
            </h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)] font-light leading-relaxed">
              Traditional itineraries fail because a single delay cascades down the chain. Here is how Slack detects and recovers from disruptions before you travel:
            </p>
          </div>

          {/* Graph Architecture Diagram Cards - Stacked */}
          <div className="flex flex-col gap-12">
            {/* Step 1: Baseline */}
            <div className="flex flex-col md:flex-row border border-[var(--border)] bg-[var(--background)] p-8 rounded-2xl gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold tracking-widest text-[#9EA8A1] bg-[var(--muted)] px-3 py-1 rounded-full border border-[var(--border-strong)]">
                    Step 1
                  </span>
                  <Clock className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="font-serif-heading text-2xl font-normal text-[var(--foreground)]">
                  Positive Connection Buffer
                </h3>
                <p className="mt-3 text-base text-[var(--muted-foreground)] leading-relaxed font-light">
                  Flight LX 354 arrives at 09:30. Shuttle leaves at 10:15. You have a 45-minute gap with a comfortable <strong className="text-[var(--accent)] font-medium">+15 min safety buffer</strong>.
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center border border-[var(--border-strong)] bg-[#1D1F21] p-6 rounded-xl text-sm font-mono relative z-10">
                <div className="flex justify-between items-center text-[var(--foreground)]">
                  <span>Swiss Flight LX 354</span>
                  <span className="text-[10px] text-[var(--accent)] font-bold tracking-wider">On Time</span>
                </div>
                <div className="my-4 border-l-2 border-dashed border-[var(--accent)] pl-4 py-2 text-[var(--muted-foreground)] opacity-80">
                  Buffer: +15m safe window
                </div>
                <div className="flex justify-between items-center text-[var(--foreground)]">
                  <span>Chamonix Shuttle</span>
                  <span className="text-[10px] text-[var(--accent)] font-bold tracking-wider">Connected</span>
                </div>
              </div>
            </div>

            {/* Step 2: Ripple Wave */}
            <div className="flex flex-col md:flex-row border border-[#3A2A2A] bg-[#1E1717] p-8 rounded-2xl gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#B91C1C] opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold tracking-widest text-[#FCA5A5] bg-[#3A1E1E] px-3 py-1 rounded-full border border-[#5C2B2B]">
                    Step 2
                  </span>
                  <AlertTriangle className="h-5 w-5 text-[#FCA5A5]" />
                </div>
                <h3 className="font-serif-heading text-2xl font-normal text-[#FCA5A5]">
                  Anticipating Delays
                </h3>
                <p className="mt-3 text-base text-[#E0A8A8] leading-relaxed font-light">
                  When weather delays your flight, we instantly foresee the impact on your connections.
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center border border-[#5C2B2B] bg-[#2A1D1D] p-6 rounded-xl text-sm font-mono relative z-10">
                <div className="flex justify-between items-center text-[#FCA5A5]">
                  <span>Swiss Flight LX 354</span>
                  <span className="text-[10px] bg-[#5C2B2B] text-white px-2 py-0.5 rounded-sm font-bold tracking-wider">+60m Delay</span>
                </div>
                <div className="my-4 border-l-2 border-dashed border-[#B91C1C] pl-4 py-2 text-[#FCA5A5] font-bold">
                  Alert: Missed Window
                </div>
                <div className="flex justify-between items-center text-[var(--muted-foreground)] line-through opacity-70">
                  <span>Chamonix Shuttle</span>
                  <span className="text-[10px] text-[#FCA5A5] font-bold tracking-wider">Missed</span>
                </div>
              </div>
            </div>

            {/* Step 3: Swift Resolution */}
            <div className="flex flex-col md:flex-row border border-[var(--border)] bg-[var(--background)] p-8 rounded-2xl gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2B5B84] opacity-5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold tracking-widest text-[#BAE6FD] bg-[#1E2E3A] px-3 py-1 rounded-full border border-[#2B5B84]">
                    Step 3
                  </span>
                  <Zap className="h-5 w-5 text-[#BAE6FD]" />
                </div>
                <h3 className="font-serif-heading text-2xl font-normal text-[#BAE6FD]">
                  Automated Resolution
                </h3>
                <p className="mt-3 text-base text-[#9BBACF] leading-relaxed font-light">
                  We automatically evaluate alternatives, keeping your journey on track without the stress.
                </p>
              </div>

              <div className="flex-1 flex flex-col justify-center border border-[#2B5B84] bg-[#1A252E] p-6 rounded-xl text-sm font-mono relative z-10">
                <div className="flex justify-between items-center text-[var(--foreground)] opacity-90">
                  <span>Swiss Flight LX 354</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] tracking-wider">Arrived 10:30</span>
                </div>
                <div className="my-4 border-l-2 border-dashed border-[#2B5B84] pl-4 py-2 text-[#BAE6FD]">
                  Solution: Next Shuttle Booked
                </div>
                <div className="flex justify-between items-center text-[var(--accent)] font-medium">
                  <span>Next Shuttle (11:30)</span>
                  <span className="text-[10px] bg-[#22332A] text-[var(--accent)] px-2 py-0.5 rounded-sm font-bold tracking-wider">Recovered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-8 py-20 sm:py-32">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="border border-[var(--border)] bg-[var(--card)] p-10 rounded-2xl shadow-sm hover:border-[var(--accent)] transition-colors">
              <div className="flex h-12 w-12 items-center justify-center bg-[var(--background)] border border-[var(--border-strong)] rounded-full text-[var(--accent)] mb-6">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="font-serif-heading text-2xl font-normal text-[var(--foreground)]">
                Seamless Connections
              </h3>
              <p className="mt-4 text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-light">
                We monitor every step of your travel, ensuring smooth transitions and flagging any tight schedules.
              </p>
            </div>

            <div className="border border-[var(--border)] bg-[var(--card)] p-10 rounded-2xl shadow-sm hover:border-[var(--accent)] transition-colors">
              <div className="flex h-12 w-12 items-center justify-center bg-[var(--background)] border border-[var(--border-strong)] rounded-full text-[var(--accent)] mb-6">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="font-serif-heading text-2xl font-normal text-[var(--foreground)]">
                Trip Confidence
              </h3>
              <p className="mt-4 text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-light">
                Understand how reliable your plans are with our simple confidence scores, helping you travel without worry.
              </p>
            </div>

            <div className="border border-[var(--border)] bg-[var(--card)] p-10 rounded-2xl shadow-sm hover:border-[var(--accent)] transition-colors md:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex h-12 w-12 items-center justify-center bg-[var(--background)] border border-[var(--border-strong)] rounded-full text-[var(--accent)] flex-shrink-0">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif-heading text-2xl font-normal text-[var(--foreground)]">
                    Travel Together
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-light max-w-2xl">
                    Invite your friends and family to coordinate plans together safely and effortlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--background)] px-8 py-12">
        <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--muted-foreground)] font-light">
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-signature)] text-2xl text-[var(--foreground)]">Slack</span>
            <span>- Effortless Travel</span>
          </div>
          <div>Crafted for seamless journeys</div>
        </div>
      </footer>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
