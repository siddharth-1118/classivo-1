import Link from "next/link";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { Zen_Dots } from "next/font/google";

const zenDots = Zen_Dots({ weight: "400", subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090b] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.14),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_35%)]" />

        {/* TOP SECTION — Logo + Sign In CTA */}
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
            Sign In →
          </Link>
        </div>

        {/* HERO SECTION */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-12 sm:px-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-premium-gold/20 bg-premium-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-premium-gold mb-6">
            <ClassivoLogo className="h-3.5 w-3.5" />
            SRM Student Companion
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl leading-tight">
            Your Academic Life,{" "}
            <span className="text-premium-gold">Simplified.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
            Timetable · Attendance · Marks · AI Assistant — all in one premium interface built for SRM students.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/auth/login"
              className="rounded-2xl bg-premium-gold px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#f3cf63] active:scale-[0.98]"
            >
              Proceed to Sign In
            </Link>
            <span className="text-sm text-zinc-500">Free for all SRM students</span>
          </div>
        </div>

        {/* BOTTOM SECTION — Feature Cards */}
        <div className="relative z-10 w-full px-6 pb-12 sm:px-12">
          <div className="mx-auto max-w-5xl grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Timetable", desc: "Today's classes with day order" },
              { title: "Attendance", desc: "Safe vs risky subjects at a glance" },
              { title: "Marks", desc: "Subject-wise performance with graphs" },
              { title: "AI Assistant", desc: "Ask anything, 24/7 campus AI" },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl hover:border-premium-gold/20 transition-all"
              >
                <h2 className="text-sm font-semibold text-white tracking-wide">{f.title}</h2>
                <p className="mt-2 text-xs leading-6 text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/app/admin/queries"
              className="text-[11px] uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              made by vss
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
