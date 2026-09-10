"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { signupUser } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signupUser(email.trim(), password, displayName.trim());
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center px-4 py-10 sm:px-6">
      {/* Background subtle graph grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(#111111 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-md">
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
            Create Workspace Account
          </h1>
          <p className="mt-2 text-sm text-[#666660]">
            Deploy automated recovery plans for flight & travel delays.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-7 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="flex-1 leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-xs font-semibold text-[#3A3630] uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D5CEC5] bg-[#FDFCF9] text-sm text-[#111111] placeholder:text-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#111111]/15 focus:border-[#111111] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#3A3630] uppercase tracking-wider mb-1.5"
              >
                Work Email
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
                  placeholder="alex@acme.com"
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
                <span className="text-[11px] font-mono text-[#A8A29E]">
                  (min 6 chars)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8A29E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
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
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#111111] text-white font-medium text-sm hover:bg-[#2C2926] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#111111]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#78716C]">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="font-semibold text-[#111111] underline underline-offset-4 hover:text-[#C05621] transition-colors"
            >
              Sign in →
            </Link>
          </div>
        </div>

        {/* Security & RBAC note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8C827A]">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>Encrypted sessions with JWT authentication</span>
        </div>
      </div>
    </main>
  );
}
