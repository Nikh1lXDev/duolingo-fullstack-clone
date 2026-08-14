"use client";

import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

export type MascotState =
  | "idle"
  | "thinking"
  | "happy"
  | "excited"
  | "sad"
  | "celebrating"
  | "concerned";

export interface AnimatedMascotProps {
  state?: MascotState;
  className?: string;
  size?: number; // px width/height of the SVG
}

/**
 * AnimatedMascot — centralized mascot animation system.
 * 
 * States:
 * - idle: subtle breathing/bob
 * - thinking: slow sway
 * - happy: bounce
 * - excited: fast bounce + sparkles
 * - sad: drooping / small shake
 * - celebrating: jump + spin sparkles
 * - concerned: wobble left-right
 * 
 * Respects prefers-reduced-motion.
 */
export function AnimatedMascot({ state = "idle", className = "", size = 120 }: AnimatedMascotProps) {
  const shouldReduce = useReducedMotion();

  // --- Body animation variants ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bodyVariants: Record<MascotState, any> = {
    idle: shouldReduce
      ? { y: 0 }
      : {
          y: [0, -4, 0],
          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        },
    thinking: shouldReduce
      ? { rotate: 0 }
      : {
          rotate: [-3, 3, -3],
          transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        },
    happy: shouldReduce
      ? { y: 0 }
      : {
          y: [0, -12, 0, -8, 0],
          transition: { duration: 0.6, ease: "easeOut" },
        },
    excited: shouldReduce
      ? { y: 0 }
      : {
          y: [0, -16, 0, -14, 0, -12, 0],
          transition: { duration: 0.8, repeat: Infinity, ease: "easeOut" },
        },
    sad: shouldReduce
      ? { y: 0 }
      : {
          y: [0, 4, 0],
          rotate: [-2, 2, -2, 2, 0],
          transition: { duration: 0.5 },
        },
    celebrating: shouldReduce
      ? { scale: 1 }
      : {
          y: [0, -20, 0, -16, 0],
          scale: [1, 1.05, 1],
          transition: { duration: 0.7, repeat: 2 },
        },
    concerned: shouldReduce
      ? { rotate: 0 }
      : {
          rotate: [-5, 5, -5, 5, 0],
          transition: { duration: 0.6 },
        },
  };

  // Eye expression based on state
  const eyeColor = {
    idle: "#131f24",
    thinking: "#131f24",
    happy: "#131f24",
    excited: "#131f24",
    sad: "#131f24",
    celebrating: "#131f24",
    concerned: "#131f24",
  }[state];

  // Mouth expression
  const mouthPath: Record<MascotState, string> = {
    idle:       "M88 105 Q100 115 112 105",
    thinking:   "M88 108 Q100 112 112 108",
    happy:      "M85 103 Q100 118 115 103",
    excited:    "M82 102 Q100 122 118 102",
    sad:        "M88 112 Q100 104 112 112",
    celebrating:"M80 100 Q100 124 120 100",
    concerned:  "M90 110 Q100 106 110 110",
  };

  // Eyebrow position (for concerned/sad)
  const showInnerBrow = state === "sad" || state === "concerned";
  const showHappyEyes = state === "happy" || state === "excited" || state === "celebrating";

  // Sparkles — shown in excited/celebrating
  const showSparkles = !shouldReduce && (state === "excited" || state === "celebrating");

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {showSparkles && (
          <motion.div
            key="sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0"
          >
            {[
              { x: -35, y: -30, delay: 0,    size: 6, color: "#ffc800" },
              { x: 38,  y: -38, delay: 0.1,  size: 8, color: "#58cc02" },
              { x: -42, y: 20,  delay: 0.2,  size: 5, color: "#ce82ff" },
              { x: 40,  y: 15,  delay: 0.15, size: 7, color: "#1cb0f6" },
            ].map((s, i) => (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: s.size,
                  height: s.size,
                  marginLeft: s.x,
                  marginTop: s.y,
                  backgroundColor: s.color,
                  borderRadius: "50%",
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: s.delay,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        animate={bodyVariants[state]}
      >
        {/* Shadow */}
        <ellipse cx="100" cy="175" rx="55" ry="12" fill="#0b1317" opacity="0.35" />

        {/* Feet */}
        <ellipse cx="78" cy="167" rx="12" ry="7" fill="#ff9600" />
        <ellipse cx="122" cy="167" rx="12" ry="7" fill="#ff9600" />

        {/* Body */}
        <path
          d="M45 105 C 45 55, 70 35, 100 35 C 130 35, 155 55, 155 105 C 155 145, 135 162, 100 162 C 65 162, 45 145, 45 105 Z"
          fill="#58cc02"
        />

        {/* Belly */}
        <path
          d="M62 110 C 62 80, 80 72, 100 72 C 120 72, 138 80, 138 110 C 138 140, 120 152, 100 152 C 80 152, 62 140, 62 110 Z"
          fill="#89e219"
        />

        {/* Wings */}
        <path d="M48 100 C 30 90, 25 120, 48 125 Z" fill="#46a302" />
        <path d="M152 100 C 170 90, 175 120, 152 125 Z" fill="#46a302" />

        {/* Eye Rings */}
        <circle cx="76" cy="80" r="22" fill="#89e219" />
        <circle cx="124" cy="80" r="22" fill="#89e219" />

        {/* White Eyes */}
        <circle cx="76" cy="80" r="17" fill="white" />
        <circle cx="124" cy="80" r="17" fill="white" />

        {/* Happy eyes (half-closed arcs) */}
        {showHappyEyes ? (
          <>
            <ellipse cx="76" cy="82" rx="9" ry="8" fill={eyeColor} />
            <rect x="67" y="72" width="18" height="8" fill="white" />
            <ellipse cx="124" cy="82" rx="9" ry="8" fill={eyeColor} />
            <rect x="115" y="72" width="18" height="8" fill="white" />
          </>
        ) : (
          <>
            <circle cx="80" cy="80" r="9" fill={eyeColor} />
            <circle cx="128" cy="80" r="9" fill={eyeColor} />
          </>
        )}

        {/* Eye Highlights */}
        <circle cx="83" cy="77" r="3.5" fill="white" />
        <circle cx="131" cy="77" r="3.5" fill="white" />

        {/* Inner brows for sad/concerned */}
        {showInnerBrow && (
          <>
            <path d="M68 65 Q76 60 84 65" stroke="#46a302" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M116 65 Q124 60 132 65" stroke="#46a302" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Beak */}
        <path d="M92 92 L108 92 L100 108 Z" fill="#ff9600" />
        <path d="M94 92 L106 92 L100 100 Z" fill="#ffc800" />

        {/* Mouth expression */}
        <path
          d={mouthPath[state]}
          stroke="#46a302"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </motion.svg>
    </div>
  );
}
