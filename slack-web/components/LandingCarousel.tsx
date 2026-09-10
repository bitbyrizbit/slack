"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plane, MapPin, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRIPS = [
  { 
    title: "Paris Getaway", 
    status: "Active", 
    flight: { text: "Flight AF 123 (JFK → CDG)", time: "10:00 - 22:30" },
    hotel: { text: "Le Meurice, Rue de Rivoli", time: "Check-in 14:00" },
    delay: null 
  },
  {
    title: "Alpine Odyssey",
    status: "Draft",
    flight: { text: "Swiss Air LX 354 (ZRH → GVA)", time: "13:30 - 15:00" },
    hotel: { text: "Mont-Blanc Luxury Resort", time: "Check-in 17:30" },
    delay: "+15m Tight Gap Detected"
  },
  {
    title: "Tokyo Summit",
    status: "Active",
    flight: { text: "JAL 005 (JFK → HND)", time: "12:00 - 15:30 (+1)" },
    hotel: { text: "Aman Tokyo, Otemachi", time: "Check-in 16:00" },
    delay: null
  },
  {
    title: "Bali Retreat",
    status: "Past",
    flight: { text: "SQ 938 (SIN → DPS)", time: "09:15 - 11:55" },
    hotel: { text: "Four Seasons Resort Sayan", time: "Check-in 14:00" },
    delay: null
  },
  {
    title: "NYC Weekend",
    status: "Draft",
    flight: { text: "AA 100 (LHR → JFK)", time: "08:30 - 11:15" },
    hotel: { text: "The Plaza, 5th Avenue", time: "Check-in 15:00" },
    delay: "+45m Delay Warning"
  }
];

export default function LandingCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TRIPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % TRIPS.length);
  const prev = () => setIndex((prev) => (prev - 1 + TRIPS.length) % TRIPS.length);

  const trip = TRIPS[index];

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="w-full relative h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white border border-[var(--border)] rounded-2xl p-8 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
              <div className="font-serif-heading text-lg font-medium text-[var(--foreground)]">{trip.title}</div>
              <div className="text-[10px] text-[#2D3A31] bg-[var(--accent)] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {trip.status}
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {/* Flight Section */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#2D3A31]">
                    <Plane size={14} />
                  </div>
                  <div className="w-px h-10 bg-[var(--border)] my-2"></div>
                </div>
                <div>
                  <div className="text-xs text-[var(--accent)] font-semibold tracking-wide uppercase mb-1">Departure</div>
                  <div className="text-sm text-[var(--foreground)] font-medium leading-tight">{trip.flight.text}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">{trip.flight.time}</div>
                </div>
              </div>
              
              {/* Hotel Section */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[#2D3A31] flex items-center justify-center text-[var(--accent)]">
                    <MapPin size={14} />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--accent)] font-semibold tracking-wide uppercase mb-1">Check-in</div>
                  <div className="text-sm text-[var(--foreground)] font-medium leading-tight">{trip.hotel.text}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">{trip.hotel.time}</div>
                </div>
              </div>
            </div>

            {/* Delay Section */}
            {trip.delay && (
              <div className="mt-6 border-t border-[var(--border)] pt-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{trip.delay}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={prev} className="p-2 rounded-full border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1.5">
          {TRIPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#2D3A31]" : "w-1.5 bg-[var(--border-strong)]"}`} />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
