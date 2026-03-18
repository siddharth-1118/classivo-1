"use client";

import React from "react";
import { useUserInfo } from "@/hooks/query";
import { UserInfo } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Hash, Phone, Book, Layers, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const Page = () => {
  const { data, isPending } = useUserInfo();
  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data) {
    return (
      <main className="w-full text-white flex items-center justify-center p-4 h-screen">
        <div className="absolute top-6 left-6 rounded-full border border-white/10 bg-white/5 p-3 backdrop-blur-xl"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        <div className="flex h-screen w-full justify-center items-center text-zinc-500">No profile data found</div>
      </main>
    );
  }

  return <Data data={data} />;
};

export default Page;

const Data = ({ data }: { data: UserInfo }) => {
  const initials = data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen w-full text-white overflow-y-auto pb-20">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
                <Sparkles size={12} />
                Student Profile
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Academic Profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                Profile information synchronized from the academic portal, presented in a refined premium layout.
              </p>
            </div>
            <Link href="/app/settings" className="rounded-full border border-white/10 bg-white/5 p-3 text-zinc-300 transition hover:bg-white/10 hover:text-white">
              <ChevronLeft size={22} />
            </Link>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-premium-gold/20 blur-2xl" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-black/25 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                <span className="text-4xl font-bold tracking-widest text-white font-display">{initials}</span>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">{data.name}</h2>
              <p className="mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
                {data.department}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <ProfileRow icon={<Hash size={16} />} label="Registration Number" value={data.regNumber} />
            <ProfileRow icon={<Phone size={16} />} label="Mobile" value={data.mobile} />
            <ProfileRow icon={<Layers size={16} />} label="Semester" value={String(data.semester)} />
            <ProfileRow icon={<Book size={16} />} label="Section" value={data.section} />
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">Academic details synced from portal.</p>
        </div>
      </div>
    </main>
  );
};

const ProfileRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400">{icon}</div>
      <span className="text-sm font-medium text-zinc-300">{label}</span>
    </div>
    <span className="text-sm font-mono tracking-wide text-white">{value}</span>
  </div>
);
