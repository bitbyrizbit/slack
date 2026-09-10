"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SlackLogo({ className = "", italicText = false }: { className?: string, italicText?: boolean }) {
  return (
    <div className={`flex font-[family-name:var(--font-signature)] shadow-lg ${className}`}>
      {/* S Box */}
      <div className="relative flex items-center justify-center pl-4 pr-1 py-1.5 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[var(--accent)] origin-right"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className={`relative z-10 text-4xl font-bold text-[#18181A] leading-none ${italicText ? "italic" : ""}`}>S</span>
      </div>
      
      {/* lack Box */}
      <div className="relative flex items-center justify-center pr-4 pl-1 py-1.5 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[#2D3A31] origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <span className={`relative z-10 text-3xl font-normal text-[var(--accent)] leading-none mt-1 ${italicText ? "italic" : ""}`}>lack</span>
      </div>
    </div>
  );
}
