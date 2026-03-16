import type { AttendanceDetail, CourseDetail, MarkDetail, UserInfo as SrmUserInfo, DaySchedule, TimetableClass } from "srm-academia-api";

export interface AllResponse {
    attendance: { attendance: AttendanceDetail[] };
    courses: CourseDetail[];
    lastUpdated: number;
    marks: Marks;
    ophour?: string;
    subscribed?: boolean;
    subscribedSince?: number;
    regNumber: string;
    timetable: { timetable: Array<{ dayOrder: string; class: TimetableClass[] }> };
    token: string;
    user: SrmUserInfo;
    tokenInvalid?: boolean;
    ratelimit?: boolean;
    error?: string;
    status: number;
}

export interface Marks {
    markList: Array<{
        course: string;
        credits: number;
        category: string;
        marks: Array<{ exam: string; obtained: number; maxMark: number }>;
        total: { obtained: number; maxMark: number };
    }>;
    regNumber: string;
    status: number;
}
