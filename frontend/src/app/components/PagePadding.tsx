"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function PagePadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // Only apply padding to app pages (routes starting with /app)
  const isAppPage = pathname.startsWith("/app");

  if (!isAppPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "12px" }}>
      {children}
    </div>
  );
}
