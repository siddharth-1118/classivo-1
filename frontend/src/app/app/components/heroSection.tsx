import Image from "next/image";
import React from "react";
import LandingImage from "@/../public/Landing/LandingImage.png";
import { Github, Terminal, Code } from "lucide-react";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";

const HeroSection = () => {
  return (
    <div className="flex-1 flex flex-col ">
      <div className="lg:py-10 py-10  w-full container flex mx-auto flex-col justify-center items-center">
        <div className="Classivo-card-subtle px-4 py-2 lg:text-sm text-xs Classivo-transition flex items-center gap-3">
          <Terminal size={16} className="text-white" />
          <span className="relative mx-1 bg-white w-2 h-2">
            <span className="absolute w-2 h-2 bg-white/70 animate-ping" />
          </span>
          <span className="Classivo-heading text-xs uppercase tracking-widest">SYSTEM ONLINE</span>
          <span className="Classivo-card px-2 py-1 text-[10px] flex gap-2 items-center font-mono border-premium-gold/30 text-premium-gold">
            V.7.1_STITCH_SYS
          </span>
        </div>
        <Content />
      </div>
      <div className="w-full flex justify-center items-center "></div>
    </div>
  );
};

export default HeroSection;

const Content = () => {
  return (
    <div className="py-10 flex flex-col w-full items-center justify-center gap-6 text-center">
      <div className="flex items-center justify-center gap-4 mb-6">
        <ClassivoLogo className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
      </div>
      <h1 className="lg:text-7xl text-4xl font-bold leading-tight Classivo-heading">
        <span className="text-white">/</span>CLASSIVO
      </h1>
      <div className="Classivo-card-subtle px-6 py-3 mt-6 max-w-3xl">
        <p className="lg:text-lg text-base Classivo-body text-center">
          {'>'} ELITE
          <br />
          <span className="text-white/70">[ SHARP • DIGITAL • UNCOMPROMISING ]</span>
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-8">
        <button className="Classivo-btn-secondary gap-3 flex items-center">
          <Github className="w-4 h-4" />
          <span>SOURCE</span>
        </button>
        <button className="Classivo-btn gap-3 flex items-center">
          <Terminal className="w-4 h-4" />
          <span>ACCESS</span>
        </button>
      </div>
      <div className="relative Classivo-card p-2 mt-8 lg:w-[85%] w-[95%] Classivo-transition">
        <div className="absolute inset-0 bg-white/10 blur-2xl -z-10" />
        <Image
          src={LandingImage}
          alt="CLASSIVO HACKER ACADEMIC SYSTEM - Terminal Interface"
          className="w-full h-auto border border-white shadow-2xl"
          priority
          fetchPriority="high"
          width={1006}
          height={499}
        />
        <div className="absolute top-4 left-4 Classivo-card-subtle px-3 py-1">
          <span className="Classivo-heading text-xs">CLASSIVO.TERM v5.0</span>
        </div>
      </div>
    </div>
  );
};

