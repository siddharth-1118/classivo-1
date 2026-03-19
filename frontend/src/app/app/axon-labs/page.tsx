"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, CircuitBoard, Cpu, Radio, Rocket, Wifi } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";
import { AxonLabsIcon } from "@/components/ui/AxonLabsIcon";

const categories = [
  "Physics",
  "Semiconductor",
  "EEE",
  "COA",
  "EMT",
  "IoT",
  "PCB",
  "Arduino Based projects",
  "ESP32, Raspberry Pi projects",
  "Winning projects for Hackathons and EXPOS",
];

const highlights = [
  "Ready-made and custom projects",
  "Easy to present and well documented",
  "Best for labs, assignments, and expo demos",
  "Run by SRM students and delivered inside campus",
];

export default function AxonLabsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),linear-gradient(180deg,#07111f,#0c1730_55%,#08101d)] text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:88px_88px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 md:p-8">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                <AxonLabsIcon className="h-12 w-12" />
              </div>
              <div>
                <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  Campus Builder Hub
                </Badge>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Axon Labs</h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
              Embedded systems, IoT builds, expo-ready demos, and custom project help for SRM students who want
              something polished enough to present and practical enough to actually work.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card className="border-cyan-400/15 bg-cyan-400/10 p-4">
                <div className="flex items-center gap-2 text-cyan-200">
                  <CircuitBoard size={16} />
                  Project Types
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">10+</div>
              </Card>
              <Card className="border-emerald-400/15 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Rocket size={16} />
                  Delivery
                </div>
                <div className="mt-2 text-lg font-semibold text-white">Inside Campus</div>
              </Card>
              <Card className="border-amber-300/15 bg-amber-300/10 p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <Award size={16} />
                  Best For
                </div>
                <div className="mt-2 text-lg font-semibold text-white">Labs, Expo, Hackathons</div>
              </Card>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="https://chat.whatsapp.com/GqH6efLktAs4ud4hpZysgj?mode=ac_t"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-zinc-100"
              >
                Join WhatsApp Updates <ArrowRight size={16} />
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.16),transparent_34%)]" />
              <Image
                src="/axon-labs-poster.svg"
                alt="Axon Labs poster"
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
              <Cpu className="text-cyan-300" size={18} />
              <h2 className="text-xl font-semibold text-white">Projects Available</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
                >
                  {category}
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-white/10 bg-black/25 p-6">
            <div className="flex items-center gap-3">
              <Wifi className="text-emerald-300" size={18} />
              <h2 className="text-xl font-semibold text-white">Why Students Pick It</h2>
            </div>
            <div className="mt-5 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-zinc-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[24px] border border-cyan-400/15 bg-cyan-400/10 p-5">
              <div className="flex items-center gap-2 text-cyan-100">
                <Radio size={16} />
                Stay Updated
              </div>
              <p className="mt-2 text-sm leading-7 text-zinc-200">
                Want new project drops, custom build updates, or hackathon-ready ideas? Join the Axon Labs WhatsApp
                group and get updates directly.
              </p>
              <Link
                href="https://chat.whatsapp.com/GqH6efLktAs4ud4hpZysgj?mode=ac_t"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-cyan-200"
              >
                Open WhatsApp Group <ArrowRight size={14} />
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
