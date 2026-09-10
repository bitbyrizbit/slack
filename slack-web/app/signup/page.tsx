"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SlackLogo from "@/components/SlackLogo";
import AirplaneBg from "@/components/AirplaneBg";
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
    <main className="relative min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 overflow-hidden">
      <AirplaneBg />

      <div className="relative z-10 w-full max-w-[500px] aspect-square flex flex-col items-center justify-center p-8 sm:p-12 rounded-full bg-[var(--card)] border border-[var(--border-strong)] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        <div className="w-full max-w-[320px] mx-auto text-center flex flex-col items-center">
          <Link href="/" className="mb-4 block transform -rotate-3 hover:scale-105 transition-transform">
            <SlackLogo />
          </Link>

          <h2 className="text-xl font-serif-heading font-normal text-[var(--foreground)] mb-1">
            Create Account
          </h2>
          <p className="text-[10px] text-[var(--muted-foreground)] font-light mb-4">
            Start your seamless journey
          </p>

          {error && (
            <div className="mb-3 p-2 rounded-lg bg-[var(--muted)] border border-[var(--border-strong)] text-[var(--accent)] text-[10px] w-full text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-full border border-[var(--border-strong)] bg-[#1D1F21] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6)"
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
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full bg-[var(--accent)] text-[#18181A] font-semibold text-sm hover:bg-[#D5B98A] transition-all flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign Up</span>}
            </button>
          </form>

          <div className="mt-4 text-[11px] text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
