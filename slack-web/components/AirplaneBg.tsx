import React from "react";

export default function AirplaneBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[var(--background)] flex items-center justify-center">
      {/* Giant spinning turbine background */}
      <div className="relative w-[150vh] h-[150vh] flex items-center justify-center opacity-10">
        <svg 
          viewBox="0 0 1000 1000" 
          style={{ animation: "spin 30s linear infinite" }}
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bladeGrad" x1="500" y1="500" x2="500" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="hubGrad" cx="500" cy="500" r="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--background)" />
              <stop offset="50%" stopColor="var(--foreground)" />
              <stop offset="100%" stopColor="var(--background)" />
            </radialGradient>
          </defs>

          {/* Engine Casing / Outer Ring */}
          <circle cx="500" cy="500" r="480" stroke="var(--foreground)" strokeWidth="15" />
          <circle cx="500" cy="500" r="465" stroke="var(--foreground)" strokeWidth="4" strokeDasharray="10 20" />
          <circle cx="500" cy="500" r="450" stroke="var(--foreground)" strokeWidth="20" opacity="0.5" />
          
          {/* Outer Stators (Fixed) */}
          <g style={{ animation: "spin 60s linear infinite reverse" }}>
            {Array.from({ length: 36 }).map((_, i) => (
              <line 
                key={`stator-${i}`} 
                x1="500" y1="50" x2="500" y2="150" 
                stroke="var(--foreground)" strokeWidth="6" 
                transform={`rotate(${i * 10} 500 500)`} 
                opacity="0.4"
              />
            ))}
          </g>

          {/* Primary Turbine Blades */}
          {Array.from({ length: 24 }).map((_, i) => (
            <g key={`blade-${i}`} transform={`rotate(${i * 15} 500 500)`}>
              <path 
                d="M 500 150 C 580 100, 540 60, 500 40 C 460 60, 420 100, 500 150 Z" 
                fill="url(#bladeGrad)" 
              />
              {/* Blade Ridge */}
              <path 
                d="M 500 150 L 500 40" 
                stroke="var(--foreground)" strokeWidth="2" opacity="0.5"
              />
            </g>
          ))}

          {/* Inner Rings */}
          <circle cx="500" cy="500" r="180" stroke="var(--foreground)" strokeWidth="12" />
          <circle cx="500" cy="500" r="160" stroke="var(--foreground)" strokeWidth="2" strokeDasharray="5 15" />

          {/* Turbine Nose Cone (Spinner) */}
          <circle cx="500" cy="500" r="150" fill="url(#hubGrad)" />
          
          {/* Spinner Swirl (Spiral painted on nose cone) */}
          <path 
            d="M 500 500 Q 550 450, 600 500 T 500 650" 
            stroke="var(--background)" strokeWidth="8" fill="none" strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
