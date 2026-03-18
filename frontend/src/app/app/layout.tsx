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
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex-1">
        {children}
      </div>
      <div className="pb-24 pt-4 text-center text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        made by vss
      </div>
    </div>
  );
}
