"use client";

import React from "react";

type ProjectsHubIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function ProjectsHubIcon({ className, size, width, height, ...props }: ProjectsHubIconProps) {
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
      <rect x="4" y="4" width="56" height="56" rx="20" fill="url(#projects-bg)" />
      <rect x="13" y="15" width="16" height="16" rx="5" fill="#F8FAFC" stroke="#1E3A8A" strokeWidth="2" />
      <rect x="35" y="15" width="16" height="16" rx="5" fill="#ECFEFF" stroke="#0F766E" strokeWidth="2" />
      <rect x="24" y="35" width="16" height="16" rx="5" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
      <path d="M29 23H35" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 35L19 31" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 35L45 31" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="21" cy="23" r="3.5" fill="#3B82F6" />
      <circle cx="43" cy="23" r="3.5" fill="#14B8A6" />
      <circle cx="32" cy="43" r="3.5" fill="#F59E0B" />
      <defs>
        <linearGradient id="projects-bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F172A" />
          <stop offset="0.55" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
    </svg>
  );
}
