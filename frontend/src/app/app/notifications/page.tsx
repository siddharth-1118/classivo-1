"use client";

import React from "react";
import { Construction, ChevronLeft } from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import Link from "next/link";

export default function NotificationPage() {
  return (
    <main className="w-full text-white flex items-center justify-center p-4 h-screen">
      <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
      <Card className="max-w-md w-full p-8 flex flex-col items-center text-center space-y-6 bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl">
        <div className="p-4 bg-amber-500/10 rounded-full ring-1 ring-amber-500/20">
          <Construction className="w-12 h-12 text-amber-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Work in Progress
          </h1>
          <p className="text-zinc-400">
            We're crafting a new notification experience. Check back soon for updates.
          </p>
        </div>
      </Card>
    </main>
  );
}
