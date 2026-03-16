"use client";
import { useCourse, useMarks } from "@/hooks/query";
import React, { useState } from "react";
import { CourseDetail, MarkDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { formatNumber, formatPercentage, roundTo } from "@/utils/number";

import { Card } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import ShinyText from "@/components/ShinyText";


// Animation & Charts
import { motion, AnimatePresence } from "motion/react";
import { LineChart } from "@mui/x-charts/LineChart";
import { TotalMarksCard } from "@/app/components/TotalMarksCard";

const Page = () => {
  const { data, isPending } = useMarks();
  const courses = useCourse().data;
  if (isPending) return <main className="w-full text-white flex items-center justify-center p-4 h-screen"><GlobalLoader /></main>;
  if (!data || data.length === 0)
    return (
      <main className="flex h-screen w-full justify-center items-center">
        <ShinyText
          text="No Marks Data found"
          speed={2}
          delay={0}
          color="#a1a1aa"
          shineColor="#ffffff"
          spread={120}
          direction="left"
          yoyo={false}
          pauseOnHover={false}
        />
      </main>
    );

  const totalObtained = data.reduce((acc, m) => acc + (m.total?.obtained || 0), 0);
  const totalMax = data.reduce((acc, m) => acc + (m.total?.maxMark || 0), 0);
  const totalPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const roundedTotalObtained = roundTo(totalObtained, 1);
  const roundedTotalMax = roundTo(totalMax, 1);
  const roundedTotalPercentage = formatPercentage(totalPercentage, 2);

  const gp = (p: number) => {
    if (p >= 91) return 10;
    if (p >= 81) return 9;
    if (p >= 71) return 8;
    if (p >= 61) return 7;
    if (p >= 56) return 6;
    if (p >= 50) return 5;
    return 0;
  };

  let creditSum = 0;
  let weightedSum = 0;
  data.forEach((m) => {
    const course = courses?.find((c) => c.courseCode === m.course);
    const credit = Number(course?.courseCredit || 0);
    if (!credit || !m.total?.maxMark) return;
    const percent = (m.total.obtained / m.total.maxMark) * 100;
    weightedSum += gp(percent) * credit;
    creditSum += credit;
  });
  const cgpa = creditSum > 0 ? weightedSum / creditSum : 0;
  const formattedCgpa = formatNumber(cgpa, 2);

  return (
    <main className="flex flex-col gap-4 pt-2 pb-24 px-4 sm:px-6 w-full max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-end ml-2"> {/* Optional: z-10 ensures text stays clickable/sharp if blur overlaps too much */}
        <div>
          <h1 className="text-2xl text-white tracking-tight mb-2 font-space-grotesk">Marks</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="pt-4 p-4 text-center bg-zinc-900/20 border-zinc-800/50">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Percentage</div>
            <div className="text-white text-2xl font-semibold font-display tracking-tight">{roundedTotalPercentage}%</div>
          </Card>

          <Card className="pt-4 p-4 text-center bg-zinc-900/20 border-zinc-800/50">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">CGPA</div>
            <div className="text-white text-2xl font-semibold font-display tracking-tight">{formattedCgpa}</div>
          </Card>
        </div>

        {/* New Interactive Radar Chart Component */}
        <TotalMarksCard marks={data} />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold text-classivo-text-grey uppercase tracking-wide mb-2">Theory</h2>
          <Data data={data} category="theory" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-classivo-text-grey uppercase tracking-wide mb-2">Practical</h2>
          <Data data={data} category="practical" />
        </div>
      </div>
    </main>
  );
};

export default Page;

const Data = ({ data, category }: { data: MarkDetail[]; category: string }) => {
  const course = useCourse().data;
  const filteredData = data.filter(
    (i) => i.category.toLowerCase() === category
  );

  function getMarks(grade: string) {
    if (grade === "O") return 91;
    if (grade === "A+") return 81;
    if (grade === "A") return 71;
    if (grade === "B+") return 61;
    if (grade === "B") return 56;
    if (grade === "C") return 50;
    return 91;
  }

  // Function to calculate required marks out of 75 to achieve a specific grade
  function calculateRequiredMarks(
    grade: string,
    internalMarks: number
  ): number {
    // Formula: (total marks needed - internal marks) * 75 / 40
    const totalNeeded = getMarks(grade);
    const requiredSemesterMarks = ((totalNeeded - internalMarks) * 75) / 40;
    return parseFloat(requiredSemesterMarks.toFixed(2));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredData.map((item, i) => {
        const courseList = course?.find((i) => i.courseCode === item.course);
        return (
          <CourseItem
            key={i}
            item={item}
            courseList={courseList as CourseDetail}
            calculateRequiredMarks={calculateRequiredMarks}
            getMarks={getMarks}
          />
        );
      })}
    </div>
  );
};

// Separate component for each course item to properly use React hooks
const CourseItem = ({
  item,
  courseList,
  calculateRequiredMarks,
}: {
  item: MarkDetail;
  courseList: CourseDetail;
  calculateRequiredMarks: (grade: string, internalMarks: number) => number;
  getMarks: (grade: string) => number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    // Helper to parse roman numerals for sorting
    const romanToInt = (str: string) => {
      const roman = { I: 1, V: 5, X: 10, L: 50 };
      let num = 0;
      let match = str.match(/[IVXL]+$/);
      if (!match) return 0;
      let s = match[0];
      for (let i = 0; i < s.length; i++) {
        // @ts-ignore
        const curr = roman[s[i]];
        // @ts-ignore
        const next = roman[s[i + 1]];
        if (next && curr < next) num -= curr;
        else num += curr;
      }
      return num;
    };

    const getExamWeight = (exam: string) => {
      // Prioritize sorting: FT/CT/Cycle Test < Model < University/Semester
      // Within type, sort by number/roman
      const clean = exam.toUpperCase();
      let baseWeight = 0;
      if (clean.includes("FT") || clean.includes("CT") || clean.includes("CYCLE")) baseWeight = 0;
      else if (clean.includes("LLT")) baseWeight = 100;
      else if (clean.includes("MODEL")) baseWeight = 200;
      else baseWeight = 300;

      return baseWeight + romanToInt(clean) + (parseInt(clean.replace(/\D/g, '')) || 0);
    };

    const mapped = item.marks.map((m) => {
      const obtained = m.obtained ?? 0;
      const max = m.maxMark ?? 0;
      const percentage = max > 0 ? (obtained / max) * 100 : 0;
      return {
        exam: m.exam,
        percentage: percentage,
        obtained: obtained,
        max: max
      };
    });

    return mapped.sort((a, b) => getExamWeight(a.exam) - getExamWeight(b.exam));
  }, [item.marks]);

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 } }}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative overflow-hidden bg-zinc-900/20 border border-zinc-800/50 rounded-xl hover:border-zinc-700/50 cursor-pointer hover:shadow-2xl hover:shadow-emerald-900/10"
      style={{
        zIndex: isExpanded ? 50 : 0,
      }}
    >
      <motion.div layout="position" className="flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-start gap-4 px-4 pt-3">
          <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-relaxed h-10 w-[70%]">
            {courseList?.courseTitle}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800" title="Credits">
              {courseList?.courseCredit}C
            </span>
          </div>
        </div>
        <div className="h-[1px] w-full bg-zinc-800/50"></div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center py-2 px-4">
          {item.marks.length === 0 ? (
            <div className="text-red-400 text-center text-sm py-4 bg-red-500/5 rounded-lg border border-red-500/10">No Marks Data</div>
          ) : (
            <MarkData data={item} />
          )}
        </div>

        {/* Footer Stats */}
        <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between px-4 pb-1">
          <span className="text-xs text-zinc-500 font-mono">{courseList?.courseCode}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white tracking-tight">{formatNumber(item.total?.obtained ?? 0)}</span>
            <span className="text-xs text-zinc-600">/ {formatNumber(item.total?.maxMark ?? 0)}</span>
          </div>
        </div>
      </motion.div>

      {/* Expanded Chart View */}
      <AnimatePresence>
        {isExpanded && chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 320 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <div className="h-[300px] w-full mt-4 bg-zinc-950/30 rounded-lg border border-zinc-800/50 p-2 relative pl-0">
              <div className="absolute top-2 left-0 right-0 flex justify-center z-10">
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Percentage
                </div>
              </div>
              <LineChart className="w-full h-full -ml-3"
                xAxis={[{
                  data: chartData.map(d => d.exam),
                  scaleType: 'point',
                  tickLabelStyle: { fill: '#71717a', fontSize: 10 }
                }]}
                series={[
                  {
                    data: chartData.map(d => d.percentage),
                    color: '#818cf8', // Indigo 400
                    area: false,
                    showMark: true,
                    valueFormatter: (v) => `${v?.toFixed(1)}%`
                  },
                ]}

                yAxis={[{
                  min: 0,
                  max: 100,
                  tickLabelStyle: { fill: '#71717a', fontSize: 10 },
                }]}

                grid={{ horizontal: true }}
                sx={{
                  // Customizing charts styles for dark mode
                  ".MuiChartsAxis-line": { stroke: "#3f3f46" }, // zinc-700
                  ".MuiChartsAxis-tick": { stroke: "#3f3f46" },
                  ".MuiChartsGrid-line": { stroke: "#27272a" }, // zinc-800
                  ".MuiChartsTooltip-root": { backgroundColor: "#18181b", borderColor: "#3f3f46", color: "#fff" }
                }}
                height={280}
              />
            </div>
            {/* Detailed Chips */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {chartData.map((d, idx) => (
                <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-blue-300 uppercase tracking-wider mb-1 opacity-70">
                    {d.exam.replace("Cycle Test", "CT").replace("Model Exam", "Model")}
                  </div>
                  <div className="text-sm font-bold text-blue-100">
                    {d.obtained} <span className="text-[10px] font-normal text-blue-300/60">/ {d.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MarkData = ({ data }: { data: MarkDetail }) => {
  return (
    <div className="flex flex-col gap-2">
      {data.marks.map((item, i) => {
        return (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 truncate max-w-[60%]">{item.exam}</span>
            <div className="flex gap-1 font-mono">
              <span className="text-white">{formatNumber(item.obtained ?? 0)}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-500">{formatNumber(item.maxMark ?? 0)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
