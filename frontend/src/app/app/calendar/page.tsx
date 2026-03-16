"use client";
import { useCalendar } from "@/hooks/query";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { Month } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { formattedMonth, getIndex } from "@/utils/currentMonth";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import ShinyText from "@/components/ShinyText";
import { motion, AnimatePresence } from "motion/react";

const Page = () => {
  const { data: calendarData, isPending } = useCalendar();

  const data = useMemo(() => {
    if (!calendarData) return calendarData;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return [...calendarData].sort((a, b) => {
      const partsA = a.month.split(" '");
      const partsB = b.month.split(" '");

      // Fallback for unexpected format
      if (partsA.length !== 2 || partsB.length !== 2) return 0;

      const yearA = parseInt(partsA[1]);
      const yearB = parseInt(partsB[1]);
      const monthA = months.indexOf(partsA[0]);
      const monthB = months.indexOf(partsB[0]);

      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
  }, [calendarData]);

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data || data.length === 0)
    return (
      <main className="flex h-screen w-full justify-center items-center text-zinc-500">
        <ShinyText
          text="No Calendar data found"
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
  return <DayChange data={data} />;
};

export default Page;

const DayChange = ({ data }: { data: Month[] }) => {
  const [mounted, setMounted] = useState(false);
  const initialIndex = getIndex({ data });
  const [month, setMonth] = useState<number>(initialIndex >= 0 ? initialIndex : 0);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure month index is valid
  useEffect(() => {
    if (month < 0 || month >= data.length) {
      setMonth(0);
    }
  }, [month, data.length]);

  if (!mounted) return null;

  // Guard against invalid data
  if (!data || data.length === 0 || !data[month]) {
    return (
      <main className="flex h-screen w-full justify-center items-center text-zinc-500">
        <ShinyText
          text="No Calendar data found"
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
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden min-h-screen pb-20">
      {/* Header */}
      <div className="w-full py-6 flex-none bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10 border border-zinc-800/50 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between relative z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => month > 0 && setMonth(month - 1)}
              disabled={month <= 0}
              className="text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <CalendarIcon className="w-5 h-5 text-premium-gold hidden sm:block" />
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase font-display">
                  {data[month].month}
                </h1>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''} group-hover:text-white`}
                />
              </div>
            </button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => month < data.length - 1 && setMonth(month + 1)}
              disabled={month >= data.length - 1}
              className="text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <AnimatePresence>
            {isSelectorOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="w-full overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pb-4">
                  {data.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMonth(idx);
                        setIsSelectorOpen(false);
                      }}
                      className={`
                                  relative p-4 rounded-xl border text-sm font-medium transition-all duration-200
                                  flex flex-col items-center justify-center gap-1
                        ${month === idx
                          ? "bg-premium-gold/10 border-premium-gold/50 text-premium-gold shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                          : "bg-zinc-900/40 border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800/60 hover:border-zinc-700"
                        }
                                `}>
                      <span className="font-display font-bold text-lg">{m.month}</span>

                      {idx === getIndex({ data }) && (
                        <div className="absolute top-0 right-1">
                          <span className="uppercase text-[7px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                            Current
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[1920px] mx-auto">
          <Data data={data} month={month} formattedMonth={formattedMonth} />
        </div>
      </div>
    </div>
  );
};

const Data = ({
  data,
  month,
  formattedMonth,
}: {
  data: Month[];
  month: number;
  formattedMonth: string;
}) => {
  const today = new Date();
  const currentDate = today.getDate().toString();
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }
  }, [month]);

  // Safety check
  if (!data || !data[month] || !data[month].days) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-6 sm:p-8">
      {data[month].days.map((item, i) => {
        const holiday = item.dayOrder === "-";
        const isCurrent =
          item.date === currentDate && formattedMonth === data[month].month;

        return (
          <Card
            key={i}
            // @ts-ignore
            variant="calenderspx"
            ref={isCurrent ? currentRef : undefined}
            className={`
              flex flex-col justify-between p-5 min-h-[160px] transition-all duration-300
              ${holiday ? "bg-red-500/5 border-red-500/10 hover:border-red-500/20 hover:bg-red-500/10" : "bg-zinc-900/20 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/40"}
              ${isCurrent ? "ring-2 ring-premium-gold border-premium-gold/50 shadow-2xl shadow-premium-gold/10 bg-zinc-900/40 hover:bg-zinc-900/40" : ""}
            `}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className={`text-3xl font-bold font-display tracking-tight ${isCurrent ? "text-premium-gold" : "text-white"}`}>
                  {item.date}
                </span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                  {item.day}
                </span>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isCurrent && (
                  <Badge variant="default" className="bg-premium-gold text-black font-bold text-[10px] px-2 py-0.5">
                    TODAY
                  </Badge>
                )}
                <span className={`text-lg font-mono font-bold ${holiday ? "text-red-400" : "text-zinc-600"}`}>
                  {item.dayOrder}
                </span>
              </div>
            </div>

            {item.event.length !== 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-zinc-800/50">
                <p className="text-xs text-red-400 font-medium line-clamp-2">
                  {item.event}
                </p>
              </div>
            )}

            {!holiday && item.event.length === 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-800/30 flex items-center gap-2 text-zinc-600">
                <Clock size={12} />
                <span className="text-[10px] uppercase">Regular Schedule</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

