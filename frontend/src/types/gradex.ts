// GradeX Type Definitions

export interface Mark {
  courseName: string;
  courseCode: string;
  courseType: string;
  overall: {
    scored?: string;
    total: string;
  };
  testPerformance?: Array<{
    test: string;
    marks: {
      scored?: string;
      total: string;
    };
  }>;
}

export interface Course {
  code: string;
  title: string;
  credit: string;
  category?: string;
  courseCategory?: string;
  type?: string;
  slotType?: string;
  faculty?: string;
  slot?: string;
  room?: string;
  academicYear?: string;
}

export const gradePoints: { [key: string]: number } = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
};

export function getGrade(marks: number): string {
  if (marks >= 91) return "O";
  if (marks >= 81) return "A+";
  if (marks >= 71) return "A";
  if (marks >= 61) return "B+";
  if (marks >= 56) return "B";
  if (marks >= 50) return "C";
  return "F";
}

