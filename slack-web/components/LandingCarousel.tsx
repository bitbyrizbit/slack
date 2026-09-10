"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRIPS = [
  { title: "Paris Getaway", status: "Active", flights: 2, hotels: 1, delay: null },
  { title: "Alpine Odyssey", status: "Draft", flights: 3, hotels: 2, delay: "+15m Tight" },
  { title: "Tokyo Summit", status: "Active", flights: 1, hotels: 1, delay: null },
  { title: "Bali Retreat", status: "Past", flights: 2, hotels: 1, delay: null },
  { title: "NYC Weekend", status: "Draft", flights: 2, hotels: 1, delay: "+45m Delay" },
];

export default function LandingCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TRIPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % TRIPS.length);
  const prev = () => setIndex((prev) => (prev - 1 + TRIPS.length) % TRIPS.length);

  const trip = TRIPS[index];

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="w-full relative h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#18181A] border border-[#3A3A3C] rounded-2xl p-8 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#3A3A3C]">
              <div className="font-serif-heading text-lg font-medium text-[var(--foreground)]">{trip.title}</div>
              <div className="text-[10px] text-[#2D3A31] bg-[var(--accent)] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {trip.status}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2D3A31] flex items-center justify-center">
                  <span className="text-[10px] text-[var(--accent)]">✈</span>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Flights</div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">{trip.flights} Bookings</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2D3A31] flex items-center justify-center">
                  <span className="text-[10px] text-[var(--accent)]">🏨</span>
                </div>
                <div>
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Hotels</div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">{trip.hotels} Bookings</div>
                </div>
              </div>
            </div>

            {trip.delay && (
              <div className="mt-6 border-t border-[#3A3A3C] pt-4 flex items-center justify-between">
                <span className="text-xs text-[#8E887D]">Graph Warning</span>
                <span className="text-xs text-[var(--accent)] font-bold">{trip.delay}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={prev} className="p-2 rounded-full border border-[#3A3A3C] text-[var(--foreground)] hover:bg-[#3A3A3C] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1.5">
          {TRIPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[var(--accent)]" : "w-1.5 bg-[#3A3A3C]"}`} />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full border border-[#3A3A3C] text-[var(--foreground)] hover:bg-[#3A3A3C] transition-colors">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
