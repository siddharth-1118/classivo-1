/**
 * Mock data for development mode
 * These are sample data structures that match the API response format
 */

import {
  DaySchedule,
  AttendanceDetail,
  MarkDetail,
  UserInfo,
  CourseDetail,
  Month,
  DayOrderResponse,
} from "srm-academia-api";

export const mockTimetable: DaySchedule[] = [
  {
    dayOrder: "Day 1",
    class: [
      {
        time: "8:00 AM - 9:00 AM",
        courseCode: "CSE1021",
        courseTitle: "Professional Ethics",
        courseRoomNo: "M201",
        courseType: "Theory",
        slot: "G1",
        isClass: true,
      },
      {
        time: "9:00 AM - 10:00 AM",
        courseCode: "CSE1001",
        courseTitle: "Web Development",
        courseRoomNo: "A101",
        courseType: "Theory",
        slot: "A1",
        isClass: true,
      },
      {
        time: "10:00 AM - 11:00 AM",
        courseCode: "CSE1002",
        courseTitle: "Data Structures",
        courseRoomNo: "A102",
        courseType: "Theory",
        slot: "B1",
        isClass: true,
      },
      {
        time: "2:00 PM - 4:00 PM",
        courseCode: "CSE1004",
        courseTitle: "Database Systems Lab",
        courseRoomNo: "LAB101",
        courseType: "Lab",
        slot: "L1",
        isClass: true,
      },
    ],
  },
  {
    dayOrder: "Day 2",
    class: [
      {
        time: "9:00 AM - 10:00 AM",
        courseCode: "CSE1005",
        courseTitle: "Operating Systems",
        courseRoomNo: "A201",
        courseType: "Theory",
        slot: "A2",
        isClass: true,
      },
      {
        time: "10:00 AM - 11:00 AM",
        courseCode: "CSE1006",
        courseTitle: "Computer Networks",
        courseRoomNo: "A202",
        courseType: "Theory",
        slot: "B2",
        isClass: true,
      },
      {
        time: "11:00 AM - 12:00 PM",
        courseCode: "CSE1011",
        courseTitle: "Cloud Computing",
        courseRoomNo: "A205",
        courseType: "Theory",
        slot: "C2",
        isClass: true,
      },
      {
        time: "2:00 PM - 4:00 PM",
        courseCode: "CSE1007",
        courseTitle: "Web Development Lab",
        courseRoomNo: "LAB102",
        courseType: "Lab",
        slot: "L2",
        isClass: true,
      },
    ],
  },
  {
    dayOrder: "Day 3",
    class: [
      {
        time: "9:00 AM - 10:00 AM",
        courseCode: "CSE1001",
        courseTitle: "Web Development",
        courseRoomNo: "A101",
        courseType: "Theory",
        slot: "A1",
        isClass: true,
      },
      {
        time: "10:00 AM - 11:00 AM",
        courseCode: "CSE1012",
        courseTitle: "Compiler Design",
        courseRoomNo: "A204",
        courseType: "Theory",
        slot: "F1",
        isClass: true,
      },
      {
        time: "2:00 PM - 3:00 PM",
        courseCode: "CSE1008",
        courseTitle: "Software Engineering",
        courseRoomNo: "A203",
        courseType: "Theory",
        slot: "D1",
        isClass: true,
      },
      {
        time: "3:00 PM - 4:00 PM",
        courseCode: "CSE1021",
        courseTitle: "Professional Ethics",
        courseRoomNo: "M201",
        courseType: "Theory",
        slot: "G1",
        isClass: true,
      },
    ],
  },
  {
    dayOrder: "Day 4",
    class: [
      {
        time: "8:00 AM - 9:00 AM",
        courseCode: "CSE1011",
        courseTitle: "Cloud Computing",
        courseRoomNo: "A205",
        courseType: "Theory",
        slot: "C2",
        isClass: true,
      },
      {
        time: "9:00 AM - 11:00 AM",
        courseCode: "CSE1009",
        courseTitle: "Machine Learning",
        courseRoomNo: "A301",
        courseType: "Theory",
        slot: "E1",
        isClass: true,
      },
      {
        time: "11:00 AM - 12:00 PM",
        courseCode: "CSE1006",
        courseTitle: "Computer Networks",
        courseRoomNo: "A202",
        courseType: "Theory",
        slot: "B2",
        isClass: true,
      },
      {
        time: "2:00 PM - 4:00 PM",
        courseCode: "CSE1010",
        courseTitle: "Data Structures Lab",
        courseRoomNo: "LAB103",
        courseType: "Lab",
        slot: "L3",
        isClass: true,
      },
    ],
  },
  {
    dayOrder: "Day 5",
    class: [
      {
        time: "9:00 AM - 10:00 AM",
        courseCode: "CSE1002",
        courseTitle: "Data Structures",
        courseRoomNo: "A102",
        courseType: "Theory",
        slot: "B1",
        isClass: true,
      },
      {
        time: "10:00 AM - 11:00 AM",
        courseCode: "CSE1005",
        courseTitle: "Operating Systems",
        courseRoomNo: "A201",
        courseType: "Theory",
        slot: "A2",
        isClass: true,
      },
      {
        time: "11:00 AM - 12:00 PM",
        courseCode: "CSE1012",
        courseTitle: "Compiler Design",
        courseRoomNo: "A204",
        courseType: "Theory",
        slot: "F1",
        isClass: true,
      },
      {
        time: "2:00 PM - 4:00 PM",
        courseCode: "CSE1013",
        courseTitle: "Cloud Computing Lab",
        courseRoomNo: "LAB105",
        courseType: "Lab",
        slot: "L4",
        isClass: true,
      },
    ],
  },
];

export const mockAttendance: AttendanceDetail[] = [
  {
    courseCode: "CSE1001",
    courseTitle: "Web Development",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Dr. Smith",
    courseAttendance: "85.5",
    courseConducted: 20,
    courseAbsent: 3,
    courseAttendanceStatus: { status: "margin", classes: 5 },
  },
  {
    courseCode: "CSE1002",
    courseTitle: "Data Structures",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Dr. Johnson",
    courseAttendance: "90.0",
    courseConducted: 18,
    courseAbsent: 2,
    courseAttendanceStatus: { status: "margin", classes: 3 },
  },
  {
    courseCode: "CSE1004",
    courseTitle: "Database Systems Lab",
    courseCategory: "practical",
    courseSlot: "LAB",
    courseFaculty: "Dr. Brown",
    courseAttendance: "92.0",
    courseConducted: 12,
    courseAbsent: 1,
    courseAttendanceStatus: { status: "margin", classes: 2 },
  },
  {
    courseCode: "CSE1005",
    courseTitle: "Operating Systems",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Dr. Davis",
    courseAttendance: "88.0",
    courseConducted: 19,
    courseAbsent: 2,
    courseAttendanceStatus: { status: "margin", classes: 4 },
  },
  {
    courseCode: "CSE1006",
    courseTitle: "Computer Networks",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Dr. Wilson",
    courseAttendance: "82.5",
    courseConducted: 20,
    courseAbsent: 3,
    courseAttendanceStatus: { status: "margin", classes: 6 },
  },
  {
    courseCode: "CSE1007",
    courseTitle: "Web Development Lab",
    courseCategory: "practical",
    courseSlot: "LAB",
    courseFaculty: "Dr. Smith",
    courseAttendance: "95.0",
    courseConducted: 10,
    courseAbsent: 0,
    courseAttendanceStatus: { status: "margin", classes: 2 },
  },
  {
    courseCode: "CSE1008",
    courseTitle: "Software Engineering",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Prof. Taylor",
    courseAttendance: "76.0",
    courseConducted: 15,
    courseAbsent: 4,
    courseAttendanceStatus: { status: "required", classes: 3 },
  },
  {
    courseCode: "CSE1009",
    courseTitle: "Machine Learning",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Dr. Andrew",
    courseAttendance: "89.5",
    courseConducted: 22,
    courseAbsent: 2,
    courseAttendanceStatus: { status: "margin", classes: 5 },
  },
  {
    courseCode: "CSE1010",
    courseTitle: "Data Structures Lab",
    courseCategory: "practical",
    courseSlot: "LAB",
    courseFaculty: "Dr. Johnson",
    courseAttendance: "91.0",
    courseConducted: 11,
    courseAbsent: 1,
    courseAttendanceStatus: { status: "margin", classes: 3 },
  },
  {
    courseCode: "CSE1011",
    courseTitle: "Cloud Computing",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Dr. Cloud",
    courseAttendance: "80.0",
    courseConducted: 18,
    courseAbsent: 4,
    courseAttendanceStatus: { status: "margin", classes: 2 },
  },
  {
    courseCode: "CSE1012",
    courseTitle: "Compiler Design",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Prof. Code",
    courseAttendance: "84.0",
    courseConducted: 16,
    courseAbsent: 2,
    courseAttendanceStatus: { status: "margin", classes: 4 },
  },
  {
    courseCode: "CSE1013",
    courseTitle: "Cloud Computing Lab",
    courseCategory: "practical",
    courseSlot: "LAB",
    courseFaculty: "Dr. Cloud",
    courseAttendance: "100.0",
    courseConducted: 10,
    courseAbsent: 0,
    courseAttendanceStatus: { status: "margin", classes: 5 },
  },
  {
    courseCode: "CSE1021",
    courseTitle: "Professional Ethics",
    courseCategory: "theory",
    courseSlot: "THEORY",
    courseFaculty: "Prof. Human",
    courseAttendance: "94.0",
    courseConducted: 14,
    courseAbsent: 1,
    courseAttendanceStatus: { status: "margin", classes: 6 },
  },
];

export const mockMarks: MarkDetail[] = [
  {
    course: "CSE1001",
    subject: "CSE1001",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 45, maxMark: 50 },
      { exam: "Assignment", obtained: 18, maxMark: 20 },
      { exam: "Quiz", obtained: 9, maxMark: 10 },
      { exam: "Attendance", obtained: 5, maxMark: 5 },
    ],
    total: { obtained: 77, maxMark: 85 },
  },
  {
    course: "CSE1002",
    subject: "CSE1002",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 42, maxMark: 50 },
      { exam: "Assignment", obtained: 19, maxMark: 20 },
      { exam: "Quiz", obtained: 8, maxMark: 10 },
      { exam: "Attendance", obtained: 5, maxMark: 5 },
    ],
    total: { obtained: 74, maxMark: 85 },
  },
  {
    course: "CSE1005",
    subject: "CSE1005",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 38, maxMark: 50 },
      { exam: "Assignment", obtained: 15, maxMark: 20 },
      { exam: "Quiz", obtained: 7, maxMark: 10 },
      { exam: "Attendance", obtained: 5, maxMark: 5 },
    ],
    total: { obtained: 65, maxMark: 85 },
  },
  {
    course: "CSE1006",
    subject: "CSE1006",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 40, maxMark: 50 },
      { exam: "Assignment", obtained: 17, maxMark: 20 },
      { exam: "Quiz", obtained: 8, maxMark: 10 },
      { exam: "Attendance", obtained: 5, maxMark: 5 },
    ],
    total: { obtained: 70, maxMark: 85 },
  },
  {
    course: "CSE1008",
    subject: "CSE1008",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 44, maxMark: 50 },
      { exam: "Assignment", obtained: 19, maxMark: 20 },
      { exam: "Quiz", obtained: 9, maxMark: 10 },
      { exam: "Attendance", obtained: 3, maxMark: 5 },
    ],
    total: { obtained: 75, maxMark: 85 },
  },
  {
    course: "CSE1009",
    subject: "CSE1009",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 49, maxMark: 50 },
      { exam: "Assignment", obtained: 20, maxMark: 20 },
      { exam: "Quiz", obtained: 10, maxMark: 10 },
      { exam: "Attendance", obtained: 5, maxMark: 5 },
    ],
    total: { obtained: 84, maxMark: 85 },
  },
  {
    course: "CSE1011",
    subject: "CSE1011",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 35, maxMark: 50 },
      { exam: "Assignment", obtained: 16, maxMark: 20 },
      { exam: "Quiz", obtained: 6, maxMark: 10 },
      { exam: "Attendance", obtained: 4, maxMark: 5 },
    ],
    total: { obtained: 61, maxMark: 85 },
  },
  {
    course: "CSE1012",
    subject: "CSE1012",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 41, maxMark: 50 },
      { exam: "Assignment", obtained: 18, maxMark: 20 },
      { exam: "Quiz", obtained: 8, maxMark: 10 },
      { exam: "Attendance", obtained: 4, maxMark: 5 },
    ],
    total: { obtained: 71, maxMark: 85 },
  },
  {
    course: "CSE1021",
    subject: "CSE1021",
    category: "theory",
    marks: [
      { exam: "Mid Term", obtained: 47, maxMark: 50 },
      { exam: "Assignment", obtained: 20, maxMark: 20 },
      { exam: "Quiz", obtained: 10, maxMark: 10 },
      { exam: "Attendance", obtained: 5, maxMark: 5 },
    ],
    total: { obtained: 82, maxMark: 85 },
  },
  {
    course: "CSE1004",
    subject: "CSE1004",
    category: "practical",
    marks: [
      { exam: "Internal", obtained: 55, maxMark: 60 },
      { exam: "Record", obtained: 9, maxMark: 10 },
      { exam: "Model", obtained: 28, maxMark: 30 },
    ],
    total: { obtained: 92, maxMark: 100 },
  },
  {
    course: "CSE1007",
    subject: "CSE1007",
    category: "practical",
    marks: [
      { exam: "Internal", obtained: 58, maxMark: 60 },
      { exam: "Record", obtained: 10, maxMark: 10 },
      { exam: "Model", obtained: 29, maxMark: 30 },
    ],
    total: { obtained: 97, maxMark: 100 },
  },
];

export const mockUserInfo: UserInfo = {
  name: "StealthTensor",
  regNumber: "RA2311003010123",
  department: "Cyber Security",
  semester: "5",
  section: "A",
  mobile: "9876543210",
  program: "B.Tech",
  batch: "2025-2029",
};

export const mockCourses: CourseDetail[] = [
  {
    courseCode: "CSE1001",
    courseTitle: "Web Development",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Dr. Smith",
    courseSlot: ["A1"],
    courseRoomNo: "A101",
  },
  {
    courseCode: "CSE1002",
    courseTitle: "Data Structures",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Dr. Johnson",
    courseSlot: ["B1"],
    courseRoomNo: "A102",
  },
  {
    courseCode: "CSE1004",
    courseTitle: "Database Systems Lab",
    courseCredit: "2",
    courseType: "Lab",
    courseCategory: "practical",
    courseFaculty: "Dr. Brown",
    courseSlot: ["L1"],
    courseRoomNo: "LAB101",
  },
  {
    courseCode: "CSE1005",
    courseTitle: "Operating Systems",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Dr. Davis",
    courseSlot: ["A2"],
    courseRoomNo: "A201",
  },
  {
    courseCode: "CSE1006",
    courseTitle: "Computer Networks",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Dr. Wilson",
    courseSlot: ["B2"],
    courseRoomNo: "A202",
  },
  {
    courseCode: "CSE1007",
    courseTitle: "Web Development Lab",
    courseCredit: "2",
    courseType: "Lab",
    courseCategory: "practical",
    courseFaculty: "Dr. Smith",
    courseSlot: ["L2"],
    courseRoomNo: "LAB102",
  },
  {
    courseCode: "CSE1008",
    courseTitle: "Software Engineering",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Prof. Taylor",
    courseSlot: ["D1"],
    courseRoomNo: "A203",
  },
  {
    courseCode: "CSE1009",
    courseTitle: "Machine Learning",
    courseCredit: "4",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Dr. Andrew",
    courseSlot: ["E1"],
    courseRoomNo: "A301",
  },
  {
    courseCode: "CSE1010",
    courseTitle: "Data Structures Lab",
    courseCredit: "2",
    courseType: "Lab",
    courseCategory: "practical",
    courseFaculty: "Dr. Johnson",
    courseSlot: ["L3"],
    courseRoomNo: "LAB103",
  },
  {
    courseCode: "CSE1011",
    courseTitle: "Cloud Computing",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Dr. Cloud",
    courseSlot: ["C2"],
    courseRoomNo: "A205",
  },
  {
    courseCode: "CSE1012",
    courseTitle: "Compiler Design",
    courseCredit: "3",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Prof. Code",
    courseSlot: ["F1"],
    courseRoomNo: "A204",
  },
  {
    courseCode: "CSE1013",
    courseTitle: "Cloud Computing Lab",
    courseCredit: "2",
    courseType: "Lab",
    courseCategory: "practical",
    courseFaculty: "Dr. Cloud",
    courseSlot: ["L4"],
    courseRoomNo: "LAB105",
  },
  {
    courseCode: "CSE1021",
    courseTitle: "Professional Ethics",
    courseCredit: "2",
    courseType: "Theory",
    courseCategory: "theory",
    courseFaculty: "Prof. Human",
    courseSlot: ["G1"],
    courseRoomNo: "M201",
  },
];

const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weekdayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const academicEvents: Record<string, string> = {
  "2026-01-01": "New Year's Day - Holiday",
  "2026-01-05": "Enrolment Day - B.Tech I,II,III,IV / M.Tech (Int) - I,II,III,IV,V / M.Tech - I,II (Year)",
  "2026-01-08": "Commencement of Classes for - B.Tech I,II,III,IV / M.Tech (Int) - I,II,III,IV,V / M.Tech - I,II (Year)",
  "2026-01-15": "Pongal - Holiday",
  "2026-01-16": "Thiruvalluvar Day - Holiday",
  "2026-01-17": "Uzhavar Thirunal - Holiday",
  "2026-01-26": "Republic Day - Holiday",
  "2026-02-01": "Thaipoosam - Holiday",
  "2026-03-04": "Holi",
  "2026-03-19": "Telugu New Year's Day - Holiday",
  "2026-03-21": "Ramzan - Holiday",
  "2026-03-31": "Mahaveer Jayanthi - Holiday",
  "2026-04-03": "Good Friday - Holiday",
  "2026-04-14": "Tamil New Year's Day / Dr. B.R. Ambedkar's Birthday - Holiday",
  "2026-05-01": "May Day - Holiday",
  "2026-05-06": "Last working day - B.Tech - I,II,III,IV / M.Tech (Int) - I,II,III,IV,V / M.Tech - I,II (Year)",
  "2026-06-26": "Muharram - Holiday",
};

const forcedWorkingDays = new Set<string>([]);

const explicitDayOrderOverrides: Record<string, string> = {
  "2026-01-02": "1",
};

const forcedHolidays = new Set([
  "2026-01-01",
  "2026-01-05",
  "2026-01-06",
  "2026-01-07",
  "2026-01-15",
  "2026-01-16",
  "2026-01-17",
  "2026-01-26",
  "2026-02-01",
  "2026-03-04",
  "2026-03-19",
  "2026-03-21",
  "2026-03-31",
  "2026-04-03",
  "2026-04-14",
  "2026-05-01",
  "2026-05-06",
  "2026-05-07",
  "2026-05-08",
  "2026-05-09",
  "2026-05-10",
  "2026-05-11",
  "2026-05-12",
  "2026-05-13",
  "2026-05-14",
  "2026-05-15",
  "2026-05-16",
  "2026-05-17",
  "2026-05-18",
  "2026-05-19",
  "2026-05-20",
  "2026-05-21",
  "2026-05-22",
  "2026-05-23",
  "2026-05-24",
  "2026-05-25",
  "2026-05-26",
  "2026-05-27",
  "2026-05-28",
  "2026-05-29",
  "2026-05-30",
  "2026-05-31",
  "2026-06-01",
  "2026-06-02",
  "2026-06-03",
  "2026-06-04",
  "2026-06-05",
  "2026-06-06",
  "2026-06-07",
  "2026-06-08",
  "2026-06-09",
  "2026-06-10",
  "2026-06-11",
  "2026-06-12",
  "2026-06-13",
  "2026-06-14",
  "2026-06-15",
  "2026-06-16",
  "2026-06-17",
  "2026-06-18",
  "2026-06-19",
  "2026-06-20",
  "2026-06-21",
  "2026-06-22",
  "2026-06-23",
  "2026-06-24",
  "2026-06-25",
  "2026-06-26",
  "2026-06-27",
  "2026-06-28",
  "2026-06-29",
  "2026-06-30",
]);

const academicStartDate = "2026-01-08";

const buildAcademicCalendar = (): Month[] => {
  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 5, 30);
  const months = new Map<string, Month["days"]>();
  let currentDayOrder = 0;

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = new Date(cursor);
    const iso = formatIsoDate(date);
    const monthLabel = `${monthsShort[date.getMonth()]} '${String(date.getFullYear()).slice(-2)}`;
    const dayName = weekdayNames[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isWorkingDay = forcedWorkingDays.has(iso);
    const isHoliday = forcedHolidays.has(iso);
    const hasAcademicCycleStarted = iso >= academicStartDate;
    const explicitDayOrder = explicitDayOrderOverrides[iso];
    const isRegularCycleDay = !isWeekend && !isHoliday && hasAcademicCycleStarted;

    let dayOrder = "-";
    if (explicitDayOrder) {
      dayOrder = explicitDayOrder;
    } else if (isRegularCycleDay) {
      currentDayOrder = (currentDayOrder % 5) + 1;
      dayOrder = String(currentDayOrder);
    }

    const monthDays = months.get(monthLabel) ?? [];
    monthDays.push({
      day: dayName,
      date: String(date.getDate()),
      dayOrder,
      event: academicEvents[iso] ?? "",
    });
    months.set(monthLabel, monthDays);
  }

  return Array.from(months.entries()).map(([month, days]) => ({
    month,
    days,
  }));
};

export const mockCalendar: Month[] = buildAcademicCalendar();

const getFallbackDayOrder = (): string => {
  const today = new Date();
  const monthLabel = `${monthsShort[today.getMonth()]} '${String(today.getFullYear()).slice(-2)}`;
  const month = mockCalendar.find((entry) => entry.month === monthLabel);
  if (!month) return "0";

  const day = month.days.find((entry) => entry.date === String(today.getDate()));
  if (!day) return "0";
  return day.dayOrder === "-" ? "0" : day.dayOrder;
};

export const mockDayOrder: DayOrderResponse = {
  dayOrder: getFallbackDayOrder(),
  status: 200,
};
