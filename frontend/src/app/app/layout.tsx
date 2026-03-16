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
    <div className="w-full">
      {children}
    </div>
  );
}
