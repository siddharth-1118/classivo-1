"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FolderKanban,
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
    { name: "Attend", href: "/app/attendance", icon: CalendarCheck, color: "text-slate-700" },
    { name: "Schedule", href: "/app/timetable", icon: Clock, color: "text-slate-700" },
    { name: "Marks", href: "/app/marks", icon: GraduationCap, color: "text-slate-700" },
    { name: "Projects", href: "/app/projects", icon: FolderKanban, color: "text-slate-700" },
    { name: "GradeX", href: "/app/gradex", icon: Target, color: "text-slate-700" },
    { name: "Courses", href: "/app/course", icon: BookOpen, color: "text-slate-700" },
    { name: "Percent", href: "/app/percentage", icon: Book, color: "text-slate-700" },
    { name: "Dining", href: "/app/messmenu", icon: Utensils, color: "text-slate-700" },
    { name: "Alerts", href: "/app/notifications", icon: Bell, color: "text-slate-700" },
    { name: "Chat", href: "/app/chat", icon: MessageSquare, color: "text-slate-700" },
    { name: "Queries", href: "/app/queries", icon: HelpCircle, color: "text-slate-700" },
    { name: "Profile", href: "/app/profile", icon: User, color: "text-slate-700" },
    { name: "Community", href: "/app/community", icon: Users, color: "text-slate-700" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pointer-events-none">
      <div className="relative max-w-md mx-auto flex flex-col items-center justify-end pointer-events-auto">
        
        {/* Expanded Menu */}
        {isExpanded && (
            <div className="absolute bottom-24 w-full grid grid-cols-4 gap-3 rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsExpanded(false)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 ${item.color}`}>
                    <item.icon size={22} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                </Link>
              ))}
            </div>
        )}

        <nav className="grid h-[72px] w-full grid-cols-[1fr_1fr_auto_1fr_1fr_1fr] items-center gap-1 rounded-[2.5rem] border border-slate-200 bg-white px-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <Link href="/app/dashboard" className={`relative flex justify-center p-2 ${pathname === "/app/dashboard" ? "text-blue-600" : "text-slate-500"}`}>
            <Home size={26} strokeWidth={pathname === "/app/dashboard" ? 2.5 : 1.5} />
          </Link>
          
          <Link href="/app/attendance" className={`relative flex justify-center p-2 ${pathname === "/app/attendance" ? "text-blue-600" : "text-slate-500"}`}>
            <CalendarCheck size={26} strokeWidth={pathname === "/app/attendance" ? 2.5 : 1.5} />
          </Link>

          {/* Prominent Plus Button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`relative -top-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-900 ${isExpanded ? "rotate-45" : "rotate-0"}`}
          >
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white">
               <span className="text-3xl font-light">+</span>
            </div>
          </button>

          <Link href="/app/marks" className={`relative flex justify-center p-2 ${pathname === "/app/marks" ? "text-blue-600" : "text-slate-500"}`}>
            <GraduationCap size={26} strokeWidth={pathname === "/app/marks" ? 2.5 : 1.5} />
          </Link>

          <Link href="/app/timetable" className={`relative flex justify-center p-2 ${pathname === "/app/timetable" ? "text-blue-600" : "text-slate-500"}`}>
            <Clock size={26} strokeWidth={pathname === "/app/timetable" ? 2.5 : 1.5} />
          </Link>

          <Link href="/app/calendar" className={`relative flex justify-center p-2 ${pathname === "/app/calendar" ? "text-blue-600" : "text-slate-500"}`}>
            <Calendar size={26} strokeWidth={pathname === "/app/calendar" ? 2.5 : 1.5} />
            {pathname === "/app/calendar" && (
              <div className="absolute top-4 right-5 h-1.5 w-1.5 rounded-full bg-blue-600" />
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
