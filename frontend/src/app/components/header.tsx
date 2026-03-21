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
      <div className="relative max-w-5xl w-full flex px-4 h-[70%] items-center justify-between rounded-full border border-slate-200 bg-white">
        <div className="flex gap-4 items-center justify-center">
          <ClassivoLogo className="h-6 w-6 text-blue-600" />
          <h1 className={`text-2xl tracking-widest text-slate-900 ${zenDots.className}`}>
            CLASSIVO
          </h1>
          <span className="sr-only" aria-live="polite">{value}</span>
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>
    </div>
  );
};

export default Header;
