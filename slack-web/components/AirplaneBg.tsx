export default function AirplaneBg() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden bg-[#18181A]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#18181A] to-[#222225] z-0" />
      <svg viewBox="0 0 1000 1000" className="w-[150vw] sm:w-[100vw] min-w-[1200px] text-[#C2A878] opacity-10 z-10 transform -rotate-12 translate-y-20" fill="currentColor">
        <path d="M500,50 C500,50 460,150 460,350 L100,600 L100,660 L460,560 L460,820 L350,900 L350,950 L500,900 L650,950 L650,900 L540,820 L540,560 L900,660 L900,600 L540,350 C540,150 500,50 500,50 Z" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#18181A]/50 to-[#18181A] z-20" />
    </div>
  );
}
