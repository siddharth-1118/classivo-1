"use client";
import { motion } from "motion/react";
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
  strokeColor = "stroke-neutral-500 dark:stroke-neutral-100",
  fillColor = "transparent",
  speed = 1.5,
  className = "",
  strokeLength = 0.25,
}: LoaderProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${size} ${strokeColor} ${className}`}
    >
      {/* Background Track */}
      <path
        d="M13 6l0 4l6 0l-8 11l0 -7l-6 0l8 -11l0 3Z"
        strokeOpacity="0.1"
        fill={fillColor}
      />

      {/* The Moving Train */}
      <motion.path
        // NEW PATH: Starts in the middle of the vertical line to hide the seam
        d="M13 6l0 4l6 0l-8 11l0 -7l-6 0l8 -11l0 3Z"
        fill="none"
        initial={{ pathLength: strokeLength }}
        animate={{ pathOffset: [0, 1] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </motion.svg>
  );
};

export const GlobalLoader = (props?: LoaderProps) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Loader {...props} />
    </div>
  );
};