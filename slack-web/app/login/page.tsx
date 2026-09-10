"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    roleBadge: "OWNER / ADMIN",
    sublabel: "Full authority: create, edit, delete & resolve disruptions",
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
    roleBadge: "EDITOR",
    sublabel: "Can modify itineraries and trigger live delays",
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
    roleBadge: "VIEWER (READ-ONLY)",
    sublabel: "Strict read-only: mutations rejected server-side",
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
    <main className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center px-4 py-10 sm:px-6">
      {/* Background subtle graph grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#111111 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative w-full max-w-4xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E0D8] shadow-xs hover:border-[#111111] transition-all group mb-4"
          >
            <div className="w-6 h-6 rounded-md bg-[#111111] text-white flex items-center justify-center text-xs">
              <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-sm text-[#111111] tracking-tight">
              Slack Engine
            </span>
            <span className="text-[11px] font-mono text-[#78716C] border-l border-[#E5E0D8] pl-2">
              DAG v1.0
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            Disruption Recovery Control Center
          </h1>
          <p className="mt-2 text-sm text-[#666660] max-w-md mx-auto">
            Travel itineraries modeled as Directed Acyclic Graphs with automated edge slack recalculation.
          </p>
        </div>

        {/* Master Card with Dual Layout */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Left Column: Quick Evaluation / Demo Profiles (5 cols) */}
            <div className="lg:col-span-5 bg-[#F9F8F6] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#E5E0D8] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C05621]" />
                    <span>Judge / Demo Mode</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E0D8] text-[#78716C]">
                    1-CLICK ACCESS
                  </span>
                </div>

                <p className="text-xs text-[#78716C] mb-5 leading-relaxed">
                  Instant login to real, pre-seeded accounts. Each identity holds an isolated JWT with enforced server-side RBAC permissions.
                </p>

                {/* Persona Cards */}
                <div className="space-y-3">
                  {DEMO_ACCOUNTS.map((account) => {
                    const isCurrentLoading = demoLoading === account.email;
                    const IconComponent = account.Icon;

                    return (
                      <div
                        key={account.email}
                        className={`group relative rounded-xl border border-[#E5E0D8] bg-white p-3.5 transition-all duration-200 shadow-2xs ${account.borderHover}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg ${account.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-sm font-semibold text-[#111111] truncate">
                                {account.label}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${account.badgeBg}`}>
                                {account.roleBadge}
                              </span>
                            </div>
                            <p className="text-xs text-[#78716C] line-clamp-1 mb-2.5">
                              {account.sublabel}
                            </p>

                            <div className="flex items-center gap-2">
                              {/* 1-Click Instant Login Button */}
                              <button
                                id={`demo-login-${account.roleKey}`}
                                type="button"
                                onClick={() => handleDemoLogin(account)}
                                disabled={demoLoading !== null || loading}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-medium hover:bg-[#2C2926] active:scale-[0.98] disabled:opacity-50 transition-all shadow-2xs"
                              >
                                {isCurrentLoading ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Entering…</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Sign in as {account.label}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </>
                                )}
                              </button>

                              {/* Autofill quick button */}
                              <button
                                type="button"
                                onClick={() => handleAutofill(account)}
                                title="Autofill credentials into the form"
                                className="px-2 py-1.5 rounded-lg border border-[#E5E0D8] text-[11px] font-medium text-[#78716C] hover:text-[#111111] hover:bg-[#F2EFE9] transition-colors"
                              >
                                Autofill
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RBAC Security Note */}
              <div className="mt-6 pt-4 border-t border-[#E5E0D8]/80 flex items-center gap-2 text-[11px] text-[#78716C]">
                <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
                <span> Viewers cannot mutate nodes even with forged headers.</span>
              </div>
            </div>

            {/* Right Column: Standard Credentials Login (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <div className="mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-[#111111]">
                    Sign In
                  </h2>
                  <p className="text-xs text-[#78716C] mt-1">
                    Enter your workspace credentials or click an evaluator profile on the left.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span className="flex-1 leading-relaxed font-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-[#3A3630] uppercase tracking-wider mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com or owner@demo.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D5CEC5] bg-[#FDFCF9] text-sm text-[#111111] placeholder:text-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#111111]/15 focus:border-[#111111] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-[#3A3630] uppercase tracking-wider"
                      >
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D5CEC5] bg-[#FDFCF9] text-sm text-[#111111] placeholder:text-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#111111]/15 focus:border-[#111111] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A8A29E] hover:text-[#111111] transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || demoLoading !== null}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#111111] text-white font-medium text-sm hover:bg-[#2C2926] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111111]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#78716C]">
                  <span>Don&apos;t have an account?</span>
                  <Link
                    href="/signup"
                    className="font-semibold text-[#111111] underline underline-offset-4 hover:text-[#C05621] transition-colors"
                  >
                    Create an account →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C827A] px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SQLite Graph Engine • Live WebSocket Active</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Engine Home
            </Link>
            <span>•</span>
            <Link href="/signup" className="hover:text-[#111111] transition-colors">
              Register New Workspace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
