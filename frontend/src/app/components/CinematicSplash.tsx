"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClassivoLogo } from '@/components/ui/ClassivoLogo';

interface CinematicSplashProps {
  onComplete?: () => void;
}

const CinematicSplash: React.FC<CinematicSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasShown = sessionStorage.getItem("splash_shown");
    if (hasShown) {
      setIsVisible(false);
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          sessionStorage.setItem("splash_shown", "true");
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 800);
          return 100;
        }
        return prev + 2; // Slightly faster for better UX
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden bg-[#0D0D0D] font-sans"
    >
      {/* Ambient Background VFX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-premium-gold/5 blur-[120px] animate-pulse"></div>
        
        {/* Light Trails Simulation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-px h-64 bg-gradient-to-b from-premium-gold via-white to-transparent rotate-45 blur-[1px]"></div>
          <div className="absolute top-1/3 right-1/4 w-px h-80 bg-gradient-to-b from-white via-premium-gold to-transparent -rotate-[30deg] blur-[1px]"></div>
          
          <div className="absolute top-20 left-40 w-1 h-1 bg-white rounded-full opacity-20"></div>
          <div className="absolute bottom-40 right-20 w-1.5 h-1.5 bg-premium-gold rounded-full opacity-30"></div>
        </div>

        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-premium-gold/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Center Content: Logo & Branding */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 w-28 h-28 flex items-center justify-center rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.1)]"
        >
          <ClassivoLogo className="w-16 h-16 text-premium-gold" />
        </motion.div>

        <motion.h1 
          className="text-6xl font-black tracking-tighter text-white uppercase italic"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Classivo
        </motion.h1>

        <motion.p 
          className="mt-4 text-xs font-bold tracking-[0.5em] uppercase text-premium-gold opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Academic Command Center
        </motion.p>
      </div>

      {/* Bottom UI: Loading & Status */}
      <div className="absolute bottom-24 z-10 w-full max-w-xs px-8 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-zinc-500 text-[10px] font-black tracking-widest animate-pulse uppercase">
            {progress < 30 ? 'Initializing Core...' : 
             progress < 70 ? 'Syncing Academic Data...' : 'Preparing Interface...'}
          </p>

          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/5 backdrop-blur-sm">
            <motion.div 
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-premium-gold/40 via-premium-gold to-white shadow-[0_0_15px_rgba(212,175,55,0.6)]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CinematicSplash;
