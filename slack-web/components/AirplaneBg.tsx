import React from "react";

export default function AirplaneBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#E8F0E9] flex items-center justify-center">
      {/* Subtle light wheel background */}
      <div className="relative w-[120vh] h-[120vh] flex items-center justify-center opacity-20">
        <svg
          viewBox="0 0 1000 1000"
          style={{ animation: "spin 60s linear infinite" }}
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="hubGrad" cx="500" cy="500" r="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F2ED" />
              <stop offset="100%" stopColor="#2D3A31" />
            </radialGradient>
          </defs>

          {/* Outer Tire */}
          <circle cx="500" cy="500" r="480" stroke="#2D3A31" strokeWidth="40" opacity="0.5" />
          <circle cx="500" cy="500" r="450" stroke="#2D3A31" strokeWidth="4" opacity="0.7" />

          {/* Wheel Rim */}
          <circle cx="500" cy="500" r="380" stroke="#2D3A31" strokeWidth="50" opacity="0.2" />

          {/* Green Accent Ring */}
          <circle cx="500" cy="500" r="340" stroke="#2D3A31" strokeWidth="6" opacity="0.8" />

          {/* Wheel Spokes */}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`spoke-${i}`} transform={`rotate(${i * 30} 500 500)`}>
              <path d="M 500 150 L 515 350 L 485 350 Z" fill="#2D3A31" opacity="0.5" />
              <line x1="500" y1="150" x2="500" y2="350" stroke="#2D3A31" strokeWidth="2" opacity="0.4" />
            </g>
          ))}

          {/* Hubcap */}
          <circle cx="500" cy="500" r="160" stroke="#2D3A31" strokeWidth="8" opacity="0.6" />
          <circle cx="500" cy="500" r="150" fill="url(#hubGrad)" />

          {/* Bolts */}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle
              key={`bolt-${i}`}
              cx="500" cy="400" r="14"
              fill="#2D3A31"
              opacity="0.7"
              transform={`rotate(${i * 60} 500 500)`}
            />
          ))}

          {/* Center Axle */}
          <circle cx="500" cy="500" r="38" fill="#F5F2ED" stroke="#2D3A31" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}
