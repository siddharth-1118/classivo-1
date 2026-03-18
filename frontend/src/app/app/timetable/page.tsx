"use client";

import { useDayOrder, useTimetable } from "@/hooks/query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  BookOpen
} from "lucide-react";
import { DaySchedule } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import ShinyText from "@/components/ShinyText";
import { isCurrentClass } from "@/utils/currentClass";

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
  const searchParams = useSearchParams();

  const totalDays = data.length;
  const getSafeIndex = React.useCallback((index: number) => {
    if (totalDays === 0) return 0;
    return ((index % totalDays) + totalDays) % totalDays;
  }, [totalDays]);

  useEffect(() => {
    const requestedDayOrder = Number(searchParams.get("dayOrder"));
    if (!Number.isNaN(requestedDayOrder) && requestedDayOrder > 0) {
      setDayOrder(requestedDayOrder - 1);
      return;
    }

    if (dayOrderData) {
      const todayDayOrder = Number(dayOrderData.dayOrder);
      if (!isNaN(todayDayOrder)) {
        setDayOrder(todayDayOrder - 1);
      }
    }
  }, [dayOrderData, searchParams]);

  const activeDayIndex = getSafeIndex(dayOrder);
  const currentDay = data[activeDayIndex];
  const dayLabels = data.map((i) => i.dayOrder.split(" ")[1] ?? i.dayOrder);
  const selectedDate = searchParams.get("date");
  const todayIndex = React.useMemo(() => {
    const today = Number(dayOrderData?.dayOrder);
    if (Number.isNaN(today) || today <= 0) return null;
    return getSafeIndex(today - 1);
  }, [dayOrderData, getSafeIndex]);
  const isViewingToday = todayIndex !== null && activeDayIndex === todayIndex;

  const activeDayNumber = activeDayIndex + 1;
  const dayOrderLabel = activeDayNumber > 0 ? `Day ${activeDayNumber}` : currentDay?.dayOrder ?? "";

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

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-6 pb-4 pt-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Timetable</h1>
          <p className="text-zinc-400 text-sm flex items-center gap-2">
            <Calendar size={14} />
            {selectedDate ? `${selectedDate} - ${dayOrderLabel}` : `Today - ${dayOrderLabel}`}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setDayOrder(prev => prev - 1)}
            className="p-2 rounded-md transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-[50px] text-center text-white font-mono">
            {dayLabels[activeDayIndex] || `Day ${activeDayIndex + 1}`}
          </span>
          <button
            onClick={() => setDayOrder(prev => prev + 1)}
            className="p-2 rounded-md transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-transparent p-4 sm:p-6">
        {processedClasses.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center text-sm text-zinc-400">
            No classes are scheduled for this day.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {processedClasses.map((item, index) => {
              const isLab = item.slot?.includes("P") || item.courseType === "Practical";
              const isLive = isViewingToday && isCurrentClass(item.time);
              const cardTone = isLab
                ? "border-sky-400/45 bg-sky-400/18 shadow-[0_0_30px_rgba(56,189,248,0.12)]"
                : "border-amber-300/45 bg-amber-300/18 shadow-[0_0_30px_rgba(252,211,77,0.12)]";
              const accentTone = isLab ? "text-sky-100" : "text-amber-50";
              const mutedTone = isLab ? "text-sky-100/85" : "text-amber-50/85";

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-4 backdrop-blur-sm transition-colors ${cardTone} ${isLive ? "ring-2 ring-emerald-300/70 shadow-[0_0_28px_rgba(110,231,183,0.2)]" : ""}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.22em] ${mutedTone}`}>
                        <BookOpen size={12} />
                        Subject
                      </div>
                      <h2 className={`mt-2 text-lg font-medium leading-tight ${accentTone}`}>
                        {item.courseTitle}
                      </h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {item.slot ? (
                        <Badge variant="outline" className="border-white/20 bg-black/30 text-[10px] text-white">
                          {item.slot}
                        </Badge>
                      ) : null}
                      {isLive ? (
                        <Badge className="bg-emerald-400 text-black hover:bg-emerald-400">
                          Happening now
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                        <Clock size={12} />
                        Time
                      </div>
                      <div className="text-sm font-medium text-white">{item.time}</div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                        <MapPin size={12} />
                        Room
                      </div>
                      <div className="text-sm font-medium text-white">{item.courseRoomNo || "Not available"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


