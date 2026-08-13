import * as React from "react";

export function MascotPlaceholder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* An original, abstract, playful mascot (a little round star character) */}
      <circle cx="50" cy="50" r="45" fill="#ffc800" />
      <circle cx="50" cy="50" r="45" fill="url(#paint0_linear)" opacity="0.3" />
      
      {/* Eyes */}
      <circle cx="35" cy="40" r="8" fill="#ffffff" />
      <circle cx="35" cy="40" r="3" fill="#3c3c3c" />
      <circle cx="65" cy="40" r="8" fill="#ffffff" />
      <circle cx="65" cy="40" r="3" fill="#3c3c3c" />
      
      {/* Smile */}
      <path
        d="M35 60C40 68 60 68 65 60"
        stroke="#3c3c3c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="50"
          y1="5"
          x2="50"
          y2="95"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#dca300" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
