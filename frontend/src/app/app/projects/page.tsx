"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";
import { AxonLabsIcon } from "@/components/ui/AxonLabsIcon";
import { MinimixIcon } from "@/components/ui/MinimixIcon";
import { ProjectsHubIcon } from "@/components/ui/ProjectsHubIcon";

const projectPartners = [
  {
    name: "Axon Labs",
    href: "/app/axon-labs",
    description:
      "Embedded systems, IoT, PCB, Arduino, ESP32, Raspberry Pi, and expo-ready project support delivered inside campus.",
    badge: "Live Now",
    image: "/axon-labs-poster.svg",
    imageAlt: "Axon Labs poster",
    icon: AxonLabsIcon,
  },
  {
    name: "Minimix",
    href: "/app/minimix",
    description:
      "Affordable SRM engineering projects with full support, direct calling access, WhatsApp group updates, and a strong first impression for labs and viva.",
    badge: "New Partner",
    image: "/minimix-poster.svg",
    imageAlt: "Minimix poster",
    icon: MinimixIcon,
  },
];

export default function ProjectsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_28%),linear-gradient(180deg,#07111f,#0c1730_55%,#08101d)] text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:88px_88px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 md:p-8">
        <Card className="border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
              <ProjectsHubIcon className="h-12 w-12" />
            </div>
            <div>
              <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                Builder Hub
              </Badge>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Projects</h1>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            Discover student-friendly project partners inside Classivo. Start with Axon Labs and Minimix now, and this
            hub can keep growing as more labs join.
          </p>
        </Card>

        <section className="grid gap-6 lg:grid-cols-2">
          {projectPartners.map((partner) => (
            <Card key={partner.name} className="overflow-hidden border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-3">
                  <Image
                    src={partner.image}
                    alt={partner.imageAlt}
                    width={1200}
                    height={1200}
                    className="h-auto w-full rounded-[18px]"
                  />
                </div>

                <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                          {partner.badge}
                        </Badge>
                        <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Project Partner</span>
                      </div>
                      <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <partner.icon className="h-7 w-7" />
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold text-white">{partner.name}</h2>
                      <p className="mt-3 text-sm leading-7 text-zinc-300">{partner.description}</p>
                    </div>

                  <Link
                    href={partner.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-cyan-200"
                  >
                    Open {partner.name} <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </Card>
          ))}

          <Card className="border-dashed border-white/10 bg-white/5 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 text-cyan-200">
              <Sparkles size={18} />
              More labs can be added here
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300">
              This Projects tab is now set up as a hub, so when you share another lab later we can simply add a new
              card and route without changing the whole dashboard structure again.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
