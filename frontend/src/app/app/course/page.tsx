"use client";

import { useCourse } from "@/hooks/query";
import React from "react";
import { CourseDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Book, User, MapPin, Clock, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import ShinyText from "@/components/ShinyText";

const Page = () => {
  const { data, isPending } = useCourse();
  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data || data.length === 0) {
    return (
      <main className="flex h-screen w-full justify-center items-center text-zinc-500">
        <div className="absolute top-6 left-6 rounded-full border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
          <Link href="/app/settings"><ChevronLeft size={24} /></Link>
        </div>
        <ShinyText text="No Course data found" speed={2} delay={0} color="#a1a1aa" shineColor="#ffffff" spread={120} direction="left" yoyo={false} pauseOnHover={false} />
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 pb-20 sm:px-6">
        <header className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
                <Sparkles size={12} />
                Course Directory
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Registered Courses</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                Review faculty information, slot allocation, room details, and credit values in a refined premium layout.
              </p>
            </div>
            <Link href="/app/settings" className="rounded-full border border-white/10 bg-white/5 p-3 text-zinc-300 transition hover:bg-white/10 hover:text-white">
              <ChevronLeft size={22} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Data data={data} />
        </div>
      </div>
    </main>
  );
};

export default Page;

const Data = ({ data }: { data: CourseDetail[] }) => {
  return (
    <>
      {data.map((item, i) => (
        <Card
          key={i}
          className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-black/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:bg-white/5"
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-zinc-300">
                  {item.courseCode}
                </span>
                <Badge variant="outline" className="border-premium-gold/20 bg-premium-gold/10 text-[10px] uppercase text-premium-gold">
                  {item.courseType}
                </Badge>
              </div>
              <h3 className="text-base font-medium leading-snug text-white">
                {item.courseTitle}
              </h3>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400">
              Credits
              <div className="inline-flex items-center rounded-full border border-premium-gold/20 bg-premium-gold/10 px-2 py-0.5 text-xs font-medium text-premium-gold">
                {item.courseCredit}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
            <div className="col-span-full flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300">
              <User size={14} className="shrink-0 text-zinc-500" />
              <span className="truncate">{item.courseFaculty}</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300">
              <Clock size={14} className="shrink-0 text-zinc-500" />
              <span className="truncate font-mono text-xs" title={Array.isArray(item.courseSlot) ? item.courseSlot.join(", ") : item.courseSlot}>
                {Array.isArray(item.courseSlot) ? item.courseSlot.join(", ") : item.courseSlot}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300">
              <MapPin size={14} className="shrink-0 text-zinc-500" />
              <span className="font-mono text-xs">{item.courseRoomNo || "N/A"}</span>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};
