import * as React from "react";

export interface MascotProps {
  className?: string;
  variant?: "happy" | "waving" | "super";
}

export function Mascot({ className = "h-32 w-32", variant = "happy" }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer Glow / Shadow Base */}
      <ellipse cx="100" cy="170" rx="60" ry="14" fill="#0b1317" opacity="0.6" />

      {variant === "super" ? (
        // Super Flying Mascot
        <g>
          <path
            d="M50 120 C 30 80, 50 40, 100 30 C 150 40, 170 80, 150 120 C 140 150, 60 150, 50 120 Z"
            fill="url(#super-grad)"
          />
          {/* Wings */}
          <path d="M30 90 C 10 70, 0 100, 30 110 Z" fill="#ce82ff" />
          <path d="M170 90 C 190 70, 200 100, 170 110 Z" fill="#ce82ff" />
          {/* Eyes */}
          <circle cx="78" cy="75" r="16" fill="white" />
          <circle cx="122" cy="75" r="16" fill="white" />
          <circle cx="82" cy="75" r="8" fill="#131f24" />
          <circle cx="126" cy="75" r="8" fill="#131f24" />
          <circle cx="85" cy="72" r="3" fill="white" />
          <circle cx="129" cy="72" r="3" fill="white" />
          {/* Beak */}
          <path d="M94 88 L106 88 L100 102 Z" fill="#ff9600" />
        </g>
      ) : (
        // Friendly Green Owl Mascot
        <g>
          {/* Feet */}
          <ellipse cx="78" cy="165" rx="12" ry="7" fill="#ff9600" />
          <ellipse cx="122" cy="165" rx="12" ry="7" fill="#ff9600" />
          
          {/* Body */}
          <path
            d="M45 105 C 45 55, 70 35, 100 35 C 130 35, 155 55, 155 105 C 155 145, 135 162, 100 162 C 65 162, 45 145, 45 105 Z"
            fill="#58cc02"
          />
          
          {/* Belly Patch */}
          <path
            d="M62 110 C 62 80, 80 72, 100 72 C 120 72, 138 80, 138 110 C 138 140, 120 152, 100 152 C 80 152, 62 140, 62 110 Z"
            fill="#89e219"
          />

          {/* Wings */}
          {variant === "waving" ? (
            <>
              <path d="M48 100 C 30 70, 20 90, 38 115 Z" fill="#46a302" />
              <path d="M152 95 C 175 65, 190 75, 165 105 Z" fill="#46a302" />
            </>
          ) : (
            <>
              <path d="M48 100 C 30 90, 25 120, 48 125 Z" fill="#46a302" />
              <path d="M152 100 C 170 90, 175 120, 152 125 Z" fill="#46a302" />
            </>
          )}

          {/* Eye Rings / Face Pattern */}
          <circle cx="76" cy="80" r="22" fill="#89e219" />
          <circle cx="124" cy="80" r="22" fill="#89e219" />

          {/* White Eyes */}
          <circle cx="76" cy="80" r="17" fill="white" />
          <circle cx="124" cy="80" r="17" fill="white" />

          {/* Pupils */}
          <circle cx="80" cy="80" r="9" fill="#131f24" />
          <circle cx="128" cy="80" r="9" fill="#131f24" />

          {/* Eye Highlights */}
          <circle cx="83" cy="77" r="3.5" fill="white" />
          <circle cx="131" cy="77" r="3.5" fill="white" />

          {/* Orange Beak */}
          <path d="M92 92 L108 92 L100 108 Z" fill="#ff9600" />
          <path d="M94 92 L106 92 L100 100 Z" fill="#ffc800" />
        </g>
      )}

      <defs>
        <linearGradient id="super-grad" x1="50" y1="30" x2="150" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1cb0f6" />
          <stop offset="0.5" stopColor="#ce82ff" />
          <stop offset="1" stopColor="#ff4b4b" />
        </linearGradient>
      </defs>
    </svg>
  );
}
