import React from "react";
import { ClassivoLogo } from "@/components/ui/ClassivoLogo";
import { Zen_Dots } from 'next/font/google';
import Link from "next/link";
const zenDots = Zen_Dots({
  weight: '400',
  subsets: ['latin'],
});

const Header = ({ value }: { value: string }) => {
  return (
    <div className="w-full min-h-20 flex items-center justify-center lg:px-0 px-3">
      <div className="relative max-w-5xl w-full flex px-4 h-[70%] items-center justify-between apply-border-md rounded-full bg-white/5 backdrop-blur-xl">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-10 lg:w-auto lg:h-auto lg:inset-0 bg-white/10 blur-3xl -z-10 rounded-full" />
        <div className="flex gap-4 items-center justify-center">
          <ClassivoLogo className="h-6 w-6 text-premium-gold" />
          <h1 className={`text-2xl tracking-widest text-white ${zenDots.className}`}>
            CLASSIVO
          </h1>
          <span className="sr-only" aria-live="polite">{value}</span>
        </div>
        <Link
          href="/"
          className="px-3 py-1.5 rounded-full apply-border-md bg-white/5 hover:bg-white/10 transition-all"
        >
          Back
        </Link>
      </div>
    </div>
  );
};

export default Header;