"use client";

import React, { useState } from "react";
import { useAttendance } from "@/hooks/query";
import { AttendanceDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import {
  Calculator,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  BookOpenCheck,
} from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import ShinyText from "@/components/ShinyText";
import { BarChart } from "@mui/x-charts/BarChart";

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

  const safeSubjects = data.filter((item) => Number(item.courseAttendance) >= 75).length;
  const riskySubjects = data.length - safeSubjects;
  const totalMargin = data.reduce((acc, item) => {
    if (item.courseAttendanceStatus?.status === "margin") {
      return acc + Number(item.courseAttendanceStatus.classes || 0);
    }
    return acc;
  }, 0);
  const attendanceGraphData = [...data]
    .sort((a, b) => Number(b.courseAttendance) - Number(a.courseAttendance))
    .map((item) => ({
      label: item.courseCode,
      attendance: Number(item.courseAttendance),
      color: Number(item.courseAttendance) >= 75 ? "#34d399" : "#f87171",
    }));

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-24 px-3 w-full min-h-screen">
      <div className="mb-8">
        <div>
          <h1 className="text-2xl text-white tracking-tight mb-2 font-space-grotesk">Attendance</h1>
          <p className="text-sm text-zinc-400 max-w-3xl">
            This page is written like a student summary. You can quickly see which subjects are safe, where you are short,
            and how your attendance changes if you miss more classes.
          </p>
        </div>
      </div>

      <Card className="border-zinc-800/50 bg-zinc-900/25 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Attendance Graph</div>
            <h2 className="mt-2 text-xl text-white font-display">Subject-wise attendance at a glance</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Green bars are safe. Red bars are below the 75% requirement.
            </p>
          </div>
          <div className="text-xs text-zinc-500">Target attendance: 75%</div>
        </div>

        <div className="mt-4 h-72 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3">
          <BarChart
            xAxis={[
              {
                data: attendanceGraphData.map((item) => item.label),
                scaleType: "band",
                tickLabelStyle: { fill: "#a1a1aa", fontSize: 10 },
              },
            ]}
            yAxis={[
              {
                min: 0,
                max: 100,
                tickLabelStyle: { fill: "#a1a1aa", fontSize: 10 },
              },
            ]}
            series={[
              {
                data: attendanceGraphData.map((item) => item.attendance),
                color: "#d4af37",
                valueFormatter: (value) => `${value}%`,
              },
            ]}
            height={260}
            grid={{ horizontal: true }}
            sx={{
              ".MuiBarElement-root": {
                fill: "#d4af37",
              },
              ".MuiChartsAxis-line": { stroke: "#3f3f46" },
              ".MuiChartsAxis-tick": { stroke: "#3f3f46" },
              ".MuiChartsGrid-line": { stroke: "#27272a" },
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {attendanceGraphData.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                item.attendance >= 75
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/20 bg-red-500/10 text-red-200"
              }`}
            >
              {item.label}: {item.attendance}%
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <BookOpenCheck size={14} />
            Overall
          </div>
          <div className="mt-3 text-3xl font-semibold text-white">{data.length}</div>
          <p className="mt-2 text-sm text-zinc-400">Subjects tracked this semester.</p>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <ShieldCheck size={14} />
            Safe
          </div>
          <div className="mt-3 text-3xl font-semibold text-emerald-200">{safeSubjects}</div>
          <p className="mt-2 text-sm text-zinc-400">Subjects currently at or above 75% attendance.</p>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <ShieldAlert size={14} />
            Missable
          </div>
          <div className="mt-3 text-3xl font-semibold text-amber-100">{totalMargin}</div>
          <p className="mt-2 text-sm text-zinc-400">Total classes you can still miss across safe subjects.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-classivo-text-grey uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-premium-gold"></div>
          Theory Subjects
        </h2>
        <Data data={data} category="theory" />
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-classivo-text-grey uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          Practical Subjects
        </h2>
        <Data data={data} category="practical" />
      </div>

      {riskySubjects > 0 ? (
        <Card className="border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 text-red-300" size={18} />
            <div>
              <div className="text-sm font-medium text-red-200">Attendance warning</div>
              <div className="mt-1 text-sm text-zinc-300">
                {riskySubjects} subject{riskySubjects > 1 ? "s are" : " is"} below 75%. Open those cards and use the
                prediction slider to see how much more attendance can drop.
              </div>
            </div>
          </div>
        </Card>
      ) : null}
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
        const statusLabel = item.courseAttendanceStatus?.status === "required"
          ? `Need ${item.courseAttendanceStatus.classes} class${item.courseAttendanceStatus.classes === 1 ? "" : "es"}`
          : `Can miss ${item.courseAttendanceStatus?.classes ?? 0} more`;

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
              <div className="flex justify-between items-start mb-3  px-3">
                <Badge variant="outline" className="font-mono text-[10px] h-[28px] uppercase font-medium border">
                  {item.courseCode}
                </Badge>
                <Badge
                  variant="outline"
                  className={isSafe ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-red-400/20 bg-red-400/10 text-red-200"}
                >
                  {isSafe ? "Safe" : "Need attention"}
                </Badge>
              </div>
              <div className="h-[1px] w-full bg-white/10"></div>
              <div className="px-4 pt-2">
                <h3 className="text-lg font-medium text-white -mb-2 line-clamp-2 min-h-[3.5rem]">
                  {item.courseTitle}
                </h3>
                <p className="mt-3 text-xs text-zinc-400">{statusLabel}</p>
              </div>
              <div className="mb-6  px-4">
                <div className="flex justify-between items-end mb-2 ml-1">
                  <span className="text-2xl font-medium text-white tracking-tighter">
                    {attendance}<span className="text-xl text-zinc-400">%</span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    {attended} attended / {item.courseConducted} total
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden relative">
                  <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-white/20 z-20"></div>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative z-10 ${isSafe ? 'bg-white/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-glow-red'}`}
                    style={{ width: `${attendance}%` }}
                  ></div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 px-6">
                  <div className="flex items-center gap-2 mb-4 text-premium-gold">
                    <Calculator size={16} />
                    <span className="text-sm font-medium uppercase tracking-wider">Prediction</span>
                  </div>

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
                        If I miss the next...
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
                        <span className="text-xs text-Classivo-text-grey">Projected attendance after missing {missClasses}</span>
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


