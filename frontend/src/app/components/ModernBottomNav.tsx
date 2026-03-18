"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

import { 
  Home, 
  CalendarCheck, 
  Clock, 
  GraduationCap, 
  MoreHorizontal,
  LayoutDashboard,
  Calendar,
  Utensils,
  Settings,
  Bell
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Attend", href: "/app/attendance", icon: CalendarCheck },
  { name: "Schedule", href: "/app/timetable", icon: Clock },
  { name: "Marks", href: "/app/marks", icon: GraduationCap },
];

const allPages = [
  { name: "Dashboard", href: "/app/dashboard", icon: Home },
  { name: "Attendance", href: "/app/attendance", icon: CalendarCheck },
  { name: "Timetable", href: "/app/timetable", icon: Clock },
  { name: "Marks", href: "/app/marks", icon: GraduationCap },
  { name: "Calendar", href: "/app/calendar", icon: Calendar },
  { name: "Mess Menu", href: "/app/messmenu", icon: Utensils },
  { name: "Settings", href: "/app/settings", icon: Settings },
  { name: "Alerts", href: "/app/notifications", icon: Bell },
];

const ModernBottomNav = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/app/dashboard") {
        return pathname === "/app/dashboard" || pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  if (!pathname.startsWith("/app")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-10 pointer-events-none overflow-visible">
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      
      <div className="relative max-w-lg mx-auto flex flex-col items-center pointer-events-auto">
        {/* Expanded Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-20 w-full mb-2 p-3 rounded-[32px] bg-zinc-900/90 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] grid grid-cols-4 gap-2"
            >
              {allPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
                    isActive(page.href) ? "bg-premium-gold/10 text-premium-gold" : "text-zinc-400 hover:bg-white/5 active:scale-95"
                  }`}
                >
                  <page.icon size={20} />
                  <span className="text-[10px] font-medium mt-1 truncate w-full text-center">{page.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dock */}
        <motion.nav 
          initial={false}
          animate={{
            y: scrolled ? 0 : 0,
            scale: 1,
          }}
          className="relative w-full h-16 rounded-full flex items-center justify-between px-2 bg-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
        >
          {/* Moving Indicator */}
          <div className="absolute inset-y-2 flex items-center px-2 pointer-events-none w-full">
             <div className="relative w-full h-full">
                {navItems.map((item, i) => (
                  isActive(item.href) && (
                    <motion.div
                      key="indicator"
                      layoutId="navIndicator"
                      className="absolute top-0 bottom-0 rounded-full bg-premium-gold/15 border border-premium-gold/20"
                      style={{ 
                        left: `${(i / (navItems.length + 1)) * 100}%`,
                        width: `${(1 / (navItems.length + 1)) * 100}%`
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )
                ))}
             </div>
          </div>

          {/* Nav Items */}
          <div className="flex-1 flex items-center justify-around z-10">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
                    active ? "text-premium-gold" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <item.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                  {active && (
                    <motion.span 
                      layoutId="navText"
                      className="text-[8px] font-black uppercase tracking-widest mt-0.5"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}

            {/* More Menu Trigger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
                menuOpen ? "text-premium-gold bg-premium-gold/10" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <MoreHorizontal size={22} />
            </button>
          </div>
        </motion.nav>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ModernBottomNav;
