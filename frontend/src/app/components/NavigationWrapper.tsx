"use client";


import React from "react";
import CommunityJoinModal from "./CommunityJoinModal";
import ModernBottomNav from "./ModernBottomNav";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  return (
    <>
      <CommunityJoinModal />
      {children}
      <ModernBottomNav />
    </>
  );
}
