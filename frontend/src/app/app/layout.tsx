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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-premium-gold/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[12%] top-40 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
      />
      <div className="relative z-10 flex-1">
        {children}
      </div>
      <div className="relative z-10 pb-24 pt-4 text-center text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        made by vss
      </div>
    </div>
  );
}
