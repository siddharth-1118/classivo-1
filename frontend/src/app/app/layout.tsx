import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CLASSIVO",
  description: "CLASSIVO - Academic Management System",
  verification: {
    google: "lqZoy4RwbD94xx4x_rz8CjmuvarmsG32kB5obHt0kdc",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-premium-background relative isolate flex min-h-screen w-full flex-col overflow-hidden">
      <div className="relative z-10 flex-1">
        {children}
      </div>
      <div className="relative z-10 pb-24 pt-4 text-center text-[10px] uppercase tracking-[0.22em] text-slate-400">
        made by vss
      </div>
    </div>
  );
}
