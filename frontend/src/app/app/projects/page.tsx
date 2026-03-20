"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserInfo } from "@/hooks/query";
import { 
  ArrowUpRight, 
  Bell, 
  Sparkles, 
  Cpu, 
  Settings, 
  Layers
} from "lucide-react";

const projectPartners = [
  {
    name: "Axon Labs",
    href: "/app/axon-labs",
    description: "Hardware synthesis, IoT integrations, and Raspberry Pi support delivered directly within the campus ecosystem.",
    badge: "Active",
    type: "Hardware & IoT",
    image: "/axon-labs-poster.svg",
    color: "emerald",
    icon: Cpu
  },
  {
    name: "Minimix",
    href: "/app/minimix",
    description: "Comprehensive engineering project support with real-time updates and dedicated lab assistance.",
    badge: "Partner",
    type: "Engineering Support",
    image: "/minimix-poster.svg",
    color: "blue",
    icon: Settings
  },
];

export default function ProjectsPage() {
  const { data: userInfo } = useUserInfo();

  return (
    <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white px-6 pb-32 pt-12 overflow-y-auto font-sans">
      <div className="relative z-10 flex flex-col gap-10 max-w-lg mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
               <span className="text-zinc-500 font-bold text-xs">{userInfo?.name?.[0] || "C"}</span>
            </div>
            <h1 className="text-xl font-black tracking-tight">
              Welcome back, <span className="text-premium-gold">{userInfo?.name?.split(" ")[0] || "Curator"}</span>
            </h1>
          </div>
          <button className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <Bell size={20} />
          </button>
        </header>

        {/* Studio Flux Hub */}
        <section className="relative">
           <div className={`relative h-[240px] w-full rounded-[40px] overflow-hidden flex flex-col items-center justify-center border border-white/10 bg-zinc-900/40 backdrop-blur-xl`}>
              {/* Dynamic Glow */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
                 <div className="h-40 w-40 bg-premium-gold rounded-full blur-[80px]" />
                 <div className="absolute h-48 w-48 border-[2px] border-premium-gold/20 rounded-[40%] animate-[spin_10s_linear_infinite]" />
              </div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Studio Flux</p>
                 <div className="flex items-baseline justify-center">
                    <span className="text-8xl font-black leading-none tracking-tighter">02</span>
                    <span className="text-2xl font-black text-zinc-500 ml-2">Active</span>
                 </div>
                 <div className="mt-6 px-4 py-1.5 rounded-full bg-premium-gold/10 border border-premium-gold/20 flex items-center gap-2">
                    <Layers size={12} className="text-premium-gold" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-premium-gold">Prototypes Available</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Project Partners */}
        <section className="flex flex-col gap-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Collaborations</h2>
              <Sparkles size={18} className="text-zinc-800" />
           </div>
           
           <div className="flex flex-col gap-10">
              {projectPartners.map((partner, i) => (
                <Link href={partner.href} key={i} className="group">
                  <div className="flex flex-col gap-6">
                    <div className="relative h-[280px] w-full rounded-[40px] overflow-hidden border border-white/5 bg-zinc-900/40">
                       <Image
                          src={partner.image}
                          alt={partner.name}
                          fill
                          className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                       
                       <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <partner.icon size={12} className={`text-${partner.color}-400`} />
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{partner.type}</span>
                             </div>
                             <h3 className="text-2xl font-black tracking-tight">{partner.name}</h3>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-premium-gold group-hover:text-black transition-all">
                             <ArrowUpRight size={20} />
                          </div>
                       </div>
                    </div>
                    
                    <div className="px-2 space-y-4">
                       <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                          {partner.description}
                       </p>
                       <div className="flex items-center gap-4">
                          <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                             <div className={`h-full bg-${partner.color}-500/40 w-[60%] rounded-full`} />
                          </div>
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{partner.badge}</span>
                       </div>
                    </div>
                  </div>
                </Link>
              ))}
           </div>
        </section>

        {/* Expansion Note */}
        <footer className="mt-10 p-8 rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-xl">
           <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold">
                 <Sparkles size={16} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nexus Growth</p>
           </div>
           <p className="text-xs text-zinc-500 leading-relaxed italic">
              &quot;The projects tab is designed as an evolving hub. New research labs and student initiatives integrate seamlessly into this flux.&quot;
           </p>
        </footer>

      </div>
    </main>
  );
}
