"use client";

import React from "react";
import { useCourse, useMarks, useUserInfo } from "@/hooks/query";
import { CourseDetail, MarkDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import {
  Bell,
  Zap,
  Activity,
  Award,
  ChevronRight,
  Target,
  TrendingUp
} from "lucide-react";
import ShinyText from "@/components/ShinyText";

const MarksPage = () => {
  const { data, isPending } = useMarks();
  const courses = useCourse().data;
  const { data: userInfo } = useUserInfo();

  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;

  if (!data || data.length === 0)
    return (
      <main className="flex h-screen w-full justify-center items-center">
        <ShinyText text="No Marks Data found" speed={2} delay={0} color="#a1a1aa" shineColor="#ffffff" spread={120} direction="left" yoyo={false} pauseOnHover={false} />
      </main>
    );


  const totalObtained = data.reduce((acc, m) => acc + (m.total?.obtained || 0), 0);
  const totalMax = data.reduce((acc, m) => acc + (m.total?.maxMark || 0), 0);
  const formatMark = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);
  const scoredSubjects = data.filter((item) => (item.total?.maxMark || 0) > 0);
  const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const weakestSubject = [...scoredSubjects].sort(
    (a, b) => ((a.total?.obtained || 0) / Math.max(a.total?.maxMark || 1, 1)) - ((b.total?.obtained || 0) / Math.max(b.total?.maxMark || 1, 1))
  )[0];
  const targetPercentage = 85;
  const targetGap = Math.max(0, Math.ceil((targetPercentage * totalMax) / 100 - totalObtained));

  return (
    <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white px-6 pb-32 pt-12 overflow-y-auto font-sans">
      <div className="relative z-10 flex flex-col gap-10 max-w-lg mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
               <span className="text-zinc-500 font-bold text-xs">{userInfo?.name?.[0] || "C"}</span>
            </div>
            <h1 className="text-xl font-black tracking-tight">
              Welcome back, <span className="text-premium-gold">{userInfo?.name?.split(" ")[0] || "Curator"}</span>
            </h1>
          </div>
          <button className="h-10 w-10 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400">
            <Bell size={20} />
          </button>
        </header>

        {/* Total Score Hub */}
        <section className="relative">
           <div className={`relative h-[300px] w-full rounded-[40px] overflow-hidden flex flex-col items-center justify-center border border-white/10 bg-zinc-900/40 backdrop-blur-xl`}>
              {/* Dynamic Glow */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
                 <div className="h-48 w-48 bg-purple-500 rotate-[35deg] rounded-3xl blur-[90px]" />
                 <div className="absolute h-56 w-56 border-[15px] border-purple-500 rotate-[-20deg] rounded-[60px] opacity-40" />
              </div>
              
              <div className="relative z-10 text-center flex flex-col items-center">
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Cumulative Performance</p>
                 <div className="flex flex-col items-center">
                    <span className="text-[80px] font-black leading-none tracking-tighter">{formatMark(totalObtained)}</span>
                    <div className="h-1 w-24 bg-zinc-800 my-2 rounded-full" />
                    <span className="text-4xl font-black text-zinc-500">{formatMark(totalMax)}</span>
                 </div>
                 <div className="mt-6 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
                    <Award size={14} className="text-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Total Marks</span>
                 </div>
              </div>
           </div>

            <div className="mt-5 grid grid-cols-2 gap-5">
               <div className="rounded-[32px] bg-zinc-900/40 border border-white/5 p-6 space-y-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                     <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Zap size={18} />
                     </div>
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active</span>
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-3xl font-black tracking-tighter">
                        {data.reduce((acc, m) => {
                           const course = courses?.find(c => c.courseCode === m.course);
                           return acc + Number(course?.courseCredit || 0);
                        }, 0)}
                     </h3>
                     <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">Credit Load</p>
                  </div>
               </div>

              <div className="rounded-[32px] bg-zinc-900/40 border border-white/5 p-6 space-y-4 backdrop-blur-md">
                 <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                       <Activity size={18} />
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Stable</span>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tighter">Velocity</h3>
                    <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">Academic Pulse</p>
                 </div>
              </div>
           </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={Target}
            label="Target Gap"
            value={`${targetGap}`}
            helper={`Marks needed to reach ${targetPercentage}% overall`}
            tone="amber"
          />
          <MetricCard
            icon={TrendingUp}
            label="Current Average"
            value={`${overallPercentage.toFixed(1)}%`}
            helper="Overall scored percentage"
            tone="emerald"
          />
          <MetricCard
            icon={Activity}
            label="Weakest Subject"
            value={weakestSubject?.course || "--"}
            helper={weakestSubject ? `${(((weakestSubject.total?.obtained || 0) / Math.max(weakestSubject.total?.maxMark || 1, 1)) * 100).toFixed(0)}% currently` : "Waiting for marks data"}
            tone="red"
          />
        </section>

        <section className="rounded-[32px] border border-premium-gold/15 bg-premium-gold/5 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-premium-gold/80">Marks Target Planner</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white">What to improve next</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {targetGap > 0
              ? `You need roughly ${targetGap} more marks across upcoming evaluations to push the overall score to ${targetPercentage}%. Prioritize ${weakestSubject?.course || "your lowest-scoring subject"} first.`
              : `You are already at or above the ${targetPercentage}% benchmark. Use GradeX to simulate even higher targets and GPA outcomes.`}
          </p>
        </section>

        {/* Subject Mastery */}
        <section className="flex flex-col gap-6">
           <h2 className="text-2xl font-black tracking-tight">Subject Mastery</h2>
           <div className="flex flex-col gap-4">
              {data.map((item, i) => (
                <MasteryCard key={i} item={item} courses={courses} />
              ))}
           </div>
        </section>

      </div>
    </main>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  helper: string;
  tone: "amber" | "emerald" | "red";
}) => {
  const tones = {
    amber: "border-amber-400/15 bg-amber-500/8 text-amber-200",
    emerald: "border-emerald-400/15 bg-emerald-500/8 text-emerald-200",
    red: "border-red-400/15 bg-red-500/8 text-red-200",
  };

  return (
    <div className={`rounded-[28px] border p-5 backdrop-blur-xl ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">{label}</p>
        <Icon size={16} />
      </div>
      <div className="mt-4 text-2xl font-black tracking-tight text-white">{value}</div>
      <p className="mt-2 text-xs leading-5 text-zinc-300">{helper}</p>
    </div>
  );
};

const MasteryCard = ({ item, courses }: { item: MarkDetail; courses: CourseDetail[] | undefined }) => {
  const percentage = item.total?.maxMark ? ((item.total.obtained / item.total.maxMark) * 100).toFixed(0) : "0";
  const isHigh = Number(percentage) >= 80;
  const courseInfo = courses?.find(c => c.courseCode === item.course);
  
  return (
    <div className="rounded-[32px] bg-zinc-900/30 border border-white/5 p-7 flex flex-col gap-6 group transition-all hover:bg-zinc-900/50">
       <div className="flex items-start justify-between">
          <div className="space-y-1">
             <h3 className="text-xl font-bold tracking-tight leading-none line-clamp-1">{courseInfo?.courseTitle || item.course}</h3>
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{item.category}</p>
          </div>
          <ChevronRight size={18} className="text-zinc-800 group-hover:text-premium-gold transition-colors" />
       </div>

       <div className="flex items-end justify-between">
          <div className="space-y-2">
             <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black tracking-tighter">
                   {Number.isInteger(item.total?.obtained || 0) ? item.total?.obtained : item.total?.obtained?.toFixed(1) || "0"}/{Number.isInteger(item.total?.maxMark || 0) ? item.total?.maxMark : item.total?.maxMark?.toFixed(1) || "0"}
                </span>
                <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Marks</span>
             </div>
             <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${isHigh ? 'bg-premium-gold shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'bg-zinc-700'}`} />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                   Status: {isHigh ? 'Elite' : 'Developing'}
                </p>
             </div>
          </div>
          
          {/* Sparkline (Simulated) */}
          <div className="flex items-end gap-1 h-8">
             {[40, 70, 55, 90, 60].map((h, i) => (
               <div 
                 key={i} 
                 className={`w-1 rounded-full ${isHigh ? 'bg-premium-gold/20' : 'bg-zinc-800'}`} 
                 style={{ height: `${h}%` }}
               >
                  {i === 4 && <div className={`w-full h-full rounded-full ${isHigh ? 'bg-premium-gold' : 'bg-zinc-600'} animate-pulse`} />}
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default MarksPage;
