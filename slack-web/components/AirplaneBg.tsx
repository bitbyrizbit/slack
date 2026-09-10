import React from "react";

export default function AirplaneBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[var(--background)]">
      <svg
        className="absolute w-[180%] h-[180%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(500, 500) rotate(-35) translate(-500, -500)">
          {/* Main fuselage with 3D gradient/shadows */}
          <path
            d="M 500 100 C 530 100, 545 150, 550 250 L 560 700 C 565 850, 520 900, 500 900 C 480 900, 435 850, 440 700 L 450 250 C 455 150, 470 100, 500 100 Z"
            fill="url(#fuselageGradient)"
          />
          {/* Right Wing */}
          <path
            d="M 550 450 L 950 650 L 930 720 L 555 580 Z"
            fill="url(#wingGradient)"
          />
          {/* Left Wing */}
          <path
            d="M 450 450 L 50 650 L 70 720 L 445 580 Z"
            fill="url(#wingGradient)"
          />
          {/* Right Tail */}
          <path
            d="M 545 780 L 750 850 L 730 890 L 530 860 Z"
            fill="url(#wingGradient)"
          />
          {/* Left Tail */}
          <path
            d="M 455 780 L 250 850 L 270 890 L 470 860 Z"
            fill="url(#wingGradient)"
          />
          {/* Vertical Stabilizer */}
          <path
            d="M 485 750 L 515 750 L 510 880 L 490 880 Z"
            fill="#808080"
          />
        </g>
        <defs>
          <linearGradient id="fuselageGradient" x1="440" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A4A4A" />
            <stop offset="30%" stopColor="#8A8A8A" />
            <stop offset="70%" stopColor="#C0C0C0" />
            <stop offset="100%" stopColor="#3A3A3A" />
          </linearGradient>
          <linearGradient id="wingGradient" x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9A9A9A" />
            <stop offset="100%" stopColor="#2A2A2A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
