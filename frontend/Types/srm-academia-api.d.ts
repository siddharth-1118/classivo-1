declare module "srm-academia-api" {
  export type TimetableClass = {
    time: string;
    courseCode: string;
    courseTitle: string;
    courseRoomNo: string;
    courseType: string;
    slot: string;
    isClass: boolean;
  };

  export type DaySchedule = {
    dayOrder: string;
    class: TimetableClass[];
  };

  export type AttendanceDetail = {
    courseCode: string;
    courseTitle: string;
    courseCategory: string;
    courseSlot: string;
    courseFaculty: string;
    courseAttendance: string;
    courseConducted: number;
    courseAbsent: number;
    courseAttendanceStatus: {
      status: "required" | "margin";
      classes: number;
    };
  };

  export type MarkDetail = {
    course: string;
    subject: string;
    category: string;
    marks: Array<{ exam: string; obtained: number; maxMark: number }>;
    total: { obtained: number; maxMark: number };
  };

  export type CourseDetail = {
    courseCode: string;
    courseTitle: string;
    courseCredit: string | number;
    courseType: string;
    courseCategory: string;
    courseFaculty: string;
    courseSlot: string[] | string;
    courseRoomNo: string;
  };

  export type Month = {
    month: string;
    days: Array<{ day: string; date: string; dayOrder: string; event: string }>;
  };

  export type UserInfo = {
    name: string;
    regNumber: string;
    department: string;
    semester: string;
    section: string;
    mobile: string;
    program: string;
    batch: string;
  };

  export type DayOrderResponse = {
    dayOrder: string;
    status: number;
  };
}
