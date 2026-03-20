"use client";

import { useCalendar, useDayOrder, useTimetable } from "@/hooks/query";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Download,
  FileText
} from "lucide-react";
import { DaySchedule } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import ShinyText from "@/components/ShinyText";
import { isCurrentClass } from "@/utils/currentClass";
import { toast } from "sonner";

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

const groupClassesForDisplay = (dayClasses: DaySchedule["class"] = []) => {
  const grouped: typeof dayClasses = [];

  dayClasses.forEach((item) => {
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
      } catch (e) {
        console.log(e);
      }
    } else {
      grouped.push({ ...item });
    }
  });

  return grouped;
};

const toMinutes = (label: string) => {
  try {
    const [time, modifier] = label.trim().split(" ");
    const [hoursPart, minutesPart] = time.split(":");
    let hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } catch {
    return 0;
  }
};

const parseTimeRange = (value: string) => {
  const [startLabel = "", endLabel = ""] = value.split("-").map((item) => item.trim());
  return {
    start: toMinutes(startLabel),
    end: toMinutes(endLabel),
  };
};

const formatMinutes = (value: number) => {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 60);
  const minutes = safeValue % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

const formatCalendarStamp = (date: Date, minutes: number) => {
  const next = new Date(date);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");
  const hours = String(next.getHours()).padStart(2, "0");
  const mins = String(next.getMinutes()).padStart(2, "0");
  const secs = String(next.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${mins}${secs}`;
};

const parseAcademicDate = (monthLabel: string, dayLabel: string) => {
  const [monthName, yearSuffix] = monthLabel.split(" '");
  const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthName);
  const dayNumber = Number(dayLabel);
  const year = Number(`20${yearSuffix}`);

  if (monthIndex < 0 || Number.isNaN(dayNumber) || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, monthIndex, dayNumber);
};

const TimelineView = ({ data }: { data: DaySchedule[] }) => {
  const [dayOrder, setDayOrder] = useState<number>(0);
  const { data: dayOrderData } = useDayOrder();
  const { data: calendarData } = useCalendar();
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
    return groupClassesForDisplay(currentDay.class);
  }, [currentDay]);

  const freeSlotInsight = React.useMemo(() => {
    if (processedClasses.length === 0) {
      return {
        title: "Full day is free",
        detail: "No classes are scheduled for this day order.",
      };
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const ranges = processedClasses.map((item) => ({
      ...item,
      ...parseTimeRange(item.time),
    }));

    const liveClass = ranges.find((item) => currentMinutes >= item.start && currentMinutes <= item.end);
    if (liveClass) {
      return {
        title: "Class is running now",
        detail: `${liveClass.courseTitle} ends in ${formatMinutes(liveClass.end - currentMinutes)}.`,
      };
    }

    const nextClass = ranges.find((item) => item.start > currentMinutes);
    if (nextClass) {
      return {
        title: "Free slot available",
        detail: `${formatMinutes(nextClass.start - currentMinutes)} free before ${nextClass.courseTitle}.`,
      };
    }

    return {
      title: "No more classes today",
      detail: "Your current day order is clear for the rest of the day.",
    };
  }, [processedClasses]);

  const downloadFullTimetable = React.useCallback(() => {
    const csvRows = [
      ["Day Order", "Course Code", "Course Title", "Time", "Room", "Type", "Slot"],
    ];

    data.forEach((day, index) => {
      const groupedClasses = groupClassesForDisplay(day.class ?? []);
      const dayLabel = day.dayOrder || `Day ${index + 1}`;

      groupedClasses.forEach((item) => {
        csvRows.push([
          dayLabel,
          item.courseCode || "",
          item.courseTitle || "",
          item.time || "",
          item.courseRoomNo || "",
          item.courseType || "",
          item.slot || "",
        ]);
      });
    });

    const escapeCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const csvContent = csvRows.map((row) => row.map(escapeCell).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `classivo-full-timetable-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const downloadTimetablePdf = React.useCallback(() => {
    const printableDays = data
      .map((day, index) => ({
        dayLabel: day.dayOrder || `Day ${index + 1}`,
        classes: groupClassesForDisplay(day.class ?? []),
      }))
      .filter((day) => day.classes.length > 0);

    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      toast.error("Please allow popups to export the timetable PDF.");
      return;
    }

    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const daySections = printableDays
      .map(
        (day, index) => `
          <section class="day-block ${index > 0 ? "page-break" : ""}">
            <div class="day-header">
              <h2>${day.dayLabel}</h2>
              <span>${day.classes.length} classes scheduled</span>
            </div>
            <div class="day-intro">
              <div class="day-pill">${day.dayLabel}</div>
              <p>Readable full schedule for ${day.dayLabel.toLowerCase()} with subject, timing, room, type, and slot details.</p>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Time</th>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Slot</th>
                  </tr>
                </thead>
                <tbody>
                ${day.classes
                  .map(
                    (item, itemIndex) => `
                      <tr>
                        <td>${itemIndex + 1}</td>
                        <td>${item.courseTitle || "-"}</td>
                        <td>${item.courseCode || "-"}</td>
                        <td>${item.time || "-"}</td>
                        <td>${item.courseRoomNo || "-"}</td>
                        <td>${item.courseType || "-"}</td>
                        <td>${item.slot || "-"}</td>
                      </tr>
                    `
                  )
                  .join("")}
                </tbody>
              </table>
            </div>
          </section>
        `
      )
      .join("");

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Classivo Full Timetable</title>
          <style>
            :root {
              color-scheme: light;
              --ink: #101828;
              --muted: #667085;
              --line: #d0d5dd;
              --gold: #b8871d;
              --panel: #f8fafc;
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 32px;
              font-family: Arial, Helvetica, sans-serif;
              color: var(--ink);
              background: white;
            }
            .sheet {
              max-width: 1100px;
              margin: 0 auto;
            }
            .hero {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: flex-start;
              padding: 24px 28px;
              border-radius: 24px;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
              color: white;
              margin-bottom: 24px;
            }
            .hero h1 {
              margin: 0;
              font-size: 30px;
              letter-spacing: -0.04em;
            }
            .hero p {
              margin: 8px 0 0;
              color: rgba(255,255,255,0.74);
              font-size: 14px;
            }
            .hero-badge {
              border: 1px solid rgba(255,255,255,0.18);
              border-radius: 999px;
              padding: 10px 14px;
              font-size: 12px;
              white-space: nowrap;
              color: #f8d57e;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 14px;
              margin-bottom: 20px;
            }
            .summary-card {
              border: 1px solid var(--line);
              border-radius: 18px;
              padding: 16px 18px;
              background: var(--panel);
            }
            .summary-card span {
              display: block;
              font-size: 12px;
              color: var(--muted);
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .summary-card strong {
              display: block;
              margin-top: 6px;
              font-size: 22px;
            }
            .day-block {
              margin-bottom: 22px;
              border: 1px solid var(--line);
              border-radius: 20px;
              overflow: hidden;
              break-inside: avoid;
              background: white;
            }
            .day-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 18px;
              background: linear-gradient(90deg, rgba(184,135,29,0.12), rgba(15,23,42,0.02));
              border-bottom: 1px solid var(--line);
            }
            .day-header h2 {
              margin: 0;
              font-size: 19px;
            }
            .day-header span {
              font-size: 12px;
              color: var(--muted);
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .day-intro {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
              padding: 14px 18px;
              background: #fffdf8;
              border-bottom: 1px solid #eaecf0;
            }
            .day-intro p {
              margin: 0;
              font-size: 12px;
              color: var(--muted);
              line-height: 1.5;
            }
            .day-pill {
              flex-shrink: 0;
              border: 1px solid rgba(184,135,29,0.25);
              background: rgba(184,135,29,0.08);
              color: var(--gold);
              border-radius: 999px;
              padding: 8px 12px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .table-wrap {
              overflow: hidden;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              padding: 12px 14px;
              border-bottom: 1px solid #eaecf0;
              font-size: 13px;
              vertical-align: top;
            }
            th {
              font-size: 11px;
              color: var(--muted);
              text-transform: uppercase;
              letter-spacing: 0.08em;
              background: #fcfcfd;
            }
            tr:last-child td {
              border-bottom: none;
            }
            .footer {
              margin-top: 18px;
              font-size: 12px;
              color: var(--muted);
              text-align: center;
            }
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              body {
                padding: 12px;
              }
              .sheet {
                max-width: none;
              }
              .hero {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .summary {
                break-inside: avoid;
              }
              .day-header {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .day-intro {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .page-break {
                page-break-before: always;
                break-before: page;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <section class="hero">
              <div>
                <h1>Classivo Full Timetable</h1>
                <p>Clean export for sharing, printing, and saving as PDF.</p>
              </div>
              <div class="hero-badge">Generated on ${today}</div>
            </section>

            <section class="summary">
              <div class="summary-card">
                <span>Day Orders</span>
                <strong>${printableDays.length}</strong>
              </div>
              <div class="summary-card">
                <span>Total Classes</span>
                <strong>${printableDays.reduce((sum, day) => sum + day.classes.length, 0)}</strong>
              </div>
              <div class="summary-card">
                <span>Export Format</span>
                <strong>All Day Orders</strong>
              </div>
            </section>

            ${daySections}

            <div class="footer">Generated from Classivo timetable export</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    const triggerPrint = () => {
      printWindow.print();
    };

    setTimeout(triggerPrint, 500);
  }, [data]);

  const downloadCalendarFile = React.useCallback(() => {
    const calendarDates = (calendarData ?? []).flatMap((month) =>
      month.days
        .filter((day) => day.dayOrder && day.dayOrder !== "-")
        .map((day) => ({
          date: parseAcademicDate(month.month, day.date),
          dayOrder: day.dayOrder,
        }))
        .filter((item): item is { date: Date; dayOrder: string } => item.date instanceof Date && !Number.isNaN(item.date.getTime()))
    );

    if (calendarDates.length === 0) {
      toast.error("Academic calendar dates are needed before exporting timetable to calendar.");
      return;
    }

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Classivo//Full Timetable//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    let eventCount = 0;

    data.forEach((day, dayIndex) => {
      const classes = groupClassesForDisplay(day.class ?? []);
      const dayLabel = day.dayOrder || `Day ${dayIndex + 1}`;
      const matchingDates = calendarDates.filter((item) => item.dayOrder === dayLabel);

      if (matchingDates.length === 0) {
        return;
      }

      matchingDates.forEach((calendarDate) => {
      classes.forEach((item, itemIndex) => {
        const range = parseTimeRange(item.time);
        lines.push("BEGIN:VEVENT");
        lines.push(`UID:classivo-${dayIndex + 1}-${itemIndex + 1}-${calendarDate.date.toISOString()}@classivo`);
        lines.push(`SUMMARY:${(item.courseTitle || "Class").replace(/,/g, "\\,")}`);
        lines.push(`DESCRIPTION:${dayLabel} | ${item.courseCode || ""} | ${item.slot || ""}`);
        lines.push(`LOCATION:${(item.courseRoomNo || "Room not available").replace(/,/g, "\\,")}`);
        lines.push(`DTSTART:${formatCalendarStamp(calendarDate.date, range.start)}`);
        lines.push(`DTEND:${formatCalendarStamp(calendarDate.date, range.end || range.start + 60)}`);
        lines.push("END:VEVENT");
        eventCount += 1;
      });
      });
    });

    if (eventCount === 0) {
      toast.error("No matching day-order dates were found in the academic calendar.");
      return;
    }

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "classivo-timetable.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [calendarData, data]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 bg-black/20 px-4 pb-4 pt-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Timetable</h1>
          <p className="text-zinc-400 text-sm flex items-center gap-2">
            <Calendar size={14} />
            {selectedDate ? `${selectedDate} - ${dayOrderLabel}` : `Today - ${dayOrderLabel}`}
          </p>
        </div>

        <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200/80">Free Slot Finder</p>
          <h2 className="mt-2 text-lg font-semibold text-white">{freeSlotInsight.title}</h2>
          <p className="mt-1 text-sm leading-6 text-zinc-300">{freeSlotInsight.detail}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setDayOrder(prev => prev - 1)}
              className="rounded-md p-2 text-zinc-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[50px] text-center font-mono text-sm font-medium text-white">
              {dayLabels[activeDayIndex] || `Day ${activeDayIndex + 1}`}
            </span>
            <button
              onClick={() => setDayOrder(prev => prev + 1)}
              className="rounded-md p-2 text-zinc-400 transition-colors hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button
              onClick={downloadFullTimetable}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Download size={16} />
              Download CSV
            </button>
            <button
              onClick={downloadTimetablePdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-premium-gold/25 bg-premium-gold/10 px-4 py-2 text-sm font-medium text-premium-gold transition-colors hover:bg-premium-gold/15"
            >
              <FileText size={16} />
              Export PDF
            </button>
            <button
              onClick={downloadCalendarFile}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200 transition-colors hover:bg-sky-400/15"
            >
              <Calendar size={16} />
              Download Calendar
            </button>
          </div>
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


