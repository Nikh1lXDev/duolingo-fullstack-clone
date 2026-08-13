import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Original Placeholder Logo representing a playful bird shape next to text */}
      <path
        d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5Z"
        fill="currentColor"
      />
      <path
        d="M25 15C25 16.6569 23.6569 18 22 18C20.3431 18 19 16.6569 19 15C19 13.3431 20.3431 12 22 12C23.6569 12 25 13.3431 25 15Z"
        fill="#ffffff"
      />
      <path
        d="M15 25C17 28 23 28 25 25"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="45"
        y="28"
        fontFamily="sans-serif"
        fontWeight="800"
        fontSize="24"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        lingoclone
      </text>
    </svg>
  );
}
