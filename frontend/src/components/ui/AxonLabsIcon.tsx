"use client";

import React from "react";

type AxonLabsIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function AxonLabsIcon({ className, size, width, height, ...props }: AxonLabsIconProps) {
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
      <rect x="4" y="4" width="56" height="56" rx="20" fill="url(#axon-bg)" />
      <circle cx="32" cy="32" r="13" fill="#081226" stroke="#1F9DFF" strokeWidth="1.5" />
      <path d="M17 23C13 26.5 13 37.5 17 41" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M47 23C51 26.5 51 37.5 47 41" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M21 19C15 24 15 40 21 45" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M43 19C49 24 49 40 43 45" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 19V26" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 38V45" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 32H26" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 32H45" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.5" fill="#E5F3FF" />
      <circle cx="32" cy="17" r="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="47" cy="32" r="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="17" cy="32" r="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="32" cy="47" r="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <defs>
        <linearGradient id="axon-bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#081226" />
          <stop offset="1" stopColor="#14386C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
