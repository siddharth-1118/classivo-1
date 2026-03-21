"use client";

import React from "react";
import { useUserInfo } from "@/hooks/query";
import { UserInfo } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { Hash, Phone, Book, Layers, ChevronLeft, Sparkles, LogOut, Building2, BedDouble, SearchCheck } from "lucide-react";
import Link from "next/link";
import { fetchHostelRoommate, saveHostelRoommate } from "@/lib/studentHubApi";
import { toast } from "sonner";

type HostelRoommateState = {
  entry: { hostelName: string; roomNumber: string } | null;
  roommates: Array<{ name: string; department: string; hostelName: string; roomNumber: string }>;
  hasMatch: boolean;
  matchCount: number;
};

const Page = () => {
  const { data, isPending } = useUserInfo();
  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data) {
    return (
      <main className="w-full text-white flex items-center justify-center p-4 h-screen">
        <div className="absolute top-6 left-6 rounded-full border border-white/10 bg-white/5 p-3 backdrop-blur-xl"><Link href="/app/settings"><ChevronLeft size={24} /></Link></div>
        <div className="flex h-screen w-full justify-center items-center text-zinc-500">No profile data found</div>
      </main>
    );
  }

  return <Data data={data} />;
};

export default Page;

const Data = ({ data }: { data: UserInfo }) => {
  const initials = data.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const [hostelName, setHostelName] = React.useState("");
  const [roomNumber, setRoomNumber] = React.useState("");
  const [hostelState, setHostelState] = React.useState<HostelRoommateState | null>(null);
  const [isLoadingHostel, setIsLoadingHostel] = React.useState(true);
  const [isSavingHostel, setIsSavingHostel] = React.useState(false);

  const loadHostelState = React.useCallback(async () => {
    setIsLoadingHostel(true);
    try {
      const result = await fetchHostelRoommate();
      setHostelState(result);
      setHostelName(result.entry?.hostelName || "");
      setRoomNumber(result.entry?.roomNumber || "");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load hostel room details";
      toast.error(message);
    } finally {
      setIsLoadingHostel(false);
    }
  }, []);

  React.useEffect(() => {
    void loadHostelState();
  }, [loadHostelState]);

  const handleSaveHostel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hostelName.trim() || !roomNumber.trim()) {
      toast.error("Hostel name and room number are required.");
      return;
    }

    setIsSavingHostel(true);
    try {
      const response = await saveHostelRoommate({
        hostelName: hostelName.trim(),
        roomNumber: roomNumber.trim(),
      });
      toast.success(response.message || "Hostel room details saved.");
      await loadHostelState();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save hostel room details";
      toast.error(message);
    } finally {
      setIsSavingHostel(false);
    }
  };

  return (
    <main className="min-h-screen w-full text-white overflow-y-auto pb-20">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
                <Sparkles size={12} />
                Student Profile
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Academic Profile</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                Profile information synchronized from the academic portal, presented in a refined premium layout.
              </p>
            </div>
            <Link href="/app/settings" className="rounded-full border border-white/10 bg-white/5 p-3 text-zinc-300 hover:bg-white/10 hover:text-white">
              <ChevronLeft size={22} />
            </Link>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-premium-gold/12 blur-xl" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-black/25 shadow-[0_12px_24px_rgba(0,0,0,0.24)]">
                <span className="text-4xl font-bold tracking-widest text-white font-display">{initials}</span>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">{data.name}</h2>
              <p className="mt-2 inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-300">
                {data.department}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <ProfileRow icon={<Hash size={16} />} label="Registration Number" value={data.regNumber} />
            <ProfileRow icon={<Phone size={16} />} label="Mobile" value={data.mobile} />
            <ProfileRow icon={<Layers size={16} />} label="Semester" value={String(data.semester)} />
            <ProfileRow icon={<Book size={16} />} label="Section" value={data.section} />
          </div>

          <section className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[0_10px_26px_rgba(0,0,0,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-sky-300">
                  <Building2 size={12} />
                  Hostel Roommate Finder
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white">Add your next-year hostel room</h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                  Save your hostel name and room number now. As soon as another student adds the same hostel and room, their name and department will appear here automatically.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-300">
                <BedDouble size={20} />
              </div>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-[1fr_220px_auto]" onSubmit={handleSaveHostel}>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Hostel Name</span>
                <input
                  type="text"
                  value={hostelName}
                  onChange={(event) => setHostelName(event.target.value)}
                  placeholder="Example: Paari Bhavan"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/40"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Room Number</span>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(event) => setRoomNumber(event.target.value)}
                  placeholder="Example: A-214"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/40"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSavingHostel}
                  className="w-full rounded-2xl border border-sky-400/20 bg-sky-400/10 px-5 py-3 text-sm font-medium text-sky-100 hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingHostel ? "Saving..." : "Save Room"}
                </button>
              </div>
            </form>

            <div className="mt-6 grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  <SearchCheck size={12} />
                  Your Submission
                </div>
                {isLoadingHostel ? (
                  <p className="mt-3 text-sm text-zinc-400">Loading hostel room details...</p>
                ) : hostelState?.entry ? (
                  <div className="mt-4 space-y-3 text-sm text-zinc-200">
                    <div>
                      <p className="text-zinc-500">Hostel</p>
                      <p className="mt-1 font-medium text-white">{hostelState.entry.hostelName}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Room Number</p>
                      <p className="mt-1 font-medium text-white">{hostelState.entry.roomNumber}</p>
                    </div>
                    <p className="pt-2 text-xs leading-6 text-zinc-400">
                      Roommate details appear immediately after a match is found.
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Add your hostel name and room number here. Students with the same hostel and room will be matched automatically.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                  <BedDouble size={12} />
                  Roommates
                </div>
                {isLoadingHostel ? (
                  <p className="mt-3 text-sm text-zinc-400">Checking for roommate matches...</p>
                ) : hostelState?.roommates?.length ? (
                  <div className="mt-4 grid gap-3">
                    {hostelState.roommates.map((roommate) => (
                      <div key={`${roommate.name}-${roommate.department}`} className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                        <p className="text-sm font-semibold text-white">{roommate.name}</p>
                        <p className="mt-1 text-sm text-emerald-50/85">{roommate.department || "Department unavailable"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-100/70">
                          {roommate.hostelName} · Room {roommate.roomNumber}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    No roommate match yet. When another student saves the same hostel and room number, their name and department will show up here automatically.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="mt-6">
            <Link
              href="/auth/logout"
              className="flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-4 hover:bg-red-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-2 text-red-300">
                  <LogOut size={16} />
                </div>
                <span className="text-sm font-medium text-red-300">Logout</span>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-red-200/70">End Session</span>
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">Academic details synced from portal.</p>
        </div>
      </div>
    </main>
  );
};

const ProfileRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-zinc-400">{icon}</div>
      <span className="text-sm font-medium text-zinc-300">{label}</span>
    </div>
    <span className="text-sm font-mono tracking-wide text-white">{value}</span>
  </div>
);
