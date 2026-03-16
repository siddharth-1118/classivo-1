"use client";

import { useCourse, useMarks } from "@/hooks/query";
import React from "react";
import { GlobalLoader } from "../components/loader";
import { formatNumber, formatPercentage, roundTo } from "@/utils/number";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Percent, TrendingUp, ChevronLeft } from "lucide-react";
import Link from "next/link";

const PercentagePage = () => {
  const { data: marks, isPending } = useMarks();
  const { data: courses } = useCourse();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!marks || marks.length === 0)
    return (
      <div className="flex h-screen w-full justify-center items-center text-zinc-500">
        <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        No academic data found
      </div>
    );

  const totalObtained = marks.reduce((acc, m) => acc + (m.total?.obtained || 0), 0);
  const totalMax = marks.reduce((acc, m) => acc + (m.total?.maxMark || 0), 0);
  const totalPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const roundedTotalObtained = roundTo(totalObtained, 1);
  const roundedTotalMax = roundTo(totalMax, 1);
  const roundedTotalPercentage = formatPercentage(totalPercentage, 2);

  const normalize = (val?: string) => (val ?? "").replace(/\s+/g, "").toLowerCase();

  const withCourseMeta = marks.map((m) => {
    const c = courses?.find((cc) => normalize(cc.courseCode) === normalize(m.course));
    const percent = m.total?.maxMark ? (m.total.obtained / m.total.maxMark) * 100 : 0;
    const roundedPercent = roundTo(percent, 2);
    const roundedObtained = roundTo(m.total?.obtained || 0, 1);
    const roundedMax = roundTo(m.total?.maxMark || 0, 1);
    return {
      code: m.course,
      title: c?.courseTitle || m.course,
      type: m.category,
      percent: roundedPercent,
      obtained: roundedObtained,
      max: roundedMax,
    };
  }).sort((a, b) => b.percent - a.percent);

  return (
    <main className="flex flex-col gap-6 py-6 pb-20 px-4 sm:px-6 w-full max-w-5xl mx-auto min-h-screen">
      <div className="absolute top-6 left-6 bg-zinc-900/50 p-3 rounded-full border border-zinc-800"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
      {/* Header Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900/20 border-zinc-800/50">
          <div className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-1">Total Marks</div>
          <div className="text-2xl font-bold text-white font-display tracking-tight">
            {formatNumber(roundedTotalObtained, 1)} <span className="text-zinc-600 text-lg">/</span> {formatNumber(roundedTotalMax, 1)}
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900/20 border-zinc-800/50 md:col-span-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-premium-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-1">
            <Percent size={18} className="text-premium-gold" />
            <span className="text-zinc-500 text-xs uppercase tracking-widest font-medium">Overall Aggregate</span>
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-white font-display tracking-tight z-10">
            {roundedTotalPercentage}%
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <TrendingUp size={18} className="text-premium-gold" />
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Detailed Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {withCourseMeta.map((item, i) => (
            <Card key={i} className="flex flex-col justify-between p-4 bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800">
                    {item.code}
                  </span>
                  <Badge variant="outline" className={`border-premium-gold/20 bg-premium-gold/5 text-premium-gold ${item.percent < 75 ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : ''}`}>
                    {formatNumber(item.percent, 1)}%
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-white/90 line-clamp-2 min-h-[2.5rem]">
                  {item.title}
                </h3>
              </div>

              <div className="relative pt-2 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Score</span>
                <div className="font-mono text-zinc-300">
                  <span className="text-white font-semibold">{formatNumber(item.obtained)}</span>
                  <span className="text-zinc-600 mx-1">/</span>
                  {formatNumber(item.max)}
                </div>
              </div>

              {/* Progress Bar Visual */}
              <div className="mt-3 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.percent >= 75 ? 'bg-premium-gold' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PercentagePage;

