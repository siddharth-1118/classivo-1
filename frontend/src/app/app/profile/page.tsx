"use client";

import React from "react";
import { useUserInfo } from "@/hooks/query";
import { UserInfo } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Card } from "@/app/components/ui/Card";
import { User, Phone, Book, Hash, Layers, ChevronLeft } from "lucide-react";
import Link from "next/link";

const Page = () => {
  const { data, isPending } = useUserInfo();
  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data)
    return (
      <main className="w-full text-white flex items-center justify-center p-4 h-screen">
        <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        <div className="flex h-screen w-full justify-center items-center text-zinc-500">
          No profile data found
        </div>
      </main>
    );

  return <Data data={data} />;
};

export default Page;

const Data = ({ data }: { data: UserInfo }) => {
  // Get initials
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen w-full text-white overflow-y-auto pb-20">
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 flex flex-col items-center gap-8">
        <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="relative group mt-12">
            <div className="absolute inset-0 bg-premium-gold/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="w-28 h-28 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center relative z-10 shadow-2xl">
              <span className="text-4xl font-bold text-white tracking-widest font-display">
                {initials}
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{data.name}</h1>
            <p className="text-sm text-zinc-500 font-medium bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
              {data.department}
            </p>
          </div>
        </div>

        {/* Info Cards */}

        <div className="mt-8 border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-zinc-900/20 border-white hover:bg-zinc-900/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/30 text-zinc-500 group-hover:text-premium-gold transition-colors">
                <Hash size={16} />
              </div>
              <span className="text-sm text-zinc-400 font-medium">Registration Number</span>
            </div>
            <span className="text-sm text-white font-mono tracking-wide">{data.regNumber}</span>
          </div>
          <div className="h-[1px] bg-white/5"></div>
          <div className="flex items-center justify-between p-4 bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/30 text-zinc-500 group-hover:text-premium-gold transition-colors">
                <Phone size={16} />
              </div>
              <span className="text-sm text-zinc-400 font-medium">Mobile</span>
            </div>
            <span className="text-sm text-white font-mono tracking-wide">{data.mobile}</span>
          </div>
          <div className="h-[1px] bg-white/5"></div>
          <div className="flex items-center justify-between p-4 bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/30 text-zinc-500 group-hover:text-premium-gold transition-colors">
                <Layers size={16} />
              </div>
              <span className="text-sm text-zinc-400 font-medium">Semester</span>
            </div>
            <span className="text-sm text-white font-mono tracking-wide">{data.semester}</span>
          </div>
          <div className="h-[1px] bg-white/5"></div>
          <div className="flex items-center justify-between p-4 bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/30 text-zinc-500 group-hover:text-premium-gold transition-colors">
                <Book size={16} />
              </div>
              <span className="text-sm text-zinc-400 font-medium">Section</span>
            </div>
            <span className="text-sm text-white font-mono tracking-wide">{data.section}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-700 mt-4">
          Academic details synced from portal.
        </p>

      </div>
    </main>
  );
};

