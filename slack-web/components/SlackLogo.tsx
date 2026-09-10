import React from "react";

export default function SlackLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex font-[family-name:var(--font-signature)] shadow-lg ${className}`}>
      <div className="bg-[var(--accent)] flex items-center justify-center pl-4 pr-1 py-1.5">
        <span className="text-4xl font-bold text-[#18181A] leading-none">S</span>
      </div>
      <div className="bg-[#2D3A31] flex items-center justify-center pr-4 pl-1 py-1.5">
        <span className="text-3xl font-normal text-[var(--accent)] leading-none mt-1">lack</span>
      </div>
    </div>
  );
}
