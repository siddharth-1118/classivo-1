"use client";

import { useCalendar } from "@/hooks/query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock3,
  Flag,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Month } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { formattedMonth, getIndex } from "@/utils/currentMonth";
import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import ShinyText from "@/components/ShinyText";
import { motion, AnimatePresence } from "motion/react";

type CalendarDay = Month["days"][number];
type EventTone = "holiday" | "deadline" | "academic" | "working" | "regular";

const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sortMonths = (calendarData: Month[] | undefined) => {
  if (!calendarData) return calendarData;

  return [...calendarData].sort((a, b) => {
    const partsA = a.month.split(" '");
    const partsB = b.month.split(" '");
    if (partsA.length !== 2 || partsB.length !== 2) return 0;

    const yearA = parseInt(partsA[1]);
    const yearB = parseInt(partsB[1]);
    const monthA = monthsOrder.indexOf(partsA[0]);
    const monthB = monthsOrder.indexOf(partsB[0]);

    if (yearA !== yearB) return yearA - yearB;
    return monthA - monthB;
  });
};

const normalizeEvent = (event: string) => event.replace(/\s+/g, " ").trim();

const getEventTone = (day: CalendarDay): EventTone => {
  const event = normalizeEvent(day.event || "").toLowerCase();

  if (!event && day.dayOrder !== "-") return "regular";
  if (event.includes("holiday") || event.includes("convocation")) return "holiday";
  if (
    event.includes("last working day") ||
    event.includes("ends with") ||
    event.includes("end with") ||
    event.includes("commencement") ||
    event.includes("deadline")
  ) {
    return "deadline";
  }
  if (
    event.includes("working day") ||
    event.includes("class") ||
    event.includes("semester") ||
    event.includes("term")
  ) {
    return "working";
  }
  return "academic";
};

const getToneClasses = (tone: EventTone) => {
  switch (tone) {
    case "holiday":
      return {
        card: "border-red-500/20 bg-red-500/8",
        badge: "bg-red-400/15 text-red-200 border-red-400/25",
        title: "text-red-200",
        icon: Flag,
        label: "Holiday",
      };
    case "deadline":
      return {
        card: "border-amber-400/20 bg-amber-400/8",
        badge: "bg-amber-300/15 text-amber-100 border-amber-300/25",
        title: "text-amber-100",
        icon: Clock3,
        label: "Important",
      };
    case "working":
      return {
        card: "border-emerald-400/20 bg-emerald-400/8",
        badge: "bg-emerald-300/15 text-emerald-100 border-emerald-300/25",
        title: "text-emerald-100",
        icon: GraduationCap,
        label: "Academic Day",
      };
    case "academic":
      return {
        card: "border-sky-400/20 bg-sky-400/8",
        badge: "bg-sky-300/15 text-sky-100 border-sky-300/25",
        title: "text-sky-100",
        icon: Sparkles,
        label: "Notice",
      };
    default:
      return {
        card: "border-zinc-800/60 bg-zinc-900/25",
        badge: "bg-zinc-800/80 text-zinc-300 border-zinc-700/70",
        title: "text-white",
        icon: CalendarIcon,
        label: "Regular",
      };
  }
};

const humanizeEvent = (day: CalendarDay) => {
  const event = normalizeEvent(day.event || "");
  if (event) return event;
  if (day.dayOrder === "-") return "No classes scheduled.";
  return `Regular class day. Day Order ${day.dayOrder}.`;
};

const getMonthInsights = (month: Month) => {
  const importantDays = month.days.filter((day) => normalizeEvent(day.event || "").length > 0);
  const holidays = importantDays.filter((day) => getEventTone(day) === "holiday");
  const deadlines = importantDays.filter((day) => getEventTone(day) === "deadline");
  const academicDays = importantDays.filter((day) => {
    const tone = getEventTone(day);
    return tone === "academic" || tone === "working";
  });

  return {
    importantDays,
    holidays,
    deadlines,
    academicDays,
  };
};

const Page = () => {
  const { data: calendarData, isPending } = useCalendar();
  const data = useMemo(() => sortMonths(calendarData), [calendarData]);

  if (isPending) {
    return <main className="flex h-screen w-full items-center justify-center p-4 text-white"><GlobalLoader /></main>;
  }

  if (!data || data.length === 0) {
    return (
      <main className="flex h-screen w-full items-center justify-center text-zinc-500">
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

  return <CalendarView data={data} />;
};

export default Page;

const CalendarView = ({ data }: { data: Month[] }) => {
  const [mounted, setMounted] = useState(false);
  const [month, setMonth] = useState<number>(() => {
    const initialIndex = getIndex({ data });
    return initialIndex >= 0 ? initialIndex : 0;
  });
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (month < 0 || month >= data.length) {
      setMonth(0);
    }
  }, [month, data.length]);

  if (!mounted || !data[month]) return null;

  const currentMonth = data[month];
  const insights = getMonthInsights(currentMonth);

  return (
    <div className="min-h-screen w-full pb-20">
      <div className="sticky top-0 z-10 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] py-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => month > 0 && setMonth(month - 1)}
              disabled={month <= 0}
              className="text-zinc-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <button
              onClick={() => setIsSelectorOpen((open) => !open)}
              className="group flex items-center gap-3 rounded-xl px-4 py-2 transition-colors hover:bg-white/5"
            >
              <CalendarIcon className="hidden h-5 w-5 text-premium-gold sm:block" />
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
                  {currentMonth.month}
                </h1>
                <ChevronDown
                  className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${isSelectorOpen ? "rotate-180" : ""} group-hover:text-white`}
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
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <p className="mt-3 text-center text-sm text-zinc-400">
            Academic calendar made simpler: important dates, holidays, working days, and class-day order in student-friendly format.
          </p>

          <AnimatePresence>
            {isSelectorOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className="w-full overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {data.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMonth(idx);
                        setIsSelectorOpen(false);
                      }}
                      className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${
                        month === idx
                          ? "border-premium-gold/50 bg-premium-gold/10 text-premium-gold shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="font-display text-lg font-bold">{m.month}</span>
                      {idx === getIndex({ data }) && (
                        <div className="absolute right-1 top-0">
                          <span className="rounded-full border border-zinc-700/50 bg-zinc-800/80 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-zinc-400">
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

      <div className="mx-auto flex max-w-[1700px] flex-col gap-6 px-4 py-6 sm:px-6">
        <MonthSummary month={currentMonth} insights={insights} />
        <ImportantDates month={currentMonth} insights={insights} />
        <CalendarGrid month={currentMonth} formattedMonth={formattedMonth} />
      </div>
    </div>
  );
};

const MonthSummary = ({
  month,
  insights,
}: {
  month: Month;
  insights: ReturnType<typeof getMonthInsights>;
}) => {
  const summaryCards = [
    {
      title: "Important Dates",
      value: insights.importantDays.length,
      caption: "Dates with notices, deadlines, or special updates",
    },
    {
      title: "Holidays",
      value: insights.holidays.length,
      caption: "Public holidays and non-class days with official events",
    },
    {
      title: "Academic Updates",
      value: insights.deadlines.length + insights.academicDays.length,
      caption: "Enrollment, commencement, working-day, and semester notices",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-white/10 bg-black/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
          <Sparkles className="h-4 w-4" />
          Student View
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white">{month.month} at a glance</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Instead of reading a crowded academic sheet, this page highlights what students usually need first:
          holidays, working days, enrollment windows, commencement dates, and important last-working-day notices.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{card.title}</div>
              <div className="mt-2 text-3xl font-bold text-white">{card.value}</div>
              <p className="mt-2 text-xs leading-5 text-zinc-400">{card.caption}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-white/10 bg-black/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="mb-3 text-xs uppercase tracking-[0.25em] text-zinc-500">How To Read</div>
        <div className="space-y-3">
          {(["holiday", "deadline", "working", "academic"] as EventTone[]).map((tone) => {
            const config = getToneClasses(tone);
            return (
              <div key={tone} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <config.icon className={`mt-0.5 h-4 w-4 ${config.title}`} />
                <div>
                  <div className={`text-sm font-medium ${config.title}`}>{config.label}</div>
                  <div className="text-xs leading-5 text-zinc-400">
                    {tone === "holiday" && "Official holidays, convocation, and no-class notices."}
                    {tone === "deadline" && "Dates you should watch carefully, like commencement or last working day."}
                    {tone === "working" && "Special working days or semester-specific academic activity."}
                    {tone === "academic" && "Other useful notices from the academic office."}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
};

const ImportantDates = ({
  month,
  insights,
}: {
  month: Month;
  insights: ReturnType<typeof getMonthInsights>;
}) => {
  const highlighted = insights.importantDays.slice(0, 8);

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-white/10 bg-black/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Important Dates</div>
            <h3 className="mt-2 text-xl font-semibold text-white">What students should notice first in {month.month}</h3>
          </div>
          <Badge variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300">
            {highlighted.length} highlighted
          </Badge>
        </div>

        {highlighted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-zinc-400">
            No highlighted notices were found for this month. You can still use the daily cards below to check day order.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {highlighted.map((day, index) => {
              const tone = getEventTone(day);
              const config = getToneClasses(tone);
              return (
                <div key={`${day.date}-${index}`} className={`rounded-2xl border p-4 ${config.card}`}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                        {day.day} • {month.month}
                      </div>
                      <div className="mt-1 text-2xl font-bold text-white">{day.date}</div>
                    </div>
                    <Badge variant="outline" className={config.badge}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className={`text-sm font-medium leading-6 ${config.title}`}>{humanizeEvent(day)}</p>
                  <div className="mt-3 text-xs text-zinc-400">
                    {day.dayOrder === "-" ? "No day order" : `Day Order ${day.dayOrder}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="border-white/10 bg-black/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Quick Filters</div>
        <div className="mt-4 space-y-3">
          <MiniList title="Holidays" items={insights.holidays} emptyText="No holidays listed." />
          <MiniList title="Deadlines" items={insights.deadlines} emptyText="No deadline-style notices listed." />
          <MiniList title="Academic Notices" items={insights.academicDays} emptyText="No extra academic notices listed." />
        </div>
      </Card>
    </section>
  );
};

const MiniList = ({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: CalendarDay[];
  emptyText: string;
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-sm font-medium text-white">{title}</div>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-500">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 4).map((item, idx) => (
            <div key={`${title}-${item.date}-${idx}`} className="flex items-start justify-between gap-3 text-xs">
              <span className="text-zinc-300">{humanizeEvent(item)}</span>
              <span className="font-mono text-zinc-500">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CalendarGrid = ({
  month,
  formattedMonth,
}: {
  month: Month;
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
      });
    }
  }, [month.month]);

  return (
    <section>
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Daily Planner</div>
        <h3 className="mt-2 text-xl font-semibold text-white">Day-by-day calendar in simple student language</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {month.days.map((item, i) => {
          const isCurrent = item.date === currentDate && formattedMonth === month.month;
          const tone = getEventTone(item);
          const config = getToneClasses(tone);
          const isHolidayDay = item.dayOrder === "-";

          return (
            <Link
              key={`${item.date}-${i}`}
              href={item.dayOrder === "-" ? "#" : `/app/timetable?dayOrder=${encodeURIComponent(item.dayOrder)}&date=${encodeURIComponent(`${month.month} ${item.date}`)}`}
              className={`block ${item.dayOrder === "-" ? "pointer-events-none" : ""}`}
            >
              <Card
                ref={isCurrent ? currentRef : undefined}
                className={`min-h-[190px] p-5 transition-all duration-300 ${config.card} ${
                  isCurrent ? "border-premium-gold/50 ring-2 ring-premium-gold shadow-2xl shadow-premium-gold/10" : ""
                } ${!isHolidayDay ? "cursor-pointer hover:border-premium-gold/40 hover:bg-zinc-900/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-3xl font-bold tracking-tight ${isCurrent ? "text-premium-gold" : "text-white"}`}>
                      {item.date}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.day}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {isCurrent ? (
                      <Badge className="bg-premium-gold text-black hover:bg-premium-gold">Today</Badge>
                    ) : null}
                    <Badge variant="outline" className={config.badge}>
                      {config.label}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3">
                  <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-zinc-500">Status</div>
                  <div className={`text-sm font-medium leading-6 ${config.title}`}>
                    {humanizeEvent(item)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Day Order</span>
                  <span className={`font-mono ${isHolidayDay ? "text-zinc-500" : "text-white"}`}>
                    {isHolidayDay ? "No class day" : item.dayOrder}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
