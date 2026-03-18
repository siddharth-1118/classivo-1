"use client";

import React from "react";
import { useCourse, useMarks } from "@/hooks/query";
import GradeCalculator from "@/components/gradex/GradeCalculator";
import { GlobalLoader } from "../components/loader";
import { Mark, Course } from "@/types/gradex";
import { CourseDetail, MarkDetail } from "srm-academia-api";
import { normalizeCourseCode } from "@/utils/courseCode";
import { Sparkles } from "lucide-react";

function transformMarks(markList: MarkDetail[], courseNameMap: Map<string, string>): Mark[] {
  return markList.map((m) => {
    const normalizedCode = normalizeCourseCode(m.course);
    const friendlyName = courseNameMap.get(normalizedCode) || m.course || "";
    return {
      courseName: friendlyName,
      courseCode: m.course || "",
      courseType: m.category === "practical" ? "Practical" : "Theory",
      overall: {
        scored: String(m.total?.obtained || 0),
        total: String(m.total?.maxMark || 0),
      },
      testPerformance: m.marks?.map((test) => ({
        test: test.exam,
        marks: {
          scored: String(test.obtained),
          total: String(test.maxMark),
        },
      })),
    };
  });
}

function transformCourses(courseList: CourseDetail[]): Course[] {
  return courseList.map((c) => ({
    code: c.courseCode || "",
    title: c.courseTitle || "",
    credit: typeof c.courseCredit === "number" ? String(c.courseCredit) : c.courseCredit || "0",
    category: c.courseCategory || "",
    courseCategory: c.courseCategory || "",
    type: c.courseType || "",
    slotType: c.courseType || "",
    faculty: c.courseFaculty || "",
    slot: Array.isArray(c.courseSlot) ? c.courseSlot.join(", ") : (c.courseSlot ?? ""),
    room: c.courseRoomNo || "",
  }));
}

export default function GradeX() {
  const { data: marksData, isPending: marksPending } = useMarks();
  const { data: coursesData, isPending: coursesPending } = useCourse();

  if (marksPending || coursesPending) {
    return <div className="flex h-screen w-full justify-center items-center"><GlobalLoader className="h-10 w-10 text-white" /></div>;
  }

  const marksList = Array.isArray(marksData) ? (marksData as MarkDetail[]) : [];
  if (marksList.length === 0) {
    return <div className="flex h-screen w-full justify-center items-center"><div className="text-white">No data found</div></div>;
  }

  const courseList = Array.isArray(coursesData) ? (coursesData as CourseDetail[]) : [];
  const courseNameMap = buildCourseNameMap(courseList);
  const marks = transformMarks(marksList, courseNameMap);
  const courses = transformCourses(courseList);

  return (
    <main className="min-h-screen w-full text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6">
        <header className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
            <Sparkles size={12} />
            GradeX
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Grade Planning</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
            Estimate grades, evaluate internal performance, and plan your next academic targets through a more polished interface.
          </p>
        </header>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <GradeCalculator marks={marks} courses={courses} />
        </div>
      </div>
    </main>
  );
}

function buildCourseNameMap(courseList: CourseDetail[]): Map<string, string> {
  const map = new Map<string, string>();
  courseList.forEach((course) => {
    const key = normalizeCourseCode(course.courseCode);
    if (!key) return;
    const title = course.courseTitle?.trim();
    if (title) map.set(key, title);
  });
  return map;
}
