"use client";

import React from "react";
import Link from "next/link";
import { BriefcaseBusiness, ChartNoAxesCombined, ChevronRight, Code2, FileText, GraduationCap, Sparkles, Target, TrendingUp } from "lucide-react";
import { useAttendance, useMarks, useUserInfo } from "@/hooks/query";
import { Card } from "@/app/components/ui/Card";

const getAverageMarks = (marks: ReturnType<typeof useMarks>["data"]) => {
  if (!marks || marks.length === 0) return 0;
  const scored = marks
    .map((mark) => {
      const obtained = Number(mark.total?.obtained ?? 0);
      const max = Number(mark.total?.maxMark ?? 0);
      return max > 0 ? (obtained / max) * 100 : 0;
    })
    .filter((value) => value > 0);

  if (scored.length === 0) return 0;
  return scored.reduce((sum, value) => sum + value, 0) / scored.length;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function PlacementsPage() {
  const { data: attendance } = useAttendance();
  const { data: marks } = useMarks();
  const { data: userInfo } = useUserInfo();

  const avgAttendance =
    attendance && attendance.length > 0
      ? attendance.reduce((sum, item) => sum + Number(item.courseAttendance), 0) / attendance.length
      : 0;
  const avgMarks = getAverageMarks(marks);
  const riskSubjects = (attendance ?? []).filter((item) => Number(item.courseAttendance) < 75).length;
  const strongSubjects = (marks ?? [])
    .map((mark) => {
      const obtained = Number(mark.total?.obtained ?? 0);
      const max = Number(mark.total?.maxMark ?? 0);
      return { subject: mark.subject, percent: max > 0 ? (obtained / max) * 100 : 0 };
    })
    .filter((entry) => entry.percent >= 75)
    .length;

  const placementScore = clamp(Math.round(avgAttendance * 0.4 + avgMarks * 0.45 + Math.max(0, 15 - riskSubjects * 5)), 0, 100);
  const readiness =
    placementScore >= 82
      ? "Placement ready"
      : placementScore >= 68
        ? "Build consistency"
        : "Strengthen academics";

  const tracks: Array<{
    title: string;
    value: string;
    note: string;
    icon: React.ReactNode;
    tone: "amber" | "sky" | "emerald";
  }> = [
    {
      title: "Resume Layer",
      value: `${strongSubjects} proof subjects`,
      note: "Use your strongest academic areas as anchors for resume bullets and project themes.",
      icon: <FileText size={18} />,
      tone: "amber",
    },
    {
      title: "Aptitude Layer",
      value: `${placementScore}/100 score`,
      note: "Your placement score estimates how prepared your academic baseline looks right now.",
      icon: <Target size={18} />,
      tone: "sky",
    },
    {
      title: "Coding Layer",
      value: `${riskSubjects === 0 ? "Stable" : "Needs balance"}`,
      note: "The less academic firefighting you have, the more time you can invest in coding and DSA.",
      icon: <Code2 size={18} />,
      tone: "emerald",
    },
  ];

  const nextActions = [
    "Solve one aptitude or coding problem daily and track streaks here later.",
    "Keep one polished resume and one mini-project ready for fast applications.",
    "Use AI to convert weak subjects into short revision plans before they become placement distractions.",
    "Protect your attendance buffer so placement prep does not collide with shortage recovery.",
  ];

  const readinessLanes = [
    {
      title: "Academic Baseline",
      value: `${avgMarks.toFixed(0)}% average`,
      caption: avgMarks >= 75 ? "Good enough to support placement confidence." : "Raise this to improve eligibility confidence.",
    },
    {
      title: "Attendance Stability",
      value: `${avgAttendance.toFixed(1)}% attendance`,
      caption: avgAttendance >= 80 ? "Strong stability for a prep semester." : "Protect this before placement season becomes busy.",
    },
    {
      title: "Risk Subjects",
      value: `${riskSubjects} active`,
      caption: riskSubjects === 0 ? "You have space to focus on coding and interviews." : "Reduce these to free up mental bandwidth.",
    },
  ];

  const linkedSections = [
    { href: "/app/attendance", label: "Attendance intelligence" },
    { href: "/app/marks", label: "Marks radar" },
    { href: "/app/dashboard", label: "Student OS dashboard" },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-24 pt-4 sm:px-6">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_35%)]" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-premium-gold/20 bg-premium-gold/10 px-4 py-1 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
            <GraduationCap size={14} />
            Placement Command Center
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Turn academic stability into interview readiness.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
            This hub is now a stronger placement prep layer for {userInfo?.name?.split(" ")[0] ?? "you"}. It translates attendance, marks, and current academic risk into a practical readiness system you can act on.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <PlacementMetric title="Placement Score" value={`${placementScore}/100`} note="Current academic readiness estimate" tone="gold" />
        <PlacementMetric title="Readiness Mode" value={readiness} note="Your current placement operating mode" tone="emerald" />
        <PlacementMetric title="Strong Subjects" value={`${strongSubjects}`} note="Subjects that can support your profile" tone="sky" />
        <PlacementMetric title="Risk Subjects" value={`${riskSubjects}`} note="Academic risks that can slow prep" tone="rose" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-black/25 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">This Week</div>
              <h2 className="text-xl font-semibold text-white">Placement routine to keep momentum</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {nextActions.map((action) => (
              <div key={action} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-zinc-200">
                {action}
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-black/25 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-2 text-sky-300">
              <BriefcaseBusiness size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Readiness Lanes</div>
              <h2 className="text-xl font-semibold text-white">Where your placement story stands today</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {readinessLanes.map((lane) => (
              <div key={lane.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{lane.title}</div>
                <div className="mt-2 text-lg font-semibold text-white">{lane.value}</div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">{lane.caption}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {tracks.map((track) => (
          <TrackCard key={track.title} {...track} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/10 bg-black/25 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-premium-gold/20 bg-premium-gold/10 p-2 text-premium-gold">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Priority Stack</div>
              <h2 className="text-xl font-semibold text-white">What to improve first</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <PriorityStep
              title="1. Stabilize your academic floor"
              text={riskSubjects > 0 ? `You still have ${riskSubjects} risk subject${riskSubjects === 1 ? "" : "s"}. Bring those under control first.` : "Your academic floor is stable enough to focus more aggressively on placement prep."}
            />
            <PriorityStep
              title="2. Build one strong resume story"
              text="Pick one project direction connected to your strongest subject so your academic and placement narrative reinforce each other."
            />
            <PriorityStep
              title="3. Keep daily prep small but consistent"
              text="Short daily aptitude, coding, and interview practice beats random bursts before placement season."
            />
          </div>
        </Card>

        <Card className="border-white/10 bg-black/25 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-200">
              <ChartNoAxesCombined size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Linked Sections</div>
              <h2 className="text-xl font-semibold text-white">Use the rest of Classivo as your prep stack</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {linkedSections.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-colors hover:border-premium-gold/30 hover:text-premium-gold"
              >
                {link.label}
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}

const PlacementMetric = ({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: "gold" | "emerald" | "sky" | "rose";
}) => {
  const toneMap = {
    gold: "text-premium-gold border-premium-gold/20 bg-premium-gold/10",
    emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
    sky: "text-sky-300 border-sky-400/20 bg-sky-400/10",
    rose: "text-rose-300 border-rose-400/20 bg-rose-400/10",
  }[tone];

  return (
    <Card className="border-white/10 bg-black/25 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
      <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${toneMap}`}>{title}</div>
      <div className="mt-4 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-300">{note}</div>
    </Card>
  );
};

const TrackCard = ({
  title,
  value,
  note,
  icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  tone: "amber" | "sky" | "emerald";
}) => {
  const toneMap = {
    amber: "text-premium-gold border-premium-gold/20 bg-premium-gold/10",
    sky: "text-sky-300 border-sky-400/20 bg-sky-400/10",
    emerald: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10",
  }[tone];

  return (
    <Card className="border-white/10 bg-black/25 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
      <div className={`inline-flex rounded-xl border p-2 ${toneMap}`}>{icon}</div>
      <div className="mt-4 text-lg font-semibold text-white">{title}</div>
      <div className="mt-2 text-xl font-semibold text-premium-gold">{value}</div>
      <div className="mt-3 text-sm leading-7 text-zinc-300">{note}</div>
    </Card>
  );
};

const PriorityStep = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="text-sm font-semibold text-white">{title}</div>
    <div className="mt-2 text-sm leading-7 text-zinc-300">{text}</div>
  </div>
);
