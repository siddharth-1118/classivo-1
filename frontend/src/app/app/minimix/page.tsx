"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, Rocket, Sparkles, Users, Wifi } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";
import { MinimixIcon } from "@/components/ui/MinimixIcon";

const offerings = [
  "Physics and Semiconductor Projects",
  "Electrical and Electronics (EEE)",
  "Computer Organization (COA)",
  "Electromagnetic Theory (EMT)",
  "IoT and Smart Systems",
  "Arduino-Based Projects",
];

const strengths = [
  "Affordable and ready-made engineering projects",
  "Step-by-step support from idea to execution",
  "Strong first impression for labs, viva, and placements",
  "Built for SRM students who want practical, impressive work",
];

const phoneNumber = "93445 40354";
const whatsappGroup = "https://chat.whatsapp.com/FXCpoEHK30Y8LSkI97psJg?mode=gi_t";

export default function MinimixPage() {
  return (
    <main className="relative min-h-screen overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_28%),linear-gradient(180deg,#22114a,#2b1a66_45%,#1a1036)] text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:88px_88px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 md:p-8">
        <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="overflow-hidden border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-orange-300/20 bg-orange-300/10 p-3">
                <MinimixIcon className="h-12 w-12" />
              </div>
              <div>
                <Badge variant="outline" className="border-orange-300/20 bg-orange-300/10 text-orange-100">
                  Project Partner
                </Badge>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Minimix</h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-200 sm:text-base">
              Innovative SRM projects with affordable ready-made engineering support, direct calling access, and a
              beginner-friendly path from concept to completed build.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card className="border-orange-300/15 bg-orange-300/10 p-4">
                <div className="flex items-center gap-2 text-orange-100">
                  <Sparkles size={16} />
                  Positioning
                </div>
                <div className="mt-2 text-lg font-semibold text-white">Creative + Affordable</div>
              </Card>
              <Card className="border-cyan-300/15 bg-cyan-300/10 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Rocket size={16} />
                  Best For
                </div>
                <div className="mt-2 text-lg font-semibold text-white">Labs, Viva, Placements</div>
              </Card>
              <Card className="border-emerald-300/15 bg-emerald-300/10 p-4">
                <div className="flex items-center gap-2 text-emerald-100">
                  <Phone size={16} />
                  Contact
                </div>
                <div className="mt-2 text-lg font-semibold text-white">{phoneNumber}</div>
              </Card>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`tel:${phoneNumber.replace(/\s+/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-zinc-100"
              >
                Call {phoneNumber} <Phone size={16} />
              </Link>
              <Link
                href={whatsappGroup}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Join WhatsApp Group <ArrowRight size={16} />
              </Link>
              <Link
                href="/app/projects"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Back to Projects
              </Link>
            </div>
          </Card>

          <Card className="overflow-hidden border-white/10 bg-black/30 p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.16),transparent_34%)]" />
              <Image
                src="/minimix-poster.svg"
                alt="Minimix poster"
                width={1200}
                height={1200}
                className="relative z-10 mx-auto h-auto w-full max-w-md rounded-[24px]"
                priority
              />
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <Card className="border-white/10 bg-black/25 p-6">
            <div className="flex items-center gap-3">
              <MinimixIcon className="h-5 w-5" />
              <h2 className="text-xl font-semibold text-white">What Minimix Offers</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {offerings.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-white/10 bg-black/25 p-6">
            <div className="flex items-center gap-3">
              <Wifi className="text-cyan-200" size={18} />
              <h2 className="text-xl font-semibold text-white">Why It Makes A Strong First Impression</h2>
            </div>
            <div className="mt-5 space-y-3">
              {strengths.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-zinc-100">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[24px] border border-orange-300/15 bg-orange-300/10 p-5">
              <div className="flex items-center gap-2 text-orange-100">
                <Users size={16} />
                Direct Contact
              </div>
              <p className="mt-2 text-sm leading-7 text-zinc-100">
                Don&apos;t wait. Start building your future today with direct support from Minimix. DM, call, or join the
                WhatsApp group to begin.
              </p>
              <div className="mt-4 space-y-2 text-sm text-white">
                <div>Call: {phoneNumber}</div>
                <Link href={whatsappGroup} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-orange-100">
                  Open WhatsApp Group <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
