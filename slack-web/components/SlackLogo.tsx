import React from "react";

export default function SlackLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-stretch font-[family-name:var(--font-signature)] ${className}`}>
      <div className="bg-[var(--accent)] flex items-center justify-center px-3 py-1">
        <span className="text-3xl font-bold text-[#18181A]">S</span>
      </div>
      <div className="bg-[#18181A] flex items-center justify-center px-3 py-1">
        <span className="text-2xl font-normal text-[var(--accent)] mt-0.5">lack</span>
      </div>
    </div>
  );
}
