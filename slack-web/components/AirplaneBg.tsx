import React from "react";

export default function AirplaneBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[var(--background)] flex items-center justify-center">
      {/* Giant subtle wheel background */}
      <div className="relative w-[120vh] h-[120vh] flex items-center justify-center opacity-15">
        <svg 
          viewBox="0 0 1000 1000" 
          style={{ animation: "spin 60s linear infinite" }}
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="metalGrad" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="var(--foreground)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id="hubGrad" cx="500" cy="500" r="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--background)" />
              <stop offset="100%" stopColor="#2D3A31" /> {/* Green accent inside the hub */}
            </radialGradient>
          </defs>

          {/* Outer Tire */}
          <circle cx="500" cy="500" r="480" stroke="var(--foreground)" strokeWidth="40" opacity="0.6" />
          <circle cx="500" cy="500" r="450" stroke="var(--foreground)" strokeWidth="4" opacity="0.8" />
          
          {/* Wheel Rim */}
          <circle cx="500" cy="500" r="380" stroke="url(#metalGrad)" strokeWidth="60" />
          
          {/* Green Accent Ring */}
          <circle cx="500" cy="500" r="340" stroke="#2D3A31" strokeWidth="8" opacity="0.9" />

          {/* Wheel Spokes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`spoke-${i}`} transform={`rotate(${i * 30} 500 500)`}>
              <path 
                d="M 500 150 L 520 350 L 480 350 Z" 
                fill="url(#metalGrad)" 
              />
              <line x1="500" y1="150" x2="500" y2="350" stroke="var(--foreground)" strokeWidth="2" opacity="0.5" />
            </g>
          ))}

          {/* Hubcap */}
          <circle cx="500" cy="500" r="160" stroke="var(--foreground)" strokeWidth="10" />
          <circle cx="500" cy="500" r="150" fill="url(#hubGrad)" />
          
          {/* Bolts */}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle 
              key={`bolt-${i}`}
              cx="500" cy="400" r="15" 
              fill="var(--foreground)" 
              transform={`rotate(${i * 60} 500 500)`}
            />
          ))}

          {/* Center Axle */}
          <circle cx="500" cy="500" r="40" fill="var(--background)" stroke="var(--accent)" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}
