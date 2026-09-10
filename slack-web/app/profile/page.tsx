"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAuthUser } from "@/lib/auth";
import { AuthUser } from "@/lib/types";
import { updateProfile } from "@/lib/api";
import { ToastContainer, ToastMessage } from "@/components/ToastNotification";
import Link from "next/link";
import { User, Mail, Save, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setCurrentUser(user);
      setDisplayName(user.display_name || "");
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      addToast("Display name cannot be empty.", "error");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateProfile(displayName.trim());
      setCurrentUser(updated);
      addToast("Profile display name updated successfully!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans antialiased text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--card)] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-[var(--border)]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
            Account Profile
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-2xl mx-auto w-full">
        <div className="border-b border-[var(--border)] pb-4 mb-8">
          <h1 className="font-serif-heading text-3xl font-bold">Your Profile</h1>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Manage your personal identity and how collaborators see you across trips.
          </p>
        </div>

        <form onSubmit={handleSave} className="border border-[var(--border-strong)] bg-[var(--card)] p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8E887D] mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>Email Address</span>
            </label>
            <input
              type="text"
              disabled
              value={currentUser?.email || ""}
              className="w-full border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)] cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-[#8E887D]">
              Email is your permanent login identifier and cannot be changed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8E887D] mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Display Name</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Aisha Taylor"
              className="w-full border border-[var(--border-strong)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--foreground)] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#8E887D]">
              This name is shown to collaborators in the Activity Feed, Presence avatars, and trip member lists.
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-xs font-semibold text-[var(--background)] hover:bg-[#38332B] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </main>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
