"use client";

import React, { useState } from "react";
import { useAttendance } from "@/hooks/query";
import { AttendanceDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import {
  TrendingUp,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import ShinyText from "@/components/ShinyText";

const Page = () => {
  const { data, isPending } = useAttendance();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;

  if (!data || data.length === 0)
    return (
      <div className="flex w-full justify-center items-center h-screen">
        <ShinyText
          text="No attendance data found"
          speed={2}
          delay={0}
          color="#a1a1aa"
          shineColor="#ffffff"
          spread={120}
          direction="left"
          yoyo={false}
          pauseOnHover={false}
        />
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-24 px-3 w-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white tracking-tight mb-2 font-space-grotesk">Attendance Analysis</h1>
          <div className="tech-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-premium-gold animate-pulse"></span>
            <span>LIVE_PARSE_MODE_V2</span>
          </div>
        </div>
      </div>

      {/* Theory Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-classivo-text-grey uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
          Theory
        </h2>
        <Data data={data} category="theory" />
      </div>

      {/* Practical Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-classivo-text-grey uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          Practical
        </h2>
        <Data data={data} category="practical" />
      </div>
    </div>
  );
};

export default Page;
const Data = ({
  data,
  category,
}: {
  data: AttendanceDetail[];
  category: string;
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [missClasses, setMissClasses] = useState<number>(0);

  const filteredData = data.filter(
    (i) => i.courseCategory.toLowerCase() === category
  );

  const calculatePrediction = (item: AttendanceDetail, missedClasses: number) => {
    const currentAttended = item.courseConducted - item.courseAbsent;
    const totalAfterMissing = item.courseConducted + missedClasses;
    const newPercentage = totalAfterMissing > 0 ? (currentAttended / totalAfterMissing) * 100 : 0;
    return newPercentage.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredData.map((item, i) => {
        const isSelected = selectedCourse === `${category}-${i}`;
        const attendance = Number(item.courseAttendance);
        const isSafe = attendance >= 75;
        const attended = item.courseConducted - item.courseAbsent;

        return (
          <Card
            key={i}
            className={`
                relative overflow-hidden transition-all duration-300 group cursor-pointer
                ${isSelected ? 'ring-1 ring-premium-gold/50 bg-zinc-900' : 'hover:bg-zinc-900'}
            `}
            onClick={() => setSelectedCourse(isSelected ? null : `${category}-${i}`)}
          >
            {/* STITCH SCANNING EFFECT ON HOVER */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="scanning-line"></div>
            </div>

            {/* Glow Effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isSafe ? 'from-premium-gold/10' : 'from-red-500/10'} to-transparent blur-2xl -mr-10 -mt-10 pointer-events-none`}></div>

            <div className="pt-3 pb-0 relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-3  px-3">
                <Badge variant="outline" className="font-mono text-[10px] h-[28px] uppercase font-medium border">
                  {item.courseCode}
                </Badge>
                <div className="inline-flex items-center pl-2 pr-1 py-0.5 rounded-full text-xs font-medium bg-transparent text-zinc-400 border border-zinc-700 font-mono gap-0.5">
                  Margin {item.courseAttendanceStatus?.status === "required" ? (
                    <>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">-{item.courseAttendanceStatus.classes}</div>
                    </>
                  ) : item.courseAttendanceStatus?.classes === 0 ? (
                    <>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-premium-gold/10 text-premium-gold border border-premium-gold/20">{item.courseAttendanceStatus?.classes}</div>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-premium-gold/10 text-premium-gold border border-premium-gold/20">{item.courseAttendanceStatus?.classes}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="h-[1px] w-full bg-white/10"></div>
              {/* Title */}
              <div className="px-4 pt-2">
                <h3 className="text-lg font-medium text-white -mb-2 line-clamp-2 min-h-[3.5rem]">
                  {item.courseTitle}
                </h3>
              </div>
              {/* Progress Bar */}
              <div className="mb-6  px-4">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <span className="text-2xl font-medium text-white tracking-tighter">
                    {attendance}<span className="text-xl text-zinc-400">%</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden relative">
                  {/* Target Marker */}
                  <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-white/20 z-20"></div>

                  {/* Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative z-10 ${isSafe ? 'bg-white/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-glow-red'}`}
                    style={{ width: `${attendance}%` }}
                  ></div>
                </div>
              </div>

              {/* Prediction Calculator (Expandable) */}
              {isSelected && (
                <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 px-6">
                  <div className="flex items-center gap-2 mb-4 text-premium-gold">
                    <Calculator size={16} />
                    <span className="text-sm font-medium uppercase tracking-wider">Prediction</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-xs text-Classivo-text-grey uppercase tracking-wider mb-1">Total</div>
                      <div className="text-lg font-medium text-white">{item.courseConducted}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-xs text-Classivo-text-grey uppercase tracking-wider mb-1">Attended</div>
                      <div className="text-lg font-medium text-premium-gold">{attended}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                      <div className="text-xs text-Classivo-text-grey uppercase tracking-wider mb-1">Missed</div>
                      <div className="text-lg font-medium text-red-400">{item.courseAbsent}</div>
                    </div>
                  </div>

                  <div className="space-y-4 pb-4">
                    <div>
                      <label className="block text-xs text-Classivo-text-grey mb-2">
                        If I miss next...
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="15"
                          value={missClasses}
                          onChange={(e) => setMissClasses(parseInt(e.target.value) || 0)}
                          className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-premium-gold"
                        />
                        <span className="w-8 text-center font-mono text-white">{missClasses}</span>
                      </div>
                    </div>

                    {missClasses > 0 && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                        <span className="text-xs text-Classivo-text-grey">Projected Attendance</span>
                        <span className={`font-mono font-bold ${parseFloat(calculatePrediction(item, missClasses)) >= 75 ? 'text-premium-gold' : 'text-red-400'
                          }`}>
                          {calculatePrediction(item, missClasses)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};


