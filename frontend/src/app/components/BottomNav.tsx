"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, allPages } from "@/config/nav";
import { ChevronsUpDown } from "lucide-react";
import { LiquidGlass } from "./liquid/glass";


const BottomNav = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const iconsRef = useRef<Array<HTMLAnchorElement | null>>([]);

  // Nav configuration moved to @/config/nav

  // Only show bottom nav on app pages


  const isActiveRoute = (href: string) => {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) return true;
    if (
      href === "/app/dashboard" &&
      (pathname === "/app/dashboard" || pathname === "/app/app/dashboard")
    )
      return true;
    return false;
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuOpen && dockRef.current && !dockRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Position the moving glass pill under the active nav item (simplified)
  useEffect(() => {
    const updatePill = () => {
      const dock = dockRef.current;
      if (!dock) return;

      // If expanded, clear pill vars
      if (menuOpen) {
        dock.style.removeProperty("--pill-left");
        dock.style.removeProperty("--pill-width");
        return;
      }

      const activeIndex = navItems.findIndex((item) => isActiveRoute(item.href));
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const targetAnchor = iconsRef.current[idx];
      if (!targetAnchor) return;

      const dockRect = dock.getBoundingClientRect();
      const targetRect = targetAnchor.getBoundingClientRect();

      const left = Math.round(targetRect.left - dockRect.left - 6);
      const width = Math.round(targetRect.width + 12);

      dock.style.setProperty("--pill-left", `${left}px`);
      dock.style.setProperty("--pill-width", `${width}px`);
      dock.style.setProperty("--pill-top", `6px`);
      dock.style.setProperty("--pill-origin", `${left + width / 2}px`);
    };

    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [pathname, menuOpen]);

  if (!pathname.startsWith("/app")) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md px-6 md:hidden transition-all duration-300 ${menuOpen ? "w-80" : "w-fit"
        }`}
    >
      <div
        ref={dockRef}
        className={`glass-dock transition-all duration-300 ease-out overflow-hidden ${menuOpen ? "h-72 rounded-3xl" : "h-16 rounded-full"
          }  flex flex-col justify-end items-center shadow-2xl bg-[#08090A]/60 backdrop-blur-md border border-white/10 relative z-40 w-full`}
      >
        <div
          className={`absolute inset-x-3 bottom-[25px] transition-all duration-300 ease-out origin-bottom ${menuOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
            }`}
        >
          <div className=" p-2 pb-0">
            <div className="flex flex-col gap-1">
              {allPages.map((page) => {
                const PageIcon = page.icon;
                // Check if this specific page is active
                const isActive = isActiveRoute(page.href);

                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={() => setMenuOpen(false)}
                    // CHANGED: Flex row, left aligned, dynamic background for active state
                    className={`group flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 ${isActive
                      ? "bg-zinc-800/40 text-white font-medium" // Active Styling (Pill)
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                  >
                    {/* Render the Icon */}
                    <PageIcon
                      size={20}
                      className={isActive ? "text-white" : "text-zinc-400 group-hover:text-white"}
                    />

                    {/* Render the Text */}
                    <span className="text-[15px]">
                      {page.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {!menuOpen && (
          <div className="w-full h-full flex justify-center items-center px-1 z-50">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    ref={(el: HTMLAnchorElement | null) => { iconsRef.current[navItems.indexOf(item)] = el; }}
                    className={`relative p-3 px-5 rounded-full transition-all duration-300 flex flex-col items-center gap-1 text-white border-white/10 ${isActive
                      ? "bg-white/10 translate-x-0"
                      : "hover:text-zinc-300 hover:-translate-y-1"
                      }`}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center hover:-translate-y-1 translate-x-0 ml-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-3 rounded-xl transition-all duration-300 text-white hover:text-zinc-300"
              >
                <ChevronsUpDown size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomNav;