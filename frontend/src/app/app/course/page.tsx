"use client";

import { useCourse } from "@/hooks/query";
import React from "react";
import { CourseDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Book, User, MapPin, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ShinyText from "@/components/ShinyText";


const Page = () => {
  const { data, isPending } = useCourse();
  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data || data.length === 0)
    return (
      <main className="flex h-screen w-full justify-center items-center text-zinc-500">
        <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        <ShinyText
          text="No Course data found"
          speed={2}
          delay={0}
          color="#a1a1aa"
          shineColor="#ffffff"
          spread={120}
          direction="left"
          yoyo={false}
          pauseOnHover={false}
        />
      </main>
    );

  return (
    <main className="flex flex-col gap-6 py-6 pb-20 px-4 sm:px-6 w-full max-w-5xl mx-auto min-h-screen">
      <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
      <div className="flex items-center gap-2 mb-2 mt-10">
        <Book size={20} className="text-premium-gold" />
        <h1 className="text-xl font-semibold text-white tracking-tight">Your Courses</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Data data={data} />
      </div>
    </main>
  );
};

export default Page;

const Data = ({ data }: { data: CourseDetail[] }) => {
  return (
    <>
      {data.map((item, i) => {
        return (
          <Card key={i} className="flex flex-col p-5 bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group gap-4">

            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800">
                    {item.courseCode}
                  </span>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-400 font-normal uppercase`}>
                    {item.courseType}
                  </Badge>
                </div>
                <h3 className="font-medium text-white text-base leading-snug">
                  {item.courseTitle}
                </h3>
              </div>
              <div className="inline-flex items-center pl-2 pr-1 py-0.5 rounded-full text-xs font-medium bg-transparent text-zinc-400 border border-zinc-700 font-mono gap-0.5">
                Credits
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-premium-gold/10 text-premium-gold border border-premium-gold/20">{item.courseCredit}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div className="col-span-2 flex items-center gap-2 text-zinc-400">
                <User size={14} className="text-zinc-500 shrink-0" />
                <span className="text-zinc-300 truncate">{item.courseFaculty}</span>
              </div>

              <div className="flex items-center gap-2 text-zinc-400">
                <Clock size={14} className="text-zinc-500 shrink-0" />
                <span className="text-zinc-300 font-mono text-xs max-w-full truncate" title={Array.isArray(item.courseSlot) ? item.courseSlot.join(", ") : item.courseSlot}>
                  {Array.isArray(item.courseSlot) ? item.courseSlot.join(", ") : item.courseSlot}
                </span>
              </div>

              <div className="flex items-center gap-2 text-zinc-400 text-right justify-end">
                <MapPin size={14} className="text-zinc-500 shrink-0" />
                <span className="text-zinc-300 font-mono text-xs">{item.courseRoomNo || "N/A"}</span>
              </div>
            </div>

          </Card>
        );
      })}
    </>
  );
};

