import React from "react";

export default function AirplaneBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[var(--background)] flex items-center justify-center">
      {/* Giant spinning turbine background */}
      <div className="relative w-[150vh] h-[150vh] flex items-center justify-center opacity-10">
        <svg 
          viewBox="0 0 1000 1000" 
          className="w-full h-full animate-[spin_40s_linear_infinite]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle cx="500" cy="500" r="480" stroke="var(--foreground)" strokeWidth="15" />
          <circle cx="500" cy="500" r="460" stroke="var(--foreground)" strokeWidth="5" strokeDasharray="20 40" />
          
          {/* Turbine Blades */}
          {Array.from({ length: 24 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 15} 500 500)`}>
              <path 
                d="M 500 250 C 600 100, 550 50, 500 20 C 450 50, 400 100, 500 250 Z" 
                fill="var(--foreground)" 
              />
            </g>
          ))}

          {/* Inner Rings */}
          <circle cx="500" cy="500" r="260" stroke="var(--foreground)" strokeWidth="10" />
          <circle cx="500" cy="500" r="240" fill="var(--background)" stroke="var(--foreground)" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}
