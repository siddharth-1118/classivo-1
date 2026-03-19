"use client";

import React from "react";

type MinimixIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function MinimixIcon({ className, size, width, height, ...props }: MinimixIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      width={width ?? size}
      height={height ?? size}
      {...props}
    >
      <rect x="4" y="4" width="56" height="56" rx="20" fill="url(#minimix-bg)" />
      <path d="M15 22C21 16 29 14 37 16C44 17.5 50 22 51 29" stroke="#312E81" strokeWidth="4" strokeLinecap="round" />
      <path d="M13 37C14.5 44 20 49 28 50C36 51 45 47 50 40" stroke="#312E81" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="25" r="5" fill="#F97316" stroke="#312E81" strokeWidth="2" />
      <circle cx="41" cy="20" r="4" fill="#38BDF8" stroke="#312E81" strokeWidth="2" />
      <circle cx="45" cy="40" r="5" fill="#FACC15" stroke="#312E81" strokeWidth="2" />
      <circle cx="21" cy="42" r="4" fill="#22C55E" stroke="#312E81" strokeWidth="2" />
      <path d="M24 25L41 20" stroke="#312E81" strokeWidth="2.5" />
      <path d="M24 25L21 42" stroke="#312E81" strokeWidth="2.5" />
      <path d="M21 42L45 40" stroke="#312E81" strokeWidth="2.5" />
      <path d="M41 20L45 40" stroke="#312E81" strokeWidth="2.5" />
      <defs>
        <linearGradient id="minimix-bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" />
          <stop offset="0.55" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
