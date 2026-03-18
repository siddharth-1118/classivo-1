"use client";

import React, { useState } from "react";
import FloatingMenuTrigger from "./FloatingMenuTrigger";
import Sidebar from "@/components/app/Sidebar";
import CommunityJoinModal from "./CommunityJoinModal";

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <FloatingMenuTrigger isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CommunityJoinModal />
      {children}
    </>
  );
}
