"use client";

import React, { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import { AuthUser } from "@/lib/types";
import Link from "next/link";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans antialiased">
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-3 flex items-center gap-4">
        <Link href="/" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          ← Back
        </Link>
        <span className="text-sm font-semibold text-[var(--foreground)]">Profile</span>
      </header>
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="font-serif-heading text-4xl font-bold text-[var(--foreground)] mb-8">Profile</h1>
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Display Name</h2>
            <p className="text-xl font-medium text-[var(--foreground)]">{currentUser?.display_name || "Guest"}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Email</h2>
            <p className="text-base text-[var(--foreground)]">{currentUser?.email || "—"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
