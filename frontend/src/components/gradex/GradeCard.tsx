"use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import { Slider } from "@/components/ui/slider";
import { Mark, Course } from "@/types/gradex";
import Medal from "./Medals";
import { getGrade } from "@/types/gradex";
import { MarkDisplay } from "./MarkDisplay";
import { determineGrade } from "@/utils/gpaCalculator";
import { normalizeCourseCode } from "@/utils/courseCode";

// Grade point values for scoring calculation
export const grade_points: { [key: string]: number } = {
  O: 91,
  "A+": 81,
  A: 71,
  "B+": 61,
  B: 56,
  C: 50,
};

const gradeMap: { [key: number]: string } = {
  0: "C",
  1: "B",
  2: "B+",
  3: "A",
  4: "A+",
  5: "O",
};

// Memoized component to prevent unnecessary re-renders
const GradeCard = memo(function GradeCard({
  mark,
  currentGrade,
  updateGrade,
  excludedCourses,
  courses,
}: {
  mark: Mark;
  currentGrade: string;
  updateGrade: (courseCode: string, grade: string, exclude?: boolean) => void;
  excludedCourses: string[];
  courses: Course[];
}) {
  const [editMode, setEditMode] = useState(false);
  const [expectedInternal, setExpectedInternal] = useState(
    60 - Number(mark.overall.total)
  );
  const [requiredMarks, setRequiredMarks] = useState("0");

  // Find course details once using useMemo to prevent recalculation on each render
  const courseDetails = useMemo(() => {
    const desiredCode = normalizeCourseCode(mark.courseCode);
    return courses?.find((course) => normalizeCourseCode(course.code) === desiredCode);
  }, [courses, mark.courseCode]);

  // Calculate required marks whenever relevant data changes
  useEffect(() => {
    if (!mark || !currentGrade) return;

    const total_internal_score = Number(mark.overall.scored || 0) + expectedInternal;
    const isPractical = mark.courseType === "Practical";
    const maxExternalMarks = isPractical ? 40 : 75;

    const calculatedRequiredMarks =
      ((grade_points[currentGrade] - total_internal_score) / 40) * maxExternalMarks;

    setRequiredMarks(calculatedRequiredMarks.toFixed(2));
  }, [currentGrade, expectedInternal, mark]);

  useEffect(() => {
    if (!mark) return;
    const total = Number(mark.overall.total);
    const scored = Number(mark.overall.scored || 0);
    const lostMark = total - scored;

    const calculatedGrade =
      total == 100
        ? getGrade(Number(mark.overall.scored || 0))
        : determineGrade(lostMark, total);

    updateGrade(mark.courseCode, calculatedGrade);
  }, [mark, updateGrade]);

  // Get slider value based on current grade
  const getSliderValue = (grade: string) => {
    const entry = Object.entries(gradeMap).find(([, g]) => g === grade);
    return entry ? entry[0] : "5";
  };

  // Handle slider change with vibration feedback
  const handleSliderChange = (value: number[]) => {
    if (navigator.vibrate && typeof navigator.vibrate === "function") {
      navigator.vibrate(40);
    }

    const newGrade = gradeMap[value[0]];
    updateGrade(mark.courseCode, newGrade);
  };

  // Toggle course exclusion
  const handleExcludeToggle = () => {
    updateGrade(mark.courseCode, currentGrade, true);
  };

  const isExcluded = excludedCourses.includes(mark.courseCode);

  return (
    <div
      className={`${
        isExcluded ? "opacity-30" : "opacity-100"
      } flex min-h-40 flex-col justify-between gap-8 rounded-xl apply-border-md bg-[#16171b] transition-all duration-100 p-4 px-5 text-white`}
    >
      <div className="grid grid-cols-[1fr_0.2fr] items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold capitalize">
            {!mark.courseName.toLowerCase().includes("n/a")
              ? mark.courseName?.toLowerCase()
              : courseDetails?.title || mark.courseCode}
          </h2>
          <p className="text-sm font-medium text-white/60">
            Credit:{" "}
            <span className="text-sm text-white/80">
              {courseDetails?.credit || 0}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-end justify-end gap-2">
          <MarkDisplay marks={mark.overall} />
          <button
            onClick={handleExcludeToggle}
            className="flex w-fit transform items-center justify-center gap-2 rounded-xl py-1 text-xs font-medium text-white transition-all duration-300"
          >
            <div
              className={`h-1 w-2 rounded-full border-2 ring-1 transition duration-150 ${
                !isExcluded
                  ? "border-white/20 bg-green-400 ring-green-400"
                  : "border-white/10 ring-transparent"
              } p-1`}
            />{" "}
            Included
          </button>
        </div>
      </div>

      <div className="relative flex flex-col-reverse gap-4">
        {Number(mark.overall.total) <= 60 ? (
          <>
            {60 - Number(mark.overall.total) > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium opacity-80">
                  Expected remaining from {60 - Number(mark.overall.total)}:
                </p>
                <input
                  type="number"
                  className="w-16 appearance-none rounded-md border-none bg-white/5 px-2 py-1 text-center outline-none text-white"
                  value={expectedInternal}
                  maxLength={3}
                  max={60 - Number(mark.overall.total)}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (
                      value >= 0 &&
                      value <= 60 - Number(mark.overall.total)
                    ) {
                      setExpectedInternal(value);
                    }
                  }}
                />
              </div>
            )}

            <div className="flex flex-row items-center justify-between gap-2 border-t-2 border-dashed border-white/10 pt-3">
              <h2 className="text-sm font-medium opacity-80">
                Goal for sem exam
              </h2>
              <div className="flex items-center gap-1 rounded-full bg-white/5">
                <span
                  className={`pl-2 text-sm font-medium ${
                    Number(requiredMarks) <= 0
                      ? "text-green-400"
                      : Number(requiredMarks) >
                          (mark.courseType === "Practical" ? 40 : 75)
                        ? "text-red-400"
                        : "text-green-400"
                  }`}
                >
                  {requiredMarks}
                </span>
                <span className="ml-1 rounded-full bg-green-400/20 px-2 py-0.5 pr-2 text-sm font-bold text-green-400">
                  {mark.courseType === "Practical" ? 40 : 75}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/60">
              {["C", "B", "B+", "A", "A+", "O"].map((grade) => (
                <span
                  key={grade}
                  className={`${
                    currentGrade === grade ? "font-semibold" : "opacity-40"
                  }`}
                >
                  {grade}
                </span>
              ))}
            </div>
            <Slider
              max={5}
              step={1}
              value={[parseInt(getSliderValue(currentGrade))]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </>
        ) : (
          <>
            <Medal
              edit={editMode}
              setEdit={setEditMode}
              grade={
                (Number(mark.overall.total) == 100
                  ? getGrade(Number(mark.overall.scored || 0))
                  : determineGrade(
                      Number(mark.overall.scored || 0),
                      Number(mark.overall.total)
                    )) as "O" | "A+" | "A" | "B+" | "B" | "C"
              }
            />

            {editMode && (
              <>
                <div className="flex items-center justify-between text-xs text-white/60">
                  {["C", "B", "B+", "A", "A+", "O"].map((grade) => (
                    <span
                      key={grade}
                      className={`${
                        currentGrade === grade ? "font-semibold" : "opacity-40"
                      }`}
                    >
                      {grade}
                    </span>
                  ))}
                </div>
                <Slider
                  max={5}
                  step={1}
                  value={[parseInt(getSliderValue(currentGrade))]}
                  onValueChange={handleSliderChange}
                  className="w-full"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default GradeCard;

