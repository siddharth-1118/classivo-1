"use client";

import { useDayOrder, useTimetable } from "@/hooks/query";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  MoreHorizontal
} from "lucide-react";
import { DaySchedule } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import ShinyText from "@/components/ShinyText";

// Helper to parse time string "08:00 AM - 09:50 AM" to minutes from 8:00 AM
const parseTime = (timeStr: string) => {
  try {
    const [startStr, endStr] = timeStr.split("-").map(t => t.trim());

    const parseToMinutes = (t: string) => {
      const [time, modifier] = t.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const startMinutes = parseToMinutes(startStr);
    const endMinutes = parseToMinutes(endStr);

    // Base time is 8:00 AM (480 minutes)
    const baseTime = 8 * 60;

    return {
      start: startMinutes - baseTime,
      duration: endMinutes - startMinutes
    };
  } catch (e) {
    console.error("Error parsing time:", timeStr, e);
    return { start: 0, duration: 0 };
  }
};

const Page = () => {
  const { data, isPending, isError, error, refetch, isFetching } = useTimetable();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;

  if (isError) {
    const message = error instanceof Error ? error.message : "Failed to load timetable";
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center text-Classivo-text-grey">
        <p className="text-base md:text-lg max-w-md">{message}</p>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          icon={RotateCcw}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.length === 0)
    return (
      <main className="flex h-screen w-full justify-center items-center text-Classivo-text-grey">
        <ShinyText
          text="No Timetable Data found"
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

  return <TimelineView data={data} />;
};

export default Page;

const TimelineView = ({ data }: { data: DaySchedule[] }) => {
  const [dayOrder, setDayOrder] = useState<number>(0);
  const { data: dayOrderData } = useDayOrder();
  const { data: timetableData } = useTimetable();

  const totalDays = data.length;
  const getSafeIndex = React.useCallback((index: number) => {
    if (totalDays === 0) return 0;
    return ((index % totalDays) + totalDays) % totalDays;
  }, [totalDays]);

  useEffect(() => {
    if (dayOrderData) {
      const todayDayOrder = Number(dayOrderData.dayOrder);
      if (!isNaN(todayDayOrder)) {
        setDayOrder(todayDayOrder - 1);
      }
    }
  }, [dayOrderData]);

  const activeDayIndex = getSafeIndex(dayOrder);
  const currentDay = data[activeDayIndex];
  const dayLabels = data.map((i) => i.dayOrder.split(" ")[1] ?? i.dayOrder);

  // Calculate current time position for the "Now" indicator
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number | null>(null);
  const [currentTimePos, setCurrentTimePos] = useState<number | null>(null);

  let dayOrderLabel = "";
  if (dayOrderData && typeof dayOrderData.dayOrder !== "undefined") {
    const d = Number(dayOrderData.dayOrder);
    if (isNaN(d) || d === 0) {
      dayOrderLabel = "Holiday";
    } else {
      dayOrderLabel = `Day ${d}`;
    }
  } else {
    // No day order info; fallback to first day
    dayOrderLabel = timetableData && timetableData.length > 0 ? (timetableData[0]?.dayOrder ?? "") : "";
  }

  const processedClasses = React.useMemo(() => {
    if (!currentDay?.class) return [];

    const grouped: typeof currentDay.class = [];

    currentDay.class.forEach((item) => {
      if (!item.isClass) return;

      const last = grouped[grouped.length - 1];

      if (last && last.courseTitle === item.courseTitle) {
        try {
          const startStr = last.time.split("-")[0].trim();
          const endStr = item.time.split("-")[1].trim();
          last.time = `${startStr} - ${endStr}`;

          if (item.slot && last.slot && !last.slot.includes(item.slot)) {
            last.slot = `${last.slot}, ${item.slot}`;
          }
        } catch (e) { console.log(e) }
      } else {
        grouped.push({ ...item });
      }
    });

    return grouped;
  }, [currentDay]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const baseTime = 8 * 60; // 8:00 AM
      const totalDuration = 9 * 60; // 9 hours displayed

      if (minutes >= baseTime && minutes <= baseTime + totalDuration) {
        const percentage = ((minutes - baseTime) / totalDuration) * 100;
        setCurrentTimePos(percentage);
        setCurrentTimeMinutes(minutes);
      } else {
        setCurrentTimePos(null);
        setCurrentTimeMinutes(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Constants for rendering
  const HOUR_HEIGHT = 80; // Pixels per hour for mobile
  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const BASE_TIME = 8 * 60; // 8:00 AM in minutes

  const getVerticalStyle = (item: any) => {
    const { start, duration } = parseTime(item.time as string);
    // start is minutes from 8:00 AM
    const top = (start / 60) * HOUR_HEIGHT;
    const height = (duration / 60) * HOUR_HEIGHT;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: '4rem', // Increased offset for time axis
      width: 'calc(100% - 5rem)' // Reduced width to prevent touching edge
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-zinc-800 bg-zinc-900/50">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Timetable</h1>
          <p className="text-Classivo-text-grey text-sm flex items-center gap-2">
            <Calendar size={14} />
            Today - {dayOrderLabel || `Day ${activeDayIndex + 1}`}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setDayOrder(prev => prev - 1)}
            className="p-2 rounded-md transition-colors text-Classivo-text-grey hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-[50px] text-center text-white font-mono">
            {dayLabels[activeDayIndex] || `Day ${activeDayIndex + 1}`}
          </span>
          <button
            onClick={() => setDayOrder(prev => prev + 1)}
            className="p-2 rounded-md transition-colors text-Classivo-text-grey hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Timeline (Horizontal) */}
      <div className="hidden md:block flex-1 h-full min-h-0 relative overflow-x-auto overflow-y-hidden bg-zinc-950/50">
        <div className="h-full min-w-[1000px] relative">

          {/* Time Markers (Top) */}
          <div className="absolute top-0 left-4 w-full h-12 border-b border-zinc-800 flex items-end pb-3 px-4 bg-zinc-900/30">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute text-xs text-Classivo-text-grey font-mono transform -translate-x-1/2 flex flex-col items-center gap-1"
                style={{ left: `${((hour - 8) / 9) * 100}%` }}
              >
                <span>{hour}:00</span>
                <div className="w-px h-1.5 bg-zinc-700"></div>
              </div>
            ))}
          </div>

          {/* Grid Lines */}
          <div className="absolute top-12 left-4 w-full h-full">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute h-full w-px bg-zinc-800/50 border-r border-dashed border-zinc-800/50"
                style={{ left: `${((hour - 8) / 9) * 100}%` }}
              />
            ))}
          </div>

          {/* Current Time Indicator */}
          {currentTimePos !== null && (
            <div
              className="absolute top-12 bottom-0 w-px bg-red-500 z-30 flex flex-col items-center shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              style={{ left: `${currentTimePos}%` }}
            >
              <div className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm -mt-2.5 font-bold tracking-wider shadow-sm">
                NOW
              </div>
            </div>
          )}

          {/* Classes */}
          <div className="absolute top-16 left-4 w-full h-[calc(100%-4rem)] p-4">
            {processedClasses.map((item, index) => {
              if (!item.isClass) return null;

              const { start, duration } = parseTime(item.time as string);
              const totalDuration = 9 * 60; // 10 hours in minutes

              const left = (start / totalDuration) * 100;
              const width = (duration / totalDuration) * 100;

              // Stagger overlapping classes vertically
              const top = (index % 3) * 28 + 2; // 2%, 30%, 58%

              // Color coding based on course type
              const isLab = item.slot?.includes("P") || item.courseType === "Practical";
              const baseClasses = isLab
                ? "bg-purple-500/10 border-purple-500/30 text-purple-100 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : "bg-premium-gold/10 border-premium-gold/30 text-emerald-100 hover:border-premium-gold hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]";

              const textMutedClass = isLab ? "text-purple-300/70" : "text-premium-gold/70";

              return (
                <div
                  key={index}
                  className={`absolute h-24 rounded-xl border p-3 transition-all duration-300 cursor-pointer group overflow-hidden backdrop-blur-sm ${baseClasses}`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${top}%`,
                    maxWidth: `${width}%`
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm truncate pr-2" title={item.courseTitle}>
                      {item.courseTitle}
                    </div>
                    <MoreHorizontal size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className={`text-xs flex items-center gap-1.5 ${textMutedClass}`}>
                    <Clock size={10} />
                    <span className="font-mono">{item.time}</span>
                  </div>

                  <div className={`absolute top-2 right-2 text-xs mt-1 flex items-center gap-1.5 ${textMutedClass}`}>
                    <MapPin size={10} />
                    <span>{item.courseRoomNo}</span>
                  </div>

                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                    <Badge variant="outline" className="bg-black/40 backdrop-blur-md border-white/10 text-[10px] h-5">
                      {item.slot}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Mobile Timeline (Vertical) */}
      <div className="block md:hidden flex-1 h-full min-h-0 relative overflow-y-auto bg-zinc-950/50">
        <div className="w-full relative h-full">
          {/* Time Axis (Left) */}
          <div className="absolute top-[5px] left-0 bottom-0 w-16 border-r border-zinc-800 bg-zinc-900/30 flex flex-col items-center py-4 z-20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute text-xs text-Classivo-text-grey font-mono flex items-center justify-center w-full"
                style={{ top: `${(hour - 8) * HOUR_HEIGHT}px`, height: '20px', marginTop: '-10px' }}
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Grid Lines */}
          <div className="absolute top-0 left-16 right-0 bottom-0 z-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full h-px bg-zinc-800/80"
                style={{ top: `${(hour - 8) * HOUR_HEIGHT}px` }}
              />
            ))}
          </div>

          {/* Current Time Indicator Vertical */}
          {currentTimeMinutes !== null && currentTimeMinutes >= BASE_TIME && currentTimeMinutes <= BASE_TIME + (10 * 60) && (
            <div
              className="absolute left-16 right-0 h-px bg-red-500 z-30 flex items-center shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              style={{ top: `${((currentTimeMinutes - BASE_TIME) / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="absolute -left-1 bg-red-500 w-2 h-2 rounded-full shadow-sm"></div>
              <div className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider shadow-sm">
                NOW
              </div>
            </div>
          )}

          {/* Classes Vertical */}
          <div className="absolute top-0 left-0 w-full h-full z-10">
            {processedClasses.map((item, index) => {
              if (!item.isClass) return null;

              const style = getVerticalStyle(item);
              const isLab = item.slot?.includes("P") || item.courseType === "Practical";
              const baseClasses = isLab
                ? "bg-purple-500/10 border-purple-500/30 text-purple-100"
                : "bg-premium-gold/10 border-premium-gold/30 text-emerald-100";
              const textMutedClass = isLab ? "text-purple-300/70" : "text-premium-gold/70";

              return (
                <div
                  key={index}
                  className={`absolute rounded-xl border p-3 cursor-pointer overflow-hidden backdrop-blur-sm ${baseClasses}`}
                  style={style}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm leading-tight pr-2" title={item.courseTitle}>
                      {item.courseTitle}
                    </div>
                    <div className={`text-xs flex items-center gap-1.5 ${textMutedClass}`}>
                      <MapPin size={10} />
                      <span>{item.courseRoomNo}</span>
                    </div>
                  </div>

                  <div className={`text-xs flex items-center gap-1.5 ${textMutedClass} mb-1`}>
                    <Clock size={10} />
                    <span className="font-mono">{item.time}</span>
                  </div>


                  <div className="absolute bottom-2 right-2">
                    <Badge variant="outline" className="bg-black/40 backdrop-blur-md border-white/10 text-[10px] h-5 px-1.5">
                      {item.slot}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};


