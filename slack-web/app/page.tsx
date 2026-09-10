import Link from "next/link";
import LandingCarousel from "@/components/LandingCarousel";
import { Plane, ShieldCheck, MapPin, Search, Calendar } from "lucide-react";
import SlackLogo from "@/components/SlackLogo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="px-8 py-6 w-full flex items-center justify-between border-b border-[var(--border)] relative z-20 bg-[var(--background)]">
        <div className="flex items-center gap-5">
          <SlackLogo className="scale-110 origin-left" />
          <div className="flex flex-col text-[var(--accent)] text-[10px] uppercase tracking-[0.15em] font-medium opacity-90 font-[family-name:var(--font-body)] border-l border-[var(--border-strong)] pl-4 leading-[1.3]">
            <span>Seamless</span>
            <span>Travel</span>
            <span>Orchestrated</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-full bg-[var(--foreground)] text-[#18181A] text-sm font-semibold hover:bg-[var(--accent)] transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Hero Section with Split Background (Grey and Green) */}
      <section className="relative w-full flex-1 flex flex-col">
        {/* Background Split */}
        <div className="absolute inset-0 flex z-0">
          <div className="w-1/2 bg-[var(--background)] h-full"></div>
          <div className="w-1/2 bg-[#2D3A31] h-full border-l border-[var(--border)]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-8 py-20 sm:py-32 flex-1 gap-12">
          {/* Left Content (Grey bg) */}
          <div className="md:w-[45%] pr-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif-heading font-medium text-[var(--foreground)] leading-[1.1] tracking-tight">
              Flawless <br /> <span className="text-[var(--accent)] italic">Journeys</span>
            </h1>
            <p className="mt-8 text-lg text-[var(--muted-foreground)] font-light leading-relaxed max-w-md">
              Calendar apps show dates in isolation. We connect the dots, ensuring your flights, transfers, and hotels sync beautifully in one living itinerary.
            </p>
            <div className="mt-12 flex items-center gap-6">
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-full bg-[var(--accent)] text-[#18181A] text-sm font-bold hover:bg-[#D5B98A] transition-colors"
              >
                Begin Journey
              </Link>
              <Link
                href="#features"
                className="px-8 py-3.5 rounded-full border border-[var(--border-strong)] bg-transparent text-sm font-bold text-[var(--foreground)] hover:border-[var(--accent)] transition-colors"
              >
                Explore Features
              </Link>
            </div>
          </div>

          {/* Right Content (Green bg) */}
          <div className="md:w-[45%] mt-16 md:mt-0 relative w-full">
            <LandingCarousel />
          </div>
        </div>
      </section>

      {/* Features Section - Sand Background */}
      <section id="features" className="bg-[#E6D5B8] text-[#18181A] py-24 px-8 w-full">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-serif-heading font-semibold text-[#18181A] tracking-tight">The Standard of Travel</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="border border-[#C2A878] bg-[#F3E9D8] p-10 rounded-2xl">
              <div className="flex h-12 w-12 items-center justify-center bg-[#18181A] text-[#E6D5B8] rounded-full mb-6">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-serif-heading text-2xl font-bold mb-4">Seamless Connections</h3>
              <p className="text-[#3A3A3C] text-base leading-relaxed font-medium">
                We monitor every step of your travel, ensuring smooth transitions and automatically flagging any tight schedules or missed windows.
              </p>
            </div>

            <div className="border border-[#C2A878] bg-[#F3E9D8] p-10 rounded-2xl">
              <div className="flex h-12 w-12 items-center justify-center bg-[#18181A] text-[#E6D5B8] rounded-full mb-6">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-serif-heading text-2xl font-bold mb-4">Anticipating Delays</h3>
              <p className="text-[#3A3A3C] text-base leading-relaxed font-medium">
                When weather or operations delay your flight, we instantly foresee the impact on your connections and suggest immediate alternatives.
              </p>
            </div>

            <div className="border border-[#C2A878] bg-[#F3E9D8] p-10 rounded-2xl md:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex h-12 w-12 items-center justify-center bg-[#18181A] text-[#E6D5B8] rounded-full flex-shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif-heading text-2xl font-bold mb-3">Travel Together</h3>
                  <p className="text-[#3A3A3C] text-base leading-relaxed font-medium max-w-2xl">
                    Invite your friends and family to coordinate plans together safely. Perfect for group trips and coordinating separate arrivals seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3A3A3C] bg-[#18181A] px-8 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <SlackLogo />
          </div>
          <div className="text-sm text-[#A1998A] font-medium">
            &copy; {new Date().getFullYear()} Slack. Crafted for seamless journeys.
          </div>
        </div>
      </footer>
    </div>
  );
}
