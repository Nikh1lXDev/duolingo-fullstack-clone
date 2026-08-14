"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * LandingAnimation
 * 
 * Animated phone sequence showing the mascot and characters.
 * Animation sequence:
 * 1. Phone slides in from bottom
 * 2. Mascot emerges from phone
 * 3. Blue bird exits left
 * 4. Red bird exits right
 * 5. Stars/coins appear
 * 6. All settle into idle loop
 */
export function LandingAnimation() {
  const shouldReduce = useReducedMotion();

  const duration = shouldReduce ? 0 : 1;
  const idleAnim: any = shouldReduce ? {} : { y: [0, -6, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } };
  const idleAnimSlow: any = shouldReduce ? {} : { y: [0, -4, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 } };
  const idleAnimFast: any = shouldReduce ? {} : { y: [0, -8, 0], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1 } };

  return (
    <div className="relative flex items-end justify-center w-full h-full" style={{ minHeight: 320 }}>
      {/* Background floating stars */}
      {!shouldReduce && (
        <>
          {[
            { x: "10%", y: "20%", size: 8, color: "#ffc800", delay: 1.5 },
            { x: "80%", y: "15%", size: 6, color: "#58cc02", delay: 2.0 },
            { x: "5%",  y: "60%", size: 5, color: "#ce82ff", delay: 2.5 },
            { x: "90%", y: "55%", size: 7, color: "#1cb0f6", delay: 1.8 },
            { x: "70%", y: "25%", size: 5, color: "#ff9600", delay: 2.2 },
          ].map((star, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                backgroundColor: star.color,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1, 0.8, 1] }}
              transition={{ delay: star.delay, duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            />
          ))}
        </>
      )}

      {/* Blue bird — left */}
      <motion.div
        className="absolute"
        style={{ left: "2%", bottom: "30%" }}
        initial={{ x: shouldReduce ? 0 : 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1, ...idleAnimSlow }}
        transition={{ delay: shouldReduce ? 0 : 1.2, duration, ease: "easeOut" }}
      >
        <BlueBird size={70} />
      </motion.div>

      {/* Red/orange bird — right */}
      <motion.div
        className="absolute"
        style={{ right: "2%", bottom: "35%" }}
        initial={{ x: shouldReduce ? 0 : -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1, ...idleAnimFast }}
        transition={{ delay: shouldReduce ? 0 : 1.6, duration, ease: "easeOut" }}
      >
        <OrangeBird size={60} />
      </motion.div>

      {/* Phone */}
      <motion.div
        className="relative z-20"
        initial={{ y: shouldReduce ? 0 : 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0, duration: duration * 0.8, ease: "easeOut" }}
      >
        {/* Phone frame */}
        <div
          className="relative"
          style={{
            width: 200,
            height: 320,
            background: "linear-gradient(170deg, #1e3a4a 0%, #0e2130 100%)",
            borderRadius: 32,
            border: "3px solid #2b5068",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            overflow: "hidden",
            paddingBottom: 24,
          }}
        >
          {/* Phone screen content */}
          <div className="absolute inset-2 rounded-2xl bg-[#131f24] overflow-hidden flex flex-col items-center justify-end pb-4">
            {/* Screen glow */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: "radial-gradient(ellipse at 50% 30%, #58cc02 0%, transparent 70%)",
              }}
            />
            {/* App UI lines (decorative) */}
            <div className="absolute top-8 left-4 right-4 flex flex-col gap-2 opacity-40">
              <div className="h-2 bg-[#2b3d47] rounded-full w-3/4" />
              <div className="h-2 bg-[#2b3d47] rounded-full w-1/2" />
              <div className="h-8 bg-[#58cc02]/20 rounded-xl mt-2" />
              <div className="h-8 bg-[#1cb0f6]/20 rounded-xl" />
            </div>
          </div>

          {/* Phone notch */}
          <div
            className="absolute top-0 left-0 right-0 flex justify-center pt-2"
            style={{ zIndex: 10 }}
          >
            <div className="w-16 h-5 bg-[#0e2130] rounded-b-full" />
          </div>
        </div>
      </motion.div>

      {/* Main mascot — emerges from phone */}
      <motion.div
        className="absolute z-30"
        style={{ bottom: "36%" }}
        initial={{ y: shouldReduce ? 0 : 60, opacity: 0, scale: 0.7 }}
        animate={{ y: 0, opacity: 1, scale: 1, ...idleAnim }}
        transition={{ delay: shouldReduce ? 0 : 0.5, duration, type: "spring", stiffness: 200, damping: 15 }}
      >
        <MascotSVG size={130} />
      </motion.div>

      {/* Coin/XP floating badge */}
      <motion.div
        className="absolute z-20"
        style={{ right: "18%", bottom: "58%" }}
        initial={{ opacity: 0, scale: 0, y: shouldReduce ? 0 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: shouldReduce ? 0 : 2, duration: 0.4 }}
      >
        <div className="bg-[#ffc800] text-[#7a5000] font-black text-xs rounded-full px-3 py-1 shadow-lg border-2 border-[#e0a800]">
          +10 XP
        </div>
      </motion.div>

      {/* Streak badge */}
      <motion.div
        className="absolute z-20"
        style={{ left: "15%", bottom: "60%" }}
        initial={{ opacity: 0, scale: 0, y: shouldReduce ? 0 : 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: shouldReduce ? 0 : 2.3, duration: 0.4 }}
      >
        <div className="bg-[#ff9600] text-white font-black text-xs rounded-full px-3 py-1 shadow-lg border-2 border-[#e08600] flex items-center gap-1">
          🔥 5 day
        </div>
      </motion.div>
    </div>
  );
}

function MascotSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="175" rx="55" ry="12" fill="#0b1317" opacity="0.4" />
      <ellipse cx="78" cy="167" rx="12" ry="7" fill="#ff9600" />
      <ellipse cx="122" cy="167" rx="12" ry="7" fill="#ff9600" />
      <path d="M45 105 C 45 55, 70 35, 100 35 C 130 35, 155 55, 155 105 C 155 145, 135 162, 100 162 C 65 162, 45 145, 45 105 Z" fill="#58cc02" />
      <path d="M62 110 C 62 80, 80 72, 100 72 C 120 72, 138 80, 138 110 C 138 140, 120 152, 100 152 C 80 152, 62 140, 62 110 Z" fill="#89e219" />
      <path d="M48 100 C 30 90, 25 120, 48 125 Z" fill="#46a302" />
      <path d="M152 100 C 170 90, 175 120, 152 125 Z" fill="#46a302" />
      <circle cx="76" cy="80" r="22" fill="#89e219" />
      <circle cx="124" cy="80" r="22" fill="#89e219" />
      <circle cx="76" cy="80" r="17" fill="white" />
      <circle cx="124" cy="80" r="17" fill="white" />
      <circle cx="80" cy="80" r="9" fill="#131f24" />
      <circle cx="128" cy="80" r="9" fill="#131f24" />
      <circle cx="83" cy="77" r="3.5" fill="white" />
      <circle cx="131" cy="77" r="3.5" fill="white" />
      <path d="M92 92 L108 92 L100 108 Z" fill="#ff9600" />
      <path d="M94 92 L106 92 L100 100 Z" fill="#ffc800" />
      <path d="M85 103 Q100 118 115 103" stroke="#46a302" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function BlueBird({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="108" rx="30" ry="7" fill="#0b1317" opacity="0.3" />
      <path d="M25 65 C 25 35, 42 22, 60 22 C 78 22, 95 35, 95 65 C 95 88, 80 98, 60 98 C 40 98, 25 88, 25 65 Z" fill="#1cb0f6" />
      <path d="M38 68 C 38 50, 50 44, 60 44 C 70 44, 82 50, 82 68 C 82 84, 72 92, 60 92 C 48 92, 38 84, 38 68 Z" fill="#6dd5fa" />
      <path d="M27 60 C 15 52, 10 72, 28 76 Z" fill="#1898d5" />
      <path d="M93 60 C 105 52, 110 72, 92 76 Z" fill="#1898d5" />
      <circle cx="48" cy="50" r="12" fill="#6dd5fa" />
      <circle cx="72" cy="50" r="12" fill="#6dd5fa" />
      <circle cx="48" cy="50" r="9" fill="white" />
      <circle cx="72" cy="50" r="9" fill="white" />
      <circle cx="50" cy="50" r="5" fill="#131f24" />
      <circle cx="74" cy="50" r="5" fill="#131f24" />
      <circle cx="52" cy="48" r="2" fill="white" />
      <circle cx="76" cy="48" r="2" fill="white" />
      <path d="M56 57 L64 57 L60 64 Z" fill="#ff9600" />
      <ellipse cx="44" cy="100" rx="8" ry="5" fill="#ff9600" />
      <ellipse cx="76" cy="100" rx="8" ry="5" fill="#ff9600" />
    </svg>
  );
}

function OrangeBird({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="108" rx="28" ry="6" fill="#0b1317" opacity="0.3" />
      <path d="M25 65 C 25 35, 42 22, 60 22 C 78 22, 95 35, 95 65 C 95 88, 80 98, 60 98 C 40 98, 25 88, 25 65 Z" fill="#ff9600" />
      <path d="M38 68 C 38 50, 50 44, 60 44 C 70 44, 82 50, 82 68 C 82 84, 72 92, 60 92 C 48 92, 38 84, 38 68 Z" fill="#ffca28" />
      <path d="M27 60 C 15 52, 10 70, 28 74 Z" fill="#e08600" />
      <path d="M93 60 C 105 52, 110 70, 92 74 Z" fill="#e08600" />
      <circle cx="48" cy="50" r="11" fill="#ffca28" />
      <circle cx="72" cy="50" r="11" fill="#ffca28" />
      <circle cx="48" cy="50" r="8" fill="white" />
      <circle cx="72" cy="50" r="8" fill="white" />
      <circle cx="50" cy="50" r="4.5" fill="#131f24" />
      <circle cx="74" cy="50" r="4.5" fill="#131f24" />
      <circle cx="52" cy="48" r="1.8" fill="white" />
      <circle cx="76" cy="48" r="1.8" fill="white" />
      <path d="M56 57 L64 57 L60 63 Z" fill="#e03232" />
      {/* Crown */}
      <path d="M50 28 L55 20 L60 26 L65 18 L70 28" stroke="#ffc800" strokeWidth="3" strokeLinejoin="round" fill="none" />
      <ellipse cx="44" cy="100" rx="7" ry="4" fill="#ff9600" />
      <ellipse cx="76" cy="100" rx="7" ry="4" fill="#ff9600" />
    </svg>
  );
}
