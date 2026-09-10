"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SlackLogo from "@/components/SlackLogo";
import AirplaneBg from "@/components/AirplaneBg";
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Crown,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
} from "lucide-react";
import { loginUser } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

interface DemoAccount {
  roleKey: "owner" | "editor" | "viewer";
  label: string;
  roleBadge: string;
  sublabel: string;
  email: string;
  password: string;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
  iconBg: string;
  Icon: typeof Crown;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    roleKey: "owner",
    label: "Aisha",
    roleBadge: "Owner",
    sublabel: "Full access to organize and refine journeys",
    email: "owner@demo.com",
    password: "demo1234",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    badgeText: "text-purple-700",
    borderHover: "hover:border-purple-300 hover:bg-purple-50/40",
    iconBg: "bg-purple-600 text-white",
    Icon: Crown,
  },
  {
    roleKey: "editor",
    label: "Charlie",
    roleBadge: "Editor",
    sublabel: "Help plan and adjust schedules smoothly",
    email: "editor@demo.com",
    password: "demo1234",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    badgeText: "text-emerald-700",
    borderHover: "hover:border-emerald-300 hover:bg-emerald-50/40",
    iconBg: "bg-emerald-600 text-white",
    Icon: Edit3,
  },
  {
    roleKey: "viewer",
    label: "Bob",
    roleBadge: "Viewer",
    sublabel: "Perfect for guests to follow along safely",
    email: "viewer@demo.com",
    password: "demo1234",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    badgeText: "text-amber-700",
    borderHover: "hover:border-amber-300 hover:bg-amber-50/40",
    iconBg: "bg-amber-600 text-white",
    Icon: Eye,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(account: DemoAccount) {
    setError(null);
    setDemoLoading(account.email);
    try {
      await loginUser(account.email, account.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  }

  function handleAutofill(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  }

  return (
    <main className="relative min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 overflow-hidden">
      <AirplaneBg />

      <div className="relative z-10 w-full max-w-[500px] aspect-square flex flex-col items-center justify-center p-8 sm:p-12 rounded-full bg-[var(--card)] border border-[var(--border-strong)] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <div className="w-full max-w-[320px] mx-auto text-center flex flex-col items-center">
          <Link href="/" className="mb-6 block transform -rotate-3 hover:scale-105 transition-transform">
            <SlackLogo />
          </Link>

          <h2 className="text-2xl font-serif-heading font-normal text-[var(--foreground)] mb-1">
            Welcome Back
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] font-light mb-6">
            Enter your credentials or select a demo role
          </p>

          {error && (
            <div className="mb-4 p-2 rounded-lg bg-[var(--muted)] border border-[var(--border-strong)] text-[var(--accent)] text-[10px] w-full text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-full border border-[var(--border-strong)] bg-[#1D1F21] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-10 py-2.5 rounded-full border border-[var(--border-strong)] bg-[#1D1F21] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading !== null}
              className="w-full py-2.5 px-4 rounded-full bg-[var(--accent)] text-[#18181A] font-semibold text-sm hover:bg-[#D5B98A] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[var(--border)] w-full">
            <p className="text-[10px] text-[var(--muted-foreground)] mb-2">Quick Demo Access</p>
            <div className="flex justify-center gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.roleKey}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  disabled={demoLoading !== null || loading}
                  className="px-3 py-1.5 rounded-full border border-[var(--border-strong)] text-[10px] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  {demoLoading === account.email ? <Loader2 className="w-3 h-3 animate-spin inline" /> : account.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-[11px] text-[var(--muted-foreground)]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[var(--accent)] hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
