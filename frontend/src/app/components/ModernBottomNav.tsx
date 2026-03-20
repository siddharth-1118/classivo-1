"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Clock,
  GraduationCap,
  Utensils,
  Bell,
  BookOpen,
  MessageSquare,
  HelpCircle,
  User,
  Users,
  Book,
  Target
} from "lucide-react";


const ModernBottomNav = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pathname.startsWith("/app")) return null;

  const menuItems = [
    { name: "Attend", href: "/app/attendance", icon: CalendarCheck, color: "text-emerald-400" },
    { name: "Schedule", href: "/app/timetable", icon: Clock, color: "text-blue-400" },
    { name: "Marks", href: "/app/marks", icon: GraduationCap, color: "text-purple-400" },
    { name: "Planner", href: "/app/projects", icon: LayoutDashboard, color: "text-amber-300" },
    { name: "GradeX", href: "/app/gradex", icon: Target, color: "text-amber-400" },
    { name: "Courses", href: "/app/course", icon: BookOpen, color: "text-amber-400" },
    { name: "Percent", href: "/app/percentage", icon: Book, color: "text-indigo-400" },
    { name: "Dining", href: "/app/messmenu", icon: Utensils, color: "text-orange-400" },
    { name: "Alerts", href: "/app/notifications", icon: Bell, color: "text-rose-400" },
    { name: "Chat", href: "/app/chat", icon: MessageSquare, color: "text-sky-400" },
    { name: "Queries", href: "/app/queries", icon: HelpCircle, color: "text-pink-400" },
    { name: "Profile", href: "/app/profile", icon: User, color: "text-zinc-400" },
    { name: "Community", href: "/app/community", icon: Users, color: "text-teal-400" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pointer-events-none">
      <div className="relative max-w-md mx-auto flex flex-col items-center justify-end pointer-events-auto">
        
        {/* Expanded Menu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-24 w-full grid grid-cols-4 gap-3 p-6 rounded-[2.5rem] bg-black/80 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsExpanded(false)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`h-12 w-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center transition-all group-active:scale-95 ${item.color}`}>
                    <item.icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="grid w-full grid-cols-[1fr_1fr_auto_1fr_1fr_1fr] items-center gap-1 rounded-[2.5rem] border border-white/5 bg-[#0D0D0D]/90 px-4 h-[76px] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <Link href="/app/dashboard" className={`relative flex justify-center p-2 transition-all ${pathname === "/app/dashboard" ? "text-premium-gold" : "text-zinc-600"}`}>
            <Home size={26} strokeWidth={pathname === "/app/dashboard" ? 2.5 : 1.5} />
          </Link>
          
          <Link href="/app/attendance" className={`relative flex justify-center p-2 transition-all ${pathname === "/app/attendance" ? "text-premium-gold" : "text-zinc-600"}`}>
            <CalendarCheck size={26} strokeWidth={pathname === "/app/attendance" ? 2.5 : 1.5} />
          </Link>

          {/* Prominent Plus Button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`relative -top-6 h-16 w-16 rounded-full bg-premium-gold shadow-[0_10px_30px_rgba(212,175,55,0.3)] flex items-center justify-center text-black transition-all active:scale-90 overflow-hidden group ${isExpanded ? "rotate-45" : "rotate-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
            <div className="relative z-10 flex items-center justify-center h-8 w-8 rounded-lg bg-black/5">
               <span className="text-3xl font-light">+</span>
            </div>
          </button>

          <Link href="/app/marks" className={`relative flex justify-center p-2 transition-all ${pathname === "/app/marks" ? "text-premium-gold" : "text-zinc-600"}`}>
            <GraduationCap size={26} strokeWidth={pathname === "/app/marks" ? 2.5 : 1.5} />
          </Link>

          <Link href="/app/timetable" className={`relative flex justify-center p-2 transition-all ${pathname === "/app/timetable" ? "text-premium-gold" : "text-zinc-600"}`}>
            <Clock size={26} strokeWidth={pathname === "/app/timetable" ? 2.5 : 1.5} />
          </Link>

          <Link href="/app/calendar" className={`relative flex justify-center p-2 transition-all ${pathname === "/app/calendar" ? "text-premium-gold" : "text-zinc-600"}`}>
            <Calendar size={26} strokeWidth={pathname === "/app/calendar" ? 2.5 : 1.5} />
            {pathname === "/app/calendar" && (
              <div className="absolute top-4 right-5 h-1.5 w-1.5 rounded-full bg-premium-gold" />
            )}
          </Link>
        </nav>
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
