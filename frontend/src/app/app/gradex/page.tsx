"use client";

import React from "react";
import { useCourse, useMarks } from "@/hooks/query";
import GradeCalculator from "@/components/gradex/GradeCalculator";
import { GlobalLoader } from "../components/loader";
import { Mark, Course } from "@/types/gradex";
import { CourseDetail, MarkDetail } from "srm-academia-api";
import { normalizeCourseCode } from "@/utils/courseCode";

// Transform MarkDetail to Mark format
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

// Transform CourseDetail to Course format
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
    return <div className="flex h-screen w-full justify-center items-center">
      <GlobalLoader className="h-10 w-10 text-white" />
    </div>
  }

  const marksList = Array.isArray(marksData) ? (marksData as MarkDetail[]) : [];
  if (marksList.length === 0) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <div className="text-white">No data found</div>
      </div>
    );
  }

  const courseList = Array.isArray(coursesData) ? (coursesData as CourseDetail[]) : [];
  const courseNameMap = buildCourseNameMap(courseList);
  const marks = transformMarks(marksList, courseNameMap);
  const courses = transformCourses(courseList);

  return (
    <div className="flex flex-col gap-12 px-3 py-2">
      <GradeCalculator marks={marks} courses={courses} />
    </div>
  );
}

function buildCourseNameMap(courseList: CourseDetail[]): Map<string, string> {
  const map = new Map<string, string>();
  courseList.forEach((course) => {
    const key = normalizeCourseCode(course.courseCode);
    if (!key) return;
    const title = course.courseTitle?.trim();
    if (title) {
      map.set(key, title);
    }
  });
  return map;
}

