"use client";
import React from "react";
import Link from "next/link";
import { useUserInfo } from "@/hooks/query";
import { Badge } from "@/app/components/ui/Badge";
import { ChevronRight, User, LogOut, Book, TrendingUp, Sparkles, LockKeyhole, PanelsTopLeft } from "lucide-react";

const SettingsPage = () => {
  const { data: userInfo } = useUserInfo();

  return (
    <main className="min-h-screen w-full overflow-y-auto text-white">
      <div className="mx-auto max-w-4xl px-4 pb-6 pt-2 sm:px-6">
        <header className="mb-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-premium-gold/25 bg-premium-gold/10 text-[10px] uppercase tracking-[0.22em] text-premium-gold">
              Settings
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Application Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
            Manage profile access, academic shortcuts, and account actions from a premium glassmorphism settings interface.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <InfoCard icon={<User size={12} />} label="Account" value={userInfo?.name || "Student account"} />
            <InfoCard icon={<PanelsTopLeft size={12} />} label="Academic" value="Shortcuts and utilities" />
            <InfoCard icon={<Sparkles size={12} />} label="Interface" value="Premium glass design" />
          </div>
        </header>

        <div className="space-y-6">
          <section>
            <h2 className="mb-4 pl-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Account</h2>
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <SettingsLink
                href="/app/profile"
                icon={<User size={18} />}
                title="Profile"
                description="View your student information and account details"
                trailing={userInfo?.name || "User"}
              />
              <SettingsLink
                href="https://academia.srmist.edu.in/reset"
                icon={<LockKeyhole size={18} />}
                title="Security"
                description="Update your SRM password through Academia"
                trailing="Change Password"
                noBorder
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 pl-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Academics</h2>
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <SettingsLink
                href="/app/course"
                icon={<Book size={18} />}
                title="Courses"
                description="Access registered courses and class details"
              />
              <SettingsLink
                href="/app/percentage"
                icon={<TrendingUp size={18} />}
                title="Percentages"
                description="Review your subject-wise percentage summary"
                noBorder
              />
            </div>
          </section>

          <section>
            <h2 className="mb-4 pl-1 text-xs font-bold uppercase tracking-widest text-zinc-500">Exit</h2>
            <div className="overflow-hidden rounded-[24px] border border-red-500/20 bg-red-500/5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <Link href="/auth/logout" className="flex items-center justify-between p-4 transition-colors hover:bg-red-500/10">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
                    <LogOut size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-400">Log Out</p>
                                        <p className="mt-1 text-xs text-red-200/70">Securely end the current session</p>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600 font-mono">Classivo premium settings</p>
        </div>
      </div>
    </main>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-sm font-medium text-white">{value}</div>
  </div>
);

const SettingsLink = ({
  href,
  icon,
  title,
  description,
  trailing,
  noBorder,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  trailing?: string;
  noBorder?: boolean;
}) => (
  <Link
    href={href}
    className={`flex items-center justify-between p-4 transition-colors hover:bg-white/5 ${noBorder ? "" : "border-b border-white/10"}`}
  >
    <div className="flex items-center gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300">{icon}</div>
      <div>
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {trailing ? <span className="text-sm text-zinc-500">{trailing}</span> : null}
      <ChevronRight size={16} className="text-zinc-600" />
    </div>
  </Link>
);

export default SettingsPage;
