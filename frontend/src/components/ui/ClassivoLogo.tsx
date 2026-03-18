import React from 'react';

export const ClassivoLogo = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    fill="none" 
    className={className}
  >
    <rect width="100" height="100" rx="24" fill="currentColor" fillOpacity="0.1" />
    <path 
      d="M65 35 C60 25 40 25 35 35 C30 45 30 55 35 65 C40 75 60 75 65 65" 
      stroke="currentColor" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    <circle cx="50" cy="50" r="12" fill="currentColor" fillOpacity="0.2" />
  </svg>
);