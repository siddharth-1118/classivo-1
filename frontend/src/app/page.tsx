import Link from "next/link";
import { AIChat } from "./components/AIChat";

export default function Home() {
  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_35%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col rounded-[32px] skeuo-flat skeuo-beveled-edge px-8 py-12 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-12">
        <div className="rounded-full border border-premium-gold/20 bg-premium-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-premium-gold">
          Classivo SRM
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          A comprehensive academic platform for viewing your timetable, attendance, marks, and academic calendar with clarity.
        </h1>

        <p className="mt-5 max-w-4xl text-base leading-8 text-zinc-300 sm:text-lg">
        Classivo is built for students who want everything important in one place without confusion. Instead of searching through many pages,
          trying to understand raw academic data, or checking the same details again and again, this app gives you a clean student-friendly
          view of your daily academic life — plus an <strong>AI study assistant</strong> available 24/7 for any academic questions.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-semibold text-white">Core Academic Functions</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              You can quickly check today&apos;s classes, see the correct day order, understand your marks subject by subject,
              and know whether your attendance is safe or needs attention. Everything is shown in a way that students can understand fast.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-semibold text-white">Why Classivo Matters</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Many student portals show information, but they do not explain it well. Classivo turns that data into a simple experience
              with graphs, clear cards, helpful labels, and readable summaries so you can make decisions easily.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-semibold text-white">Platform Overview</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Timetable shows your classes in box format with time and subject clearly. Attendance shows your safe subjects and risky subjects.
              Marks shows your subject performance with graphs and simple progress view. Calendar helps you follow important academic dates and day orders.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-xl font-semibold text-white">Designed for Daily Academic Use</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Whether you want to know what class is happening now, how many classes you can still miss, or how your marks are improving,
              Classivo is designed to make those answers quick, direct, and easy to understand.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/auth/login"
            className="rounded-2xl skeuo-convex px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:text-premium-gold active:skeuo-pressed active:scale-[0.98] border border-white/5"
          >
            Proceed to Sign In
          </Link>
          <span className="text-sm text-zinc-400">
            Select this option to access the secure sign-in page.
          </span>
        </div>

        <div className="mt-12 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          made by vss
        </div>
      </div>
    </main>
    <AIChat />
    </>
  );
}

