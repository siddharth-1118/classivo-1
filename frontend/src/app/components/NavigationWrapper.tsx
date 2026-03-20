"use client";


import React from "react";
import ModernBottomNav from "./ModernBottomNav";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  return (
    <>
      {children}
      <ModernBottomNav />
    </>
  );
}


