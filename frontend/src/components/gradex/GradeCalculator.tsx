"use client";

import Indicator from "@/components/gradex/Indicator";
import { Course, Mark } from "@/types/gradex";
import { getGrade } from "@/types/gradex";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import GradeCard from "./GradeCard";
import { determineGrade, gradePoints } from "@/utils/gpaCalculator";
import ShinyText from "@/components/ShinyText";
export default function GradeCalculator({
  marks,
  courses,
}: {
  marks: Mark[];
  courses: Course[];
}) {
  const [grades, setGrades] = useState<{ [courseCode: string]: string }>({});
  const [sgpa, setSgpa] = useState(0);
  const [excludedCourses, setExcludedCourses] = useState<string[]>([]);

  // Use useMemo to filter theory and practical courses only when dependencies change
  const theory = useMemo(
    () =>
      marks
        ?.filter((a) => a.courseType === "Theory")
        .filter((a) =>
          courses
            ? (Number(courses.find((c) => c.code === a.courseCode)?.credit) ?? 0) > 0
            : false
        ) || [],
    [marks, courses]
  );

  const practicals = useMemo(
    () =>
      marks
        ?.filter((a) => a.courseType === "Practical")
        .filter((a) =>
          courses
            ? (Number(courses.find((c) => c.code === a.courseCode)?.credit) ?? 0) > 0
            : false
        )
        .filter(
          (practical) =>
            !theory.some(
              (theory) =>
                theory.courseType === "Theory" &&
                theory.courseCode === practical.courseCode
            )
        ) || [],
    [marks, courses, theory]
  );

  // Initialize grades on first render
  useEffect(() => {
    if (!marks?.length) return;

    const initialGrades: { [courseCode: string]: string } = {};

    marks.forEach((mark) => {
      const total = Number(mark.overall.total);
      const scored = Number(mark.overall.scored || 0);
      let initialGradeValue: string;

      if (total < 60) {
        const maxRemainingInternal = 60 - total;
        const maxExternal = 40;
        const maxPotentialScore = scored + maxRemainingInternal + maxExternal;
        initialGradeValue = getGrade(Math.min(maxPotentialScore, 100));
      } else {
        initialGradeValue =
          total === 100 ? getGrade(scored) : determineGrade(scored, total);
      }

      initialGrades[mark.courseCode] = initialGradeValue;
    });

    setGrades(initialGrades);
  }, [marks]);

  // Use useCallback to prevent recreation of this function on every render
  const updateGrade = useCallback(
    (
      courseCode: string,
      grade: string,
      exclude: boolean = false
    ) => {
      setGrades((prevGrades) => ({
        ...prevGrades,
        [courseCode]: grade,
      }));

      if (exclude) {
        setExcludedCourses((prevExcluded) => {
          if (prevExcluded.includes(courseCode)) {
            return prevExcluded.filter((code) => code !== courseCode);
          } else {
            return [...prevExcluded, courseCode];
          }
        });
      }
    },
    []
  );

  // Calculate SGPA when relevant data changes
  useEffect(() => {
    if (!courses || !Object.keys(grades).length) return;

    let totalPoints = 0;
    let totalCredits = 0;

    Object.entries(grades).forEach(([courseCode, grade]) => {
      if (excludedCourses.includes(courseCode)) return;

      const course = courses.find((c) => c.code === courseCode);
      if (course) {
        const credits = Number(course.credit);
        const gradePoint = gradePoints[grade] || 0;

        totalPoints += credits * gradePoint;
        totalCredits += credits;
      }
    });

    const calculatedSgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setSgpa(parseFloat(calculatedSgpa.toFixed(2)));
  }, [grades, courses, excludedCourses]);

  return (
    <div className="w-full pb-0">
      <div className="flex flex-col gap-12">
        <section id="links" className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-white">GradeX</h1>

          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 p-2 mb-[80px] lg:mb-2">
            {marks?.length ? (
              <>
                <div className="w-full items-center justify-center lg:flex">
                  {sgpa > 9.5 ? (
                    <>
                      <h2 className="rounded-2xl border px-8 py-4 text-center text-5xl font-semibold border-transparent bg-yellow-300/5 text-yellow-400">
                        <ShinyText
                          text={sgpa.toString()}
                          speed={2}
                          delay={0}
                          color="#f0dc27ff"
                          shineColor="#ffffff"
                          spread={120}
                          direction="left"
                          yoyo={false}
                          pauseOnHover={false}
                        />
                        <span className="text-base opacity-40 ml-1">  SGPA</span>
                      </h2>

                    </>
                  ) : (
                    <h2
                      className={`rounded-2xl border px-8 py-4 text-center text-5xl font-semibold ${sgpa > 9.5
                        ? "border-transparent bg-yellow-300/20 text-yellow-400"
                        : sgpa <= 9.5 && sgpa >= 8.5
                          ? "border-transparent bg-green-400/20 text-green-400"
                          : sgpa < 6
                            ? "border-dashed border-red-400 bg-red-400/20 text-red-400"
                            : "border border-white/20 bg-white/5 text-white"
                        }`}
                    >
                      {sgpa} <span className="text-base opacity-40">SGPA</span>
                    </h2>
                  )}
                </div>
                <div className="grid animate-fadeIn grid-cols-1 gap-2 transition-all duration-200 lg:grid-cols-2 xl:grid-cols-3">
                  {theory.map((mark, index) => (
                    <GradeCard
                      courses={courses}
                      mark={mark}
                      excludedCourses={excludedCourses}
                      key={`${mark.courseCode}-${index}`}
                      currentGrade={grades[mark.courseCode] || "O"}
                      updateGrade={updateGrade}
                    />
                  ))}
                </div>

                {practicals?.length > 0 && (
                  <>
                    <Indicator type="Practical" separator />
                    <div className="grid animate-fadeIn grid-cols-1 gap-2 transition-all duration-200 lg:grid-cols-2 xl:grid-cols-3">
                      {practicals.map((mark, index) => (
                        <GradeCard
                          mark={mark}
                          courses={courses}
                          key={`${mark.courseCode}-${index}`}
                          excludedCourses={excludedCourses}
                          currentGrade={grades[mark.courseCode] || "O"}
                          updateGrade={updateGrade}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <></>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

