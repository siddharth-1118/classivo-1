"use client";

import React, { useState, useMemo } from "react";
import { useAttendance, useCalendar, useTimetable } from "@/hooks/query";
import { AttendanceDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import {
  Calculator,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  BookOpenCheck,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import ShinyText from "@/components/ShinyText";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";

const normalize = (val?: string) =>
  (val ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

const CALENDAR_MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const formatCalendarLabel = (date: Date): string => {
  const suffix = String(date.getFullYear()).slice(-2);
  return `${CALENDAR_MONTH_LABELS[date.getMonth()]} '${suffix}`;
};

const AttendancePage = () => {
  const { data, isPending } = useAttendance();
  const { data: calendarData } = useCalendar();
  const { data: timetableData } = useTimetable();

  const [showRangePredict, setShowRangePredict] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-white tracking-tight mb-2 font-space-grotesk">Attendance</h1>
          <p className="text-sm text-zinc-400 max-w-3xl">
            This page is written like a student summary. You can quickly see which subjects are safe, where you are short,
            and how your attendance changes if you miss more classes.
          </p>
        </div>
        <button
          onClick={() => setShowRangePredict(!showRangePredict)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-premium-gold/10 border border-premium-gold/20 text-premium-gold hover:bg-premium-gold/20 transition-all text-sm font-medium"
        >
          <Calculator size={16} />
          {showRangePredict ? "Hide Range Predictor" : "Predict Attendance (Range)"}
          {showRangePredict ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showRangePredict && (
        <Card className="border-premium-gold/30 bg-premium-gold/5 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">From Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-premium-gold/50"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">To Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-premium-gold/50"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 italic">
              * The prediction assumes you will be absent for all classes in this date range.
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Attendance Distribution ✅</div>
              <h2 className="mt-2 text-xl text-white font-display">How many subjects are safe?</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Visual breakdown of your academic standing.
              </p>
            </div>
          </div>
          <div className="mt-4 h-64 flex items-center justify-center bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-4 relative overflow-hidden">
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: safeSubjects, label: "Safe", color: "#34d399" },
                    { id: 1, value: riskySubjects, label: "Risky", color: "#f87171" },
                  ],
                  innerRadius: 50,
                  outerRadius: 80,
                  paddingAngle: 5,
                  cornerRadius: 5,
                  cx: "50%",
                },
              ]}
              height={200}
              margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />
          </div>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">Attendance Graph 📈</div>
              <h2 className="mt-2 text-xl text-white font-display">Subject-wise Progress</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Performance across all your current subjects.
              </p>
            </div>
          </div>

          <div className="mt-4 h-64 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-3">
            <BarChart
              xAxis={[
                {
                  data: attendanceGraphData.map((item) => item.label),
                  scaleType: "band",
                  tickLabelStyle: { fill: "#a1a1aa", fontSize: 10 },
                },
              ]}
              series={[
                {
                  data: attendanceGraphData.map((item) => item.attendance),
                  color: "#d4af37",
                  valueFormatter: (v: number | null) => `${v?.toFixed(1)}%`,
                },
              ]}
              height={220}
              grid={{ horizontal: true }}
              sx={{
                ".MuiBarElement-root": { fill: "#d4af37" },
                ".MuiChartsAxis-line": { stroke: "#3f3f46" },
                ".MuiChartsAxis-tick": { stroke: "#3f3f46" },
                ".MuiChartsGrid-line": { stroke: "#27272a" },
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <BookOpenCheck size={14} />
            Overall Subjects
          </div>
          <div className="mt-3 text-3xl font-semibold text-white">{data.length}</div>
          <p className="mt-2 text-sm text-zinc-400 font-space-grotesk italic">Subjects tracked this semester.</p>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <ShieldCheck size={14} />
            Safe Zone
          </div>
          <div className="mt-3 text-3xl font-semibold text-emerald-200">{safeSubjects}</div>
          <p className="mt-2 text-sm text-zinc-400 font-space-grotesk italic">Subjects currently at or above 75% attendance.</p>
        </Card>

        <Card className="border-zinc-800/50 bg-zinc-900/25 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-zinc-500">
            <ShieldAlert size={14} />
            Missable Count
          </div>
          <div className="mt-3 text-3xl font-semibold text-amber-100">{totalMargin}</div>
          <p className="mt-2 text-sm text-zinc-400 font-space-grotesk italic">Total classes you can still miss across safe subjects.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-premium-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
          Theory Subjects 📖
        </h2>
        <Data 
          data={data} 
          category="theory" 
          calendarData={calendarData || []} 
          timetableData={timetableData || []} 
          rangePredict={{ enabled: showRangePredict, start: startDate, end: endDate }}
        />
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          Practical Subjects 🧪
        </h2>
        <Data 
          data={data} 
          category="practical" 
          calendarData={calendarData || []} 
          timetableData={timetableData || []}
          rangePredict={{ enabled: showRangePredict, start: startDate, end: endDate }}
        />
      </div>

      {riskySubjects > 0 ? (
        <Card className="border-red-500/20 bg-red-500/5 p-4 mt-8">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 text-red-300" size={18} />
            <div>
              <div className="text-sm font-medium text-red-200">Attendance warning</div>
              <div className="mt-1 text-sm text-zinc-300 font-space-grotesk leading-relaxed">
                {riskySubjects} subject{riskySubjects > 1 ? "s are" : " is"} below 75%. Open those cards and use the
                prediction selector to see how much more attendance can drop.
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

interface RangePredictResult {
  newPercent: string;
  added: number;
}

const Data = ({
  data,
  category,
  calendarData,
  timetableData,
  rangePredict
}: {
  data: AttendanceDetail[];
  category: string;
  calendarData: any[];
  timetableData: any[];
  rangePredict: { enabled: boolean; start: string; end: string };
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

  const calculateRangePrediction = useMemo(() => (item: AttendanceDetail, start: string, end: string): RangePredictResult | null => {
    if (!calendarData?.length || !timetableData?.length) return null;
    
    let additionalConducted = 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime()) || sDate > eDate) return null;

    const curr = new Date(sDate);
    // Safety break to prevent infinite loop
    let limit = 0;
    while (curr <= eDate && limit < 100) {
      limit++;
      const day = curr.getDate();
      const monthLabel = formatCalendarLabel(curr);
      
      const monthData = calendarData.find(m => m.month === monthLabel);
      const dayData = monthData?.days.find((d: any) => {
        const dNum = parseInt(d.date.match(/\d+/)?.[0] || "");
        return dNum === day;
      });
      
      const doText = dayData?.dayOrder || "";
      const doValue = parseInt(doText.match(/\d+/)?.[0] || "0");
      
      if (doValue > 0) {
        const idx = doValue - 1;
        // The timetable data array is indexed 0..n for Day 1..n+1
        const schedule = timetableData[idx]; 
        if (schedule) {
          const courseClasses = schedule.class.filter((cls: any) => 
            cls.isClass && normalize(cls.courseCode) === normalize(item.courseCode)
          ).length;
          additionalConducted += courseClasses;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (additionalConducted === 0) return null;

    const currentAttended = item.courseConducted - item.courseAbsent;
    const totalAfterRange = item.courseConducted + additionalConducted;
    const newPercent = totalAfterRange > 0 ? (currentAttended / totalAfterRange) * 100 : 0;
    
    return {
      newPercent: newPercent.toFixed(2),
      added: additionalConducted
    };
  }, [calendarData, timetableData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredData.map((item, i) => {
        const isSelected = selectedCourse === `${category}-${i}`;
        const attendance = Number(item.courseAttendance);
        // const isSafe = attendance >= 75; // Removed as it was unused
        const attended = item.courseConducted - item.courseAbsent;
        const statusLabel = item.courseAttendanceStatus?.status === "required"
          ? `Need ${item.courseAttendanceStatus.classes} class${item.courseAttendanceStatus.classes === 1 ? "" : "es"}`
          : `Can miss ${item.courseAttendanceStatus?.classes ?? 0} more`;

        const rangeResult = rangePredict.enabled && rangePredict.start && rangePredict.end 
          ? calculateRangePrediction(item, rangePredict.start, rangePredict.end)
          : null;

        const displayAttendance = rangeResult ? rangeResult.newPercent : attendance;
        const displayIsSafe = Number(displayAttendance) >= 75;

        return (
          <Card
            key={i}
            className={`
                relative overflow-hidden transition-all duration-300 group cursor-pointer
                ${isSelected ? 'ring-1 ring-premium-gold/50 bg-zinc-900 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : 'hover:bg-zinc-900'}
            `}
            onClick={() => setSelectedCourse(isSelected ? null : `${category}-${i}`)}
          >
            {/* Glow Effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${displayIsSafe ? 'from-emerald-500/10' : 'from-red-500/10'} to-transparent blur-2xl -mr-10 -mt-10 pointer-events-none`}></div>

            <div className="pt-4 pb-2 relative z-10 font-space-grotesk">
              <div className="flex justify-between items-start mb-3 px-4">
                <Badge variant="outline" className="font-mono text-[10px] h-[24px] uppercase font-medium border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                  {item.courseCode}
                </Badge>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge
                    variant="outline"
                    className={displayIsSafe ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-[10px]" : "border-red-400/20 bg-red-400/10 text-red-300 text-[10px]"}
                  >
                    {displayIsSafe ? "Safe Zone" : "Attention Required"}
                  </Badge>
                  {rangeResult && (
                     <Badge variant="outline" className="border-premium-gold/30 bg-premium-gold/10 text-premium-gold text-[9px] font-bold animate-pulse px-2 py-0.5 rounded-full">
                        Predicted: {rangeResult.newPercent}%
                     </Badge>
                  )}
                </div>
              </div>

              <div className="px-4 pt-1">
                <h3 className="text-sm font-medium text-white line-clamp-2 min-h-[2.5rem] leading-tight mb-2 pr-2">
                  {item.courseTitle}
                </h3>
              </div>

              <div className="mb-4 px-4">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold tracking-tighter ${rangeResult ? 'text-premium-gold' : 'text-white'}`}>
                      {displayAttendance}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">%</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-0.5">{statusLabel}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {attended}/{item.courseConducted + (rangeResult?.added || 0)} Classes
                    </p>
                  </div>
                </div>
                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden relative border border-white/5">
                  <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/20 z-20"></div>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative z-10 ${displayIsSafe ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}
                    style={{ width: `${displayAttendance}%` }}
                  ></div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300 px-4 pb-2 bg-black/20">
                  <div className="flex items-center gap-2 mb-4 text-premium-gold">
                    <Calculator size={14} className="animate-bounce" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Manual Prediction Control</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center shadow-inner">
                      <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5">Conducted</div>
                      <div className="text-sm font-bold text-white">{item.courseConducted}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center shadow-inner">
                      <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5">Attended</div>
                      <div className="text-sm font-bold text-emerald-400">{attended}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center shadow-inner">
                      <div className="text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5">Absent</div>
                      <div className="text-sm font-bold text-red-500">{item.courseAbsent}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                          If I miss more classes
                        </label>
                        <span className="text-premium-gold font-mono font-bold text-xs">+{missClasses}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={missClasses}
                        onChange={(e) => setMissClasses(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-premium-gold"
                      />
                    </div>

                    {missClasses > 0 && (
                      <div className="p-3 rounded-xl bg-premium-gold/10 border border-premium-gold/20 flex justify-between items-center shadow-lg">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">New Projected State</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${parseFloat(calculatePrediction(item, missClasses)) >= 75 ? 'text-premium-gold' : 'text-red-500'}`}>
                            {calculatePrediction(item, missClasses)}%
                          </span>
                          <div className={`w-2 h-2 rounded-full ${parseFloat(calculatePrediction(item, missClasses)) >= 75 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                        </div>
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
