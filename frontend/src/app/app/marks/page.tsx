"use client";
import { useCourse, useMarks } from "@/hooks/query";
import React from "react";
import { CourseDetail, MarkDetail } from "srm-academia-api";
import { GlobalLoader } from "../components/loader";
import { formatNumber, formatPercentage, roundTo } from "@/utils/number";

import { Card } from "@/app/components/ui/Card";
import ShinyText from "@/components/ShinyText";


// Animation & Charts
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
  const scoredSubjects = data.filter((item) => (item.total?.maxMark || 0) > 0);
  const strongSubjects = scoredSubjects.filter((item) => getSubjectPercentage(item) >= 75).length;
  const focusSubjects = scoredSubjects.filter((item) => getSubjectPercentage(item) < 60).length;

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
      <div className="flex justify-between items-end ml-2">
        <div>
          <h1 className="text-2xl text-white tracking-tight mb-2 font-space-grotesk">Marks</h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            See where you are doing well, which subjects need attention, and how your marks moved from the first exam to the latest one.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:col-span-2">
          <Card className="pt-4 p-4 text-center bg-zinc-900/20 border-zinc-800/50">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Overall Score</div>
            <div className="text-white text-2xl font-semibold font-display tracking-tight">{roundedTotalPercentage}%</div>
            <div className="text-zinc-400 text-xs mt-2">{roundedTotalObtained} / {roundedTotalMax} marks</div>
          </Card>

          <Card className="pt-4 p-4 text-center bg-zinc-900/20 border-zinc-800/50">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Estimated GPA</div>
            <div className="text-white text-2xl font-semibold font-display tracking-tight">{formattedCgpa}</div>
            <div className="text-zinc-400 text-xs mt-2">Based on current subject scores</div>
          </Card>

          <Card className="pt-4 p-4 text-center bg-zinc-900/20 border-zinc-800/50">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Strong Performance</div>
            <div className="text-white text-2xl font-semibold font-display tracking-tight">{strongSubjects}</div>
            <div className="text-zinc-400 text-xs mt-2">Subjects above 75%</div>
          </Card>

          <Card className="pt-4 p-4 text-center bg-zinc-900/20 border-zinc-800/50">
            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Requires Attention</div>
            <div className="text-white text-2xl font-semibold font-display tracking-tight">{focusSubjects}</div>
            <div className="text-zinc-400 text-xs mt-2">Subjects below 60%</div>
          </Card>
        </div>

        <TotalMarksCard marks={data} />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-bold text-classivo-text-grey uppercase tracking-wide mb-2">Theory Subjects</h2>
          <Data data={data} category="theory" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-classivo-text-grey uppercase tracking-wide mb-2">Practical Subjects</h2>
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

const getSubjectPercentage = (item: MarkDetail) => {
  const obtained = item.total?.obtained || 0;
  const maxMark = item.total?.maxMark || 0;
  return maxMark > 0 ? (obtained / maxMark) * 100 : 0;
};

const getPerformanceLabel = (percentage: number) => {
  if (percentage >= 75) return { label: "Strong", tone: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" };
  if (percentage >= 60) return { label: "Satisfactory", tone: "text-amber-300 border-amber-500/20 bg-amber-500/10" };
  return { label: "Attention Required", tone: "text-rose-300 border-rose-500/20 bg-rose-500/10" };
};

// Separate component for each course item to properly use React hooks
const CourseItem = ({
  item,
  courseList,
}: {
  item: MarkDetail;
  courseList: CourseDetail;
  calculateRequiredMarks: (grade: string, internalMarks: number) => number;
  getMarks: (grade: string) => number;
}) => {
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
  const subjectPercentage = getSubjectPercentage(item);
  const performance = getPerformanceLabel(subjectPercentage);
  const latestExam = chartData[chartData.length - 1];

  return (
    <div className="group relative overflow-hidden bg-zinc-900/20 border border-zinc-800/50 rounded-xl hover:border-zinc-700/50 hover:shadow-2xl hover:shadow-emerald-900/10">
      <div className="flex flex-col">
        <div className="flex justify-between items-start gap-4 px-4 pt-3">
          <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-relaxed h-10 w-[70%]">
            {courseList?.courseTitle}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-800" title="Credits">
              {courseList?.courseCredit}C
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${performance.tone}`}>
              {performance.label}
            </span>
          </div>
        </div>
        <div className="h-[1px] w-full bg-zinc-800/50"></div>

        <div className="px-4 pt-3">
          <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Current Internal Score</div>
                <div className="text-xl font-semibold text-white mt-1">
                  {formatNumber(item.total?.obtained ?? 0)}
                  <span className="text-sm text-zinc-500 ml-1">/ {formatNumber(item.total?.maxMark ?? 0)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Percentage</div>
                <div className="text-lg font-semibold text-white mt-1">{formatPercentage(subjectPercentage, 1)}%</div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              {latestExam
                ? `Latest update: ${latestExam.exam} - ${formatNumber(latestExam.obtained)} / ${formatNumber(latestExam.max)}.`
                : "Marks will appear here after your first exam is published."}
            </p>
          </div>
        </div>

        <div className="px-4 pt-4">
          {chartData.length > 0 ? (
            <div className="h-44 w-full rounded-lg border border-zinc-800/50 bg-zinc-950/40 p-2">
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Progress From First Exam To Latest Exam
              </div>
              <LineChart
                className="h-full w-full -ml-3"
                xAxis={[{
                  data: chartData.map((d) => d.exam),
                  scaleType: "point",
                  tickLabelStyle: { fill: "#71717a", fontSize: 9 }
                }]}
                yAxis={[{
                  min: 0,
                  max: 100,
                  tickLabelStyle: { fill: "#71717a", fontSize: 9 }
                }]}
                series={[
                  {
                    data: chartData.map((d) => d.percentage),
                    color: "#34d399",
                    showMark: true,
                    curve: "linear",
                    valueFormatter: (v) => `${v?.toFixed(1)}%`
                  }
                ]}
                grid={{ horizontal: true }}
                sx={{
                  ".MuiChartsAxis-line": { stroke: "#3f3f46" },
                  ".MuiChartsAxis-tick": { stroke: "#3f3f46" },
                  ".MuiChartsGrid-line": { stroke: "#27272a" }
                }}
                height={150}
              />
            </div>
          ) : null}
        </div>

        <div className="flex-1 flex flex-col justify-center py-3 px-4">
          {item.marks.length === 0 ? (
            <div className="text-red-400 text-center text-sm py-4 bg-red-500/5 rounded-lg border border-red-500/10">No Marks Data</div>
          ) : (
            <MarkData data={item} />
          )}
        </div>

        <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between px-4 pb-3">
          <span className="text-xs text-zinc-500 font-mono">{courseList?.courseCode}</span>
          <span className="text-xs text-zinc-400">
            {item.marks.length} exam{item.marks.length === 1 ? "" : "s"} recorded
          </span>
        </div>
      </div>
    </div>
  );
};

const MarkData = ({ data }: { data: MarkDetail }) => {
  return (
    <div className="flex flex-col gap-2">
      {data.marks.map((item, i) => {
        const percentage = item.maxMark ? ((item.obtained ?? 0) / item.maxMark) * 100 : 0;
        return (
          <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800/50 bg-zinc-950/30 px-3 py-2 text-xs">
            <div className="min-w-0">
              <div className="text-white truncate">{item.exam}</div>
              <div className="text-zinc-500 mt-1">Score published</div>
            </div>
            <div className="text-right">
              <div className="flex gap-1 font-mono justify-end">
                <span className="text-white">{formatNumber(item.obtained ?? 0)}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-500">{formatNumber(item.maxMark ?? 0)}</span>
              </div>
              <div className="text-zinc-400 mt-1">{formatPercentage(percentage, 1)}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
