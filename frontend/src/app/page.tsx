import Link from "next/link";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { Zen_Dots } from "next/font/google";

const zenDots = Zen_Dots({ weight: "400", subsets: ["latin"] });

const features = [
  "Attendance",
  "Marks",
  "Timetable",
  "Calendar",
  "Mess Menu",
  "Community",
  "Faculty Reviews",
  "Roommate Finder",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <ClassivoLogo className="h-7 w-7 text-blue-600" />
            <span className={`text-xl tracking-widest text-slate-900 ${zenDots.className}`}>
              CLASSIVO
            </span>
          </div>
          <Link
            href="/auth/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Student Portal</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            A simple website for SRM students.
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
            Classivo brings attendance, marks, timetable, day order, calendar, mess menu,
            community, and student tools into one clean place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/login"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Open Classivo
            </Link>
            <Link
              href="/app/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 shadow-sm"
            >
              {feature}
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Why students use it</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              It reduces repeated checking across different places. Students can quickly see
              classes, attendance, marks, and updates in one website.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Built for daily use</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The focus is clarity, speed, and useful student features instead of heavy visuals
              or fancy 3D effects.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center text-xs uppercase tracking-[0.22em] text-slate-400">
          made by vss
        </div>
      </section>
    </main>
  );
}
