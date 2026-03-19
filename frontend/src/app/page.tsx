import Link from "next/link";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { Zen_Dots } from "next/font/google";

const zenDots = Zen_Dots({ weight: "400", subsets: ["latin"] });

const roadmap = [
  "Daily AI Dashboard",
  "Attendance Intelligence",
  "AI Academic Copilot",
  "Marks Predictor",
  "Smart Notifications",
  "3D Student OS UI",
  "Placement Prep Hub",
  "Campus Utility Layer",
  "Collaborative Student Tools",
  "Semester Command Center",
];

const usps = [
  "Academic OS, not just a portal",
  "AI aware of your marks, timetable, attendance, and calendar",
  "Predictive insights instead of passive data display",
  "One place for academics, campus life, and placements",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.16),_transparent_40%),radial-gradient(circle_at_20%_30%,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),_transparent_32%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:80px_80px]" />

      <div className="relative z-10 flex w-full items-center justify-between px-6 pt-8 sm:px-12">
        <div className="flex items-center gap-3">
          <ClassivoLogo className="h-7 w-7 text-premium-gold" />
          <span className={`text-xl tracking-widest text-white ${zenDots.className}`}>
            CLASSIVO
          </span>
        </div>
        <Link
          href="/auth/login"
          className="rounded-2xl skeuo-convex px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:text-premium-gold active:skeuo-pressed active:scale-[0.98] border border-white/10 bg-white/5 backdrop-blur-xl"
        >
          Sign In
        </Link>
      </div>

      <div className="relative z-10 grid flex-1 grid-cols-1 gap-12 px-6 pb-12 pt-12 sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="text-left">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-premium-gold/20 bg-premium-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-premium-gold">
            <ClassivoLogo className="h-3.5 w-3.5" />
            3D AI Student OS
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl leading-tight">
            The 3D academic operating system that makes students open{" "}
            <span className="text-premium-gold">your app first.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Classivo combines timetable, attendance, marks, mess, placements, and AI into one cinematic student workspace. It is built to guide decisions, not just display data.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {usps.map((usp) => (
              <div
                key={usp}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 backdrop-blur-xl"
              >
                {usp}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/auth/login"
              className="rounded-2xl bg-premium-gold px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#f3cf63] active:scale-[0.98]"
            >
              Enter Classivo
            </Link>
            <Link
              href="/app/dashboard"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:border-premium-gold/25 hover:text-premium-gold"
            >
              View Student OS
            </Link>
          </div>

          <div className="mt-6 text-sm text-zinc-500">
            Free for SRM students, designed like a premium startup product.
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] [perspective:1800px]">
          <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-premium-gold/20 blur-3xl" />
          <div className="absolute -right-10 bottom-8 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative rounded-[32px] border border-white/10 bg-white/6 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl [transform:rotateX(14deg)_rotateY(-14deg)]">
            <div className="rounded-[28px] border border-white/10 bg-[#090c14]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-premium-gold">Student OS</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Mission Control</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
                  Live AI
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Daily Briefing", desc: "Today, tomorrow, next classes, and mess in one glance." },
                  { title: "Attendance Intelligence", desc: "Risk alerts, safe bunks, and must-attend subjects." },
                  { title: "Marks Predictor", desc: "Find weak subjects and know what to improve next." },
                  { title: "Placement Hub", desc: "Track readiness, aptitude, and interview momentum." },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                  >
                    <div className="text-sm font-semibold text-white">{feature.title}</div>
                    <p className="mt-2 text-xs leading-6 text-zinc-400">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-emerald-300">Why This Wins</div>
                <p className="mt-2 text-sm leading-7 text-zinc-100">
                  Other apps show student data. Classivo helps the student decide what to do next.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full px-6 pb-12 sm:px-12">
        <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-premium-gold">Top 10 Roadmap</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {roadmap.map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200"
                >
                  <span className="mr-2 text-premium-gold">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Startup-Style Edge</div>
            <div className="mt-5 space-y-3">
              {[
                "Student-first 3D interface that feels memorable instead of generic.",
                "AI assistant grounded in live academic and campus context.",
                "A single dashboard that reduces decision fatigue every day.",
                "Built for retention: mess, classes, attendance, marks, and placements in one loop.",
              ].map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-200"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Timetable", desc: "Day-order aware class timeline with premium motion." },
            { title: "Attendance", desc: "Safe-vs-risky subjects and actionable attendance guidance." },
            { title: "Placements", desc: "Career-readiness hub instead of a dead data page." },
            { title: "AI Assistant", desc: "Ask for study plans, risk analysis, and campus help." },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-premium-gold/20"
            >
              <h2 className="text-sm font-semibold text-white tracking-wide">{feature.title}</h2>
              <p className="mt-2 text-xs leading-6 text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            System Status: Online
          </div>
          <Link
            href="/app/admin/queries"
            className="text-[11px] uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            made by vss
          </Link>
        </div>
      </div>
    </main>
  );
}
