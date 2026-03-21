"use client";
import React from "react";

export interface LoaderProps {
  size?: string;
  strokeColor?: string;
  fillColor?: string;
  speed?: number;
  className?: string;
  strokeLength?: number;
}

export const Loader = ({
  size = "h-12 w-12",
  strokeColor = "border-amber-200/40",
  className = "",
}: LoaderProps) => {
  return (
    <div className={`relative flex items-center justify-center ${size} ${className}`}>
      <div className={`loader-ring absolute inset-0 rounded-full border ${strokeColor} bg-white/5`}>
        <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-premium-gold shadow-[0_0_14px_rgba(212,175,55,0.8)]" />
      </div>
      <div className="h-[58%] w-[58%] rounded-full border border-white/10 bg-black/25" />
    </div>
  );
};

export const GlobalLoader = (props?: LoaderProps) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader {...props} />
    </div>
  );
};
