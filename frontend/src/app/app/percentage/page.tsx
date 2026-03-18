"use client";

import { useCourse, useMarks } from "@/hooks/query";
import React from "react";
import { GlobalLoader } from "../components/loader";
import { formatNumber, formatPercentage, roundTo } from "@/utils/number";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Percent, TrendingUp, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const PercentagePage = () => {
  const { data: marks, isPending } = useMarks();
  const { data: courses } = useCourse();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!marks || marks.length === 0) {
    return (
      <div className="flex h-screen w-full justify-center items-center text-zinc-500">
        <div className="absolute top-6 left-6 rounded-full border border-white/10 bg-white/5 p-3 backdrop-blur-xl"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        No academic data found
      </div>
    );
  }

  const totalObtained = marks.reduce((acc, m) => acc + (m.total?.obtained || 0), 0);
  const totalMax = marks.reduce((acc, m) => acc + (m.total?.maxMark || 0), 0);
  const totalPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const roundedTotalObtained = roundTo(totalObtained, 1);
  const roundedTotalMax = roundTo(totalMax, 1);
  const roundedTotalPercentage = formatPercentage(totalPercentage, 2);

  const normalize = (val?: string) => (val ?? "").replace(/\s+/g, "").toLowerCase();

  const withCourseMeta = marks
    .map((m) => {
      const c = courses?.find((cc) => normalize(cc.courseCode) === normalize(m.course));
      const percent = m.total?.maxMark ? (m.total.obtained / m.total.maxMark) * 100 : 0;
      return {
        code: m.course,
        title: c?.courseTitle || m.course,
        percent: roundTo(percent, 2),
        obtained: roundTo(m.total?.obtained || 0, 1),
        max: roundTo(m.total?.maxMark || 0, 1),
      };
    })
    .sort((a, b) => b.percent - a.percent);

  return (
    <main className="min-h-screen w-full text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 pb-20 sm:px-6">
        <header className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
                <Sparkles size={12} />
                Percentage Overview
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Percentage Summary</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                A premium overview of your overall aggregate and subject-level performance.
              </p>
            </div>
            <Link href="/app/settings" className="rounded-full border border-white/10 bg-white/5 p-3 text-zinc-300 transition hover:bg-white/10 hover:text-white">
              <ChevronLeft size={22} />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="flex flex-col items-center justify-center rounded-[24px] border border-white/10 bg-black/20 p-6 backdrop-blur-xl">
            <div className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Total Marks</div>
            <div className="text-2xl font-bold text-white font-display tracking-tight">
              {formatNumber(roundedTotalObtained, 1)} <span className="text-zinc-600 text-lg">/</span> {formatNumber(roundedTotalMax, 1)}
            </div>
          </Card>

          <Card className="relative flex flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-6 backdrop-blur-xl md:col-span-2">
            <div className="absolute inset-0 bg-premium-gold/5" />
            <div className="z-10 flex items-center gap-3 mb-1">
              <Percent size={18} className="text-premium-gold" />
              <span className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Overall Aggregate</span>
            </div>
            <div className="z-10 text-4xl sm:text-5xl font-bold text-white font-display tracking-tight">
              {roundedTotalPercentage}%
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp size={18} className="text-premium-gold" />
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Detailed Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {withCourseMeta.map((item, i) => (
              <Card key={i} className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-xl transition hover:bg-white/5">
                <div className="mb-4">
                  <div className="mb-2 flex justify-between items-start">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-zinc-300">
                      {item.code}
                    </span>
                    <Badge variant="outline" className={`${item.percent < 75 ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-premium-gold/20 bg-premium-gold/10 text-premium-gold"}`}>
                      {formatNumber(item.percent, 1)}%
                    </Badge>
                  </div>
                  <h3 className="min-h-[2.5rem] text-sm font-medium text-white/90 line-clamp-2">{item.title}</h3>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <span className="text-zinc-500">Score</span>
                  <div className="font-mono text-zinc-300">
                    <span className="font-semibold text-white">{formatNumber(item.obtained)}</span>
                    <span className="mx-1 text-zinc-600">/</span>
                    {formatNumber(item.max)}
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className={`${item.percent >= 75 ? "bg-gradient-to-r from-premium-gold to-amber-200" : "bg-gradient-to-r from-amber-500 to-orange-300"} h-full rounded-full`} style={{ width: `${Math.min(item.percent, 100)}%` }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PercentagePage;
