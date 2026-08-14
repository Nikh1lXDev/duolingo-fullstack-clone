"use client";

import * as React from "react";

export interface AvatarConfig {
  skinTone?: string;  // hex color
  hair?: string;      // option key
  hairColor?: string; // hex color
  eyes?: string;      // option key
  mouth?: string;     // option key
  accessory?: string; // option key
  clothing?: string;  // option key
  clothingColor?: string; // hex color
  background?: string; // hex color
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: "#a0522d",
  hair: "none",
  hairColor: "#3d2314",
  eyes: "normal",
  mouth: "smile",
  accessory: "none",
  clothing: "shirt",
  clothingColor: "#9b59ff",
  background: "#ddf4ff",
};

export const SKIN_TONES = [
  "#3d1c0c", "#5c2c0e", "#7a3b1e", "#8b4513", "#a0522d",
  "#b87333", "#c68642", "#d2916a", "#e8b89a", "#f0cba8",
  "#f5d5b2", "#fce8d0", "#ffe4c4", "#fff0e0",
];

export const HAIR_OPTIONS: { key: string; label: string }[] = [
  { key: "none", label: "Bald" },
  { key: "short", label: "Short" },
  { key: "long", label: "Long" },
  { key: "curly", label: "Curly" },
  { key: "afro", label: "Afro" },
];

export const EYE_OPTIONS: { key: string; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "happy", label: "Happy" },
  { key: "sleepy", label: "Sleepy" },
];

export const MOUTH_OPTIONS: { key: string; label: string }[] = [
  { key: "smile", label: "Smile" },
  { key: "grin", label: "Grin" },
  { key: "open", label: "Open" },
];

export const ACCESSORY_OPTIONS: { key: string; label: string }[] = [
  { key: "none", label: "None" },
  { key: "glasses", label: "Glasses" },
  { key: "sunglasses", label: "Sunglasses" },
  { key: "hat", label: "Hat" },
];

export const CLOTHING_OPTIONS: { key: string; label: string }[] = [
  { key: "shirt", label: "T-Shirt" },
  { key: "hoodie", label: "Hoodie" },
  { key: "dress", label: "Dress" },
  { key: "jacket", label: "Jacket" },
];

export const CLOTHING_COLORS = [
  "#9b59ff", "#58cc02", "#1cb0f6", "#ff9600", "#ff4b4b",
  "#00cd9c", "#e91e8c", "#ffc800", "#3498db", "#2ecc71",
  "#e74c3c", "#f39c12", "#1abc9c", "#9b59b6", "#34495e",
];

export const HAIR_COLORS = [
  "#000000", "#3d2314", "#5c3317", "#7b3f00", "#a0522d",
  "#c4830a", "#daa520", "#ffd700", "#d3d3d3", "#808080",
  "#cc4444", "#aa2222", "#4444cc", "#9b59ff",
];

interface AvatarPreviewProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * AvatarPreview — SVG layered avatar that updates immediately with config changes.
 */
export function AvatarPreview({
  config = DEFAULT_AVATAR_CONFIG,
  size = 200,
  className = "",
  animate = false,
}: AvatarPreviewProps) {
  const merged = { ...DEFAULT_AVATAR_CONFIG, ...config };

  const {
    skinTone = "#a0522d",
    hairColor = "#3d2314",
    eyes = "normal",
    mouth = "smile",
    accessory = "none",
    clothing = "shirt",
    clothingColor = "#9b59ff",
    hair = "none",
    background = "#ddf4ff",
  } = merged;

  // Darken skin for shadows/shading
  const skinDark = darkenColor(skinTone, 0.25);

  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      xmlns="http://www.w3.org/2000/svg"
      className={`${animate ? "animate-bounce-slow" : ""} ${className}`}
      aria-label="Avatar preview"
    >
      {/* Background circle */}
      <circle cx="100" cy="105" r="95" fill={background} />

      {/* Body / Clothing */}
      <ClothingLayer clothing={clothing} clothingColor={clothingColor} />

      {/* Neck */}
      <rect x="88" y="148" width="24" height="20" rx="4" fill={skinTone} />

      {/* Head */}
      <rect x="60" y="65" width="80" height="90" rx="30" fill={skinTone} />

      {/* Ear left */}
      <ellipse cx="62" cy="108" rx="10" ry="12" fill={skinTone} />
      <ellipse cx="62" cy="108" rx="5" ry="7" fill={skinDark} />

      {/* Ear right */}
      <ellipse cx="138" cy="108" rx="10" ry="12" fill={skinTone} />
      <ellipse cx="138" cy="108" rx="5" ry="7" fill={skinDark} />

      {/* Eyes */}
      <EyeLayer eyes={eyes} />

      {/* Eyebrows */}
      <path d="M76 88 Q85 84 90 88" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M110 88 Q115 84 124 88" stroke={hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M97 107 Q100 112 103 107" stroke={skinDark} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Mouth */}
      <MouthLayer mouth={mouth} />

      {/* Hair */}
      {hair !== "none" && <HairLayer hair={hair} hairColor={hairColor} />}

      {/* Accessory */}
      {accessory !== "none" && <AccessoryLayer accessory={accessory} />}

      {/* Shadow at bottom */}
      <ellipse cx="100" cy="235" rx="50" ry="8" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

function ClothingLayer({ clothing, clothingColor }: { clothing: string; clothingColor: string }) {
  const dark = darkenColor(clothingColor, 0.2);
  switch (clothing) {
    case "hoodie":
      return (
        <>
          <path d="M45 200 Q55 160 100 160 Q145 160 155 200 L160 240 L40 240 Z" fill={clothingColor} />
          <path d="M100 160 L100 185" stroke={dark} strokeWidth="3" />
          <rect x="90" y="160" width="20" height="8" rx="3" fill={dark} />
        </>
      );
    case "dress":
      return (
        <path d="M40 195 Q55 155 80 155 L100 168 L120 155 Q145 155 160 195 L165 240 L35 240 Z" fill={clothingColor} />
      );
    case "jacket":
      return (
        <>
          <path d="M45 200 Q55 160 100 160 Q145 160 155 200 L160 240 L40 240 Z" fill={clothingColor} />
          <rect x="96" y="160" width="8" height="50" fill={dark} />
          <path d="M45 200 Q60 170 80 165" stroke={dark} strokeWidth="4" fill="none" />
          <path d="M155 200 Q140 170 120 165" stroke={dark} strokeWidth="4" fill="none" />
        </>
      );
    default: // shirt
      return (
        <path d="M50 200 Q60 162 100 162 Q140 162 150 200 L155 240 L45 240 Z" fill={clothingColor} />
      );
  }
}

function EyeLayer({ eyes }: { eyes: string }) {
  switch (eyes) {
    case "happy":
      return (
        <>
          <path d="M76 100 Q83 93 90 100" stroke="#131f24" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M110 100 Q117 93 124 100" stroke="#131f24" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      );
    case "sleepy":
      return (
        <>
          <ellipse cx="83" cy="100" rx="9" ry="5" fill="#131f24" />
          <ellipse cx="117" cy="100" rx="9" ry="5" fill="#131f24" />
          <path d="M74 97 Q83 92 92 97" stroke="#c9a070" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M108 97 Q117 92 126 97" stroke="#c9a070" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      );
    default: // normal
      return (
        <>
          <ellipse cx="83" cy="100" rx="9" ry="10" fill="white" />
          <ellipse cx="117" cy="100" rx="9" ry="10" fill="white" />
          <circle cx="85" cy="100" r="6" fill="#131f24" />
          <circle cx="119" cy="100" r="6" fill="#131f24" />
          <circle cx="87" cy="97" r="2" fill="white" />
          <circle cx="121" cy="97" r="2" fill="white" />
        </>
      );
  }
}

function MouthLayer({ mouth }: { mouth: string }) {
  switch (mouth) {
    case "grin":
      return (
        <>
          <path d="M80 120 Q100 135 120 120" stroke="#131f24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M82 122 Q100 135 118 122" fill="white" />
          <path d="M82 122 Q100 135 118 122" stroke="#131f24" strokeWidth="1" fill="none" />
        </>
      );
    case "open":
      return (
        <ellipse cx="100" cy="125" rx="13" ry="9" fill="#131f24" />
      );
    default: // smile
      return (
        <path d="M82 120 Q100 132 118 120" stroke="#131f24" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      );
  }
}

function HairLayer({ hair, hairColor }: { hair: string; hairColor: string }) {
  switch (hair) {
    case "long":
      return (
        <>
          <path d="M60 90 Q55 145 65 175 Q75 185 80 170 Q85 160 80 145 Q60 90 60 90" fill={hairColor} />
          <path d="M140 90 Q145 145 135 175 Q125 185 120 170 Q115 160 120 145 Q140 90 140 90" fill={hairColor} />
          <path d="M58 75 Q60 55 100 50 Q140 55 142 75 Q140 65 100 62 Q60 65 58 75" fill={hairColor} />
        </>
      );
    case "curly":
      return (
        <>
          <ellipse cx="100" cy="68" rx="42" ry="20" fill={hairColor} />
          <circle cx="72" cy="72" r="12" fill={hairColor} />
          <circle cx="128" cy="72" r="12" fill={hairColor} />
          <circle cx="86" cy="63" r="10" fill={hairColor} />
          <circle cx="114" cy="63" r="10" fill={hairColor} />
          <circle cx="100" cy="60" r="11" fill={hairColor} />
        </>
      );
    case "afro":
      return (
        <circle cx="100" cy="78" r="46" fill={hairColor} />
      );
    default: // short
      return (
        <path
          d="M58 75 Q58 50 100 48 Q142 50 142 75 Q138 60 100 58 Q62 60 58 75"
          fill={hairColor}
        />
      );
  }
}

function AccessoryLayer({ accessory }: { accessory: string }) {
  switch (accessory) {
    case "glasses":
      return (
        <>
          <rect x="70" y="95" width="22" height="16" rx="5" fill="none" stroke="#555" strokeWidth="2.5" />
          <rect x="108" y="95" width="22" height="16" rx="5" fill="none" stroke="#555" strokeWidth="2.5" />
          <line x1="92" y1="103" x2="108" y2="103" stroke="#555" strokeWidth="2.5" />
          <line x1="60" y1="103" x2="70" y2="103" stroke="#555" strokeWidth="2" />
          <line x1="130" y1="103" x2="140" y2="103" stroke="#555" strokeWidth="2" />
        </>
      );
    case "sunglasses":
      return (
        <>
          <rect x="68" y="95" width="24" height="16" rx="5" fill="#1a1a2e" />
          <rect x="108" y="95" width="24" height="16" rx="5" fill="#1a1a2e" />
          <line x1="92" y1="103" x2="108" y2="103" stroke="#444" strokeWidth="2.5" />
          <line x1="58" y1="103" x2="68" y2="103" stroke="#444" strokeWidth="2" />
          <line x1="132" y1="103" x2="142" y2="103" stroke="#444" strokeWidth="2" />
          {/* Lens shine */}
          <path d="M73 98 Q76 96 80 99" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
          <path d="M113 98 Q116 96 120 99" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
        </>
      );
    case "hat":
      return (
        <>
          <ellipse cx="100" cy="67" rx="48" ry="12" fill="#2c3e50" />
          <rect x="68" y="20" width="64" height="48" rx="8" fill="#2c3e50" />
          <rect x="72" y="22" width="56" height="10" fill="#3d5166" />
        </>
      );
    default:
      return null;
  }
}

/** Darken a hex color by a factor 0–1 */
function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - factor));
  const dg = Math.round(g * (1 - factor));
  const db = Math.round(b * (1 - factor));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}
