"use client";

import { isDevToken } from "@/utils/devMode";
import {
  mockAttendance,
  mockCalendar,
  mockCourses,
  mockDayOrder,
  mockMarks,
  mockTimetable,
  mockUserInfo,
} from "@/utils/mockData";
import { api, type Json } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import Cookies from "js-cookie";
import type { GocalRow } from "@/types/supabase-custom";
import { emitAuthEvent } from "@/utils/authSync";
import { getAuthToken } from "@/utils/authStorage";

const LOGOUT_PATH = "/auth/logout";
const SUCCESS_STATUS = 200;
const DEFAULT_ERROR_STATUS = 500;
const TIMETABLE_TIMES = [
  "08:00 AM - 08:50 AM",
  "08:50 AM - 09:40 AM",
  "09:45 AM - 10:35 AM",
  "10:40 AM - 11:30 AM",
  "11:35 AM - 12:25 PM",
  "12:30 PM - 01:20 PM",
  "01:25 PM - 02:15 PM",
  "02:20 PM - 03:10 PM",
  "03:10 PM - 04:00 PM",
  "04:00 PM - 04:50 PM",
];

const calendarLog = (...args: unknown[]) => {
  if (typeof console !== "undefined") {
    console.log("[calendar]", ...args);
  }
};

const normalize = (val?: string) =>
  (val ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

type LooseRecord = Record<string, unknown>;

type CourseLite = {
  courseCode: string;
  courseTitle: string;
  courseCredit: number;
  courseCategory: string;
  courseType: string;
  courseFaculty: string;
  courseSlot: string[];
  courseRoomNo: string;
};

type TimetableClass = {
  time: string;
  courseCode: string;
  courseTitle: string;
  courseRoomNo: string;
  courseType: string;
  slot: string;
  isClass: boolean;
};

type TimetableData = {
  timetable: Array<{ dayOrder: string; class: TimetableClass[] }>;
  error: string | null;
  status: number;
  stale: boolean;
};

type AttendanceRow = {
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

type AttendanceData = {
  attendance: AttendanceRow[];
  error: string | null;
  status: number;
  stale: boolean;
};

type MarkRow = {
  course: string;
  credits: number;
  category: string;
  marks: Array<{ exam: string; obtained: number; maxMark: number }>;
  total: { obtained: number; maxMark: number };
};

type MarksData = {
  markList: MarkRow[];
  error: string | null;
  status: number;
  stale: boolean;
};

type CalendarDayNormalized = {
  day: string;
  date: string;
  dayOrder: string;
  event: string;
};

type CalendarMonthNormalized = {
  month: string;
  days: CalendarDayNormalized[];
};

type CalendarData = {
  calendar: CalendarMonthNormalized[];
  error: string | null;
  status: number;
  stale: boolean;
};

type CourseData = {
  courseList: CourseLite[];
  batch: string;
  error: string | null;
  status: number;
  stale: boolean;
};

type UserInfoData = {
  userInfo: {
    name: string;
    regNumber: string;
    department: string;
    semester: string;
    section: string;
    mobile: string;
    program: string;
    batch: string;
  };
  error: string | null;
  status: number;
};

type DayOrderData = {
  dayOrder: string;
  error: string | null;
  status: number;
  stale: boolean;
};

type ApiResult<T> = { data: T };

type CourseApiRecord = LooseRecord & {
  courseSlot?: unknown;
  slot?: unknown;
  Slot?: unknown;
  Credit?: unknown;
  credit?: unknown;
  credits?: unknown;
  courseCredit?: unknown;
  CourseCredit?: unknown;
  courseCode?: unknown;
  code?: unknown;
  CourseCode?: unknown;
  courseTitle?: unknown;
  title?: unknown;
  CourseTitle?: unknown;
  courseCategory?: unknown;
  category?: unknown;
  CourseCategory?: unknown;
  courseType?: unknown;
  type?: unknown;
  CourseType?: unknown;
  courseFaculty?: unknown;
  faculty?: unknown;
  CourseFaculty?: unknown;
  courseRoomNo?: unknown;
  roomNo?: unknown;
  CourseRoomNo?: unknown;
};

type StatusLikeError = { status?: number; message?: string };

const toFixed2 = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : "0.00");

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toRecordArray = (value: unknown): LooseRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const toStringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
};

const toNumberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry : toStringValue(entry)))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,/|-]/)
      .map((slot) => slot.trim())
      .filter(Boolean);
  }
  return [];
};

const toInt = (v: unknown): number => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\s*\d+\s*$/.test(v)) {
    return parseInt(v.trim(), 10);
  }
  return NaN;
};

const parseClock = (value: string): number | null => {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase().replace(/\s+/g, "");
  const hasAm = /am$/.test(trimmed);
  const hasPm = /pm$/.test(trimmed);
  const core = trimmed.replace(/(am|pm)$/i, "");
  const match = core.match(/^(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return null;
  let hours = parseInt(match[1]!, 10);
  const minutes = match[2] ? parseInt(match[2]!, 10) : 0;

  if (hasPm && hours < 12) hours += 12;
  if (hasAm && hours === 12) hours = 0;
  if (!hasAm && !hasPm && hours <= 6) hours += 12;

  return hours * 60 + minutes;
};

const parseRange = (raw: string): { start: number; end: number } | null => {
  if (!raw) return null;
  const normalized = raw.toLowerCase().replace(/\s+/g, " ");
  const match = normalized.match(/([0-9: ]+ ?(?:am|pm)?)[\s]*[-–—to]{1,3}[\s]*([0-9: ]+ ?(?:am|pm)?)/i);
  if (!match) {
    const single = parseClock(normalized);
    if (single != null) return { start: single, end: single + 50 };
    return null;
  }

  const start = parseClock(match[1]!);
  let end = parseClock(match[2]!);

  if (start != null && end != null && end <= start) {
    end += 12 * 60;
  }

  if (start == null || end == null) return null;
  return { start, end };
};

const canonicalSlots = TIMETABLE_TIMES.map((label) => {
  const compact = label.replace(/\s/g, "");
  const match = compact.match(/(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/);
  const start = match ? parseClock(match[1]!) : null;
  const end = match ? parseClock(match[2]!) : null;
  return {
    label,
    startMin: start ?? 0,
    endMin: end ?? (start ? start + 50 : 0),
  };
});

const mapRangeToSlots = (start: number, end: number): number[] => {
  const hits: number[] = [];
  canonicalSlots.forEach((slot, idx) => {
    const overlap = Math.max(0, Math.min(end, slot.endMin) - Math.max(start, slot.startMin));
    const slotLength = Math.max(1, slot.endMin - slot.startMin);
    if (overlap / slotLength >= 0.5) {
      hits.push(idx);
    }
  });

  if (!hits.length) {
    const nearest = canonicalSlots.reduce(
      (best, slot, idx) => {
        const distance = Math.abs(slot.startMin - start);
        return distance < best.distance ? { index: idx, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );
    hits.push(nearest.index);
  }

  return hits;
};

const read1BasedSlotIndex = (record: LooseRecord): number => {
  // Only accept fields that are actually numeric indices from the API.
  const keys = ["slotIndex", "SlotIndex", "index", "Index", "period", "Period"];
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const value = (record as Record<string, unknown>)[key];
    const parsed = toInt(value);
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= canonicalSlots.length) {
      return parsed; // 1-based
    }
  }
  return NaN;
};

const valueFromKeys = (
  record: LooseRecord | null | undefined,
  keys: string[],
): unknown => {
  if (!record) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      const value = record[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }
  return undefined;
};

const pickStringField = (record: LooseRecord | null, keys: string[], fallback = ""): string => {
  const value = valueFromKeys(record, keys);
  const text = toStringValue(value, fallback).trim();
  return text.length > 0 ? text : fallback;
};

const pickNumberField = (record: LooseRecord | null, keys: string[], fallback = 0): number => {
  const value = valueFromKeys(record, keys);
  return toNumberValue(value, fallback);
};

const pickRecordArrayField = (record: LooseRecord | null, keys: string[]): LooseRecord[] => {
  if (!record) return [];
  for (const key of keys) {
    const arr = toRecordArray(record[key]);
    if (arr.length) return arr;
  }
  return [];
};

const pickRecordField = (record: LooseRecord | null, keys: string[]): LooseRecord | null => {
  const value = valueFromKeys(record, keys);
  return isRecord(value) ? (value as LooseRecord) : null;
};

const firstRecordArray = (...candidates: unknown[]): LooseRecord[] => {
  for (const candidate of candidates) {
    const records = toRecordArray(candidate);
    if (records.length) {
      return records;
    }
  }
  return [];
};

const isStatusError = (value: unknown): value is StatusLikeError =>
  typeof value === "object" && value !== null && ("status" in value || "message" in value);

const extractStatus = (error: unknown, fallback = DEFAULT_ERROR_STATUS): number => {
  if (isStatusError(error) && typeof error.status === "number") return error.status;
  return fallback;
};

const extractMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (isStatusError(error) && typeof error.message === "string") return error.message;
  return fallback;
};

const handleAuthError = (error: unknown) => {
  if (isStatusError(error) && error.status === 401) {
    handleAuthRedirect();
  }
};

function handleAuthRedirect() {
  if (typeof window !== "undefined") {
    // We let AuthStateWatcher handle the global redirection logic to avoid loops
    emitAuthEvent("logout");
  } else {
    throw new Error("Unauthorized");
  }
}

async function getToken() {
  if (typeof window === "undefined") return undefined;
  const token = getAuthToken();
  
  if (!token) {
    const rawPath = window.location.pathname || "/";
    // Normalize path: handle trailing slash and empty string
    const pathname = rawPath === "/" ? "/" : rawPath.replace(/\/+$/, "");
    
    // Only redirect if NOT on root and NOT on auth routes
    if (pathname !== "/" && !pathname.startsWith("/auth")) {
      console.log("[getToken] No token found on protected route, triggering auth redirect", { pathname });
      handleAuthRedirect();
    }
    return undefined;
  }
  return token;
}

async function getAllCourses(tokenParam?: string, seed?: Json): Promise<CourseLite[]> {
  const token = tokenParam ?? (await getToken());
  if (!token) return [];
  if (isDevToken(token)) {
    return mockCourses.map((course) => mapCourseRecord(course as LooseRecord));
  }

  try {
    const res = (seed ?? (await api.courses(token))) as Json;
    const resRecord = res as LooseRecord;
    const dataRecord = isRecord(resRecord.data) ? (resRecord.data as LooseRecord) : null;
    const rawList = firstRecordArray(
      resRecord.courseList,
      resRecord.courses,
      dataRecord?.courseList,
    ) as CourseApiRecord[];

    return rawList
      .map((course) => mapCourseRecord(course))
      .filter((course) => course.courseCode.length > 0);
  } catch (error) {
    handleAuthError(error);
    return [];
  }
}

const mapCourseRecord = (course: LooseRecord): CourseLite => {
  const slotValue = valueFromKeys(course, ["courseSlot", "slot", "Slot"]);
  return {
    courseCode: pickStringField(course, ["courseCode", "code", "CourseCode"]),
    courseTitle: pickStringField(course, ["courseTitle", "title", "CourseTitle"]),
    courseCredit: pickNumberField(course, [
      "courseCredit",
      "CourseCredit",
      "Credit",
      "credit",
      "credits",
    ]),
    courseCategory: pickStringField(course, ["courseCategory", "category", "CourseCategory"]).toLowerCase(),
    courseType: pickStringField(course, ["courseType", "type", "CourseType"]),
    courseFaculty: pickStringField(course, ["courseFaculty", "faculty", "CourseFaculty"]),
    courseSlot: toStringArray(slotValue),
    courseRoomNo: pickStringField(course, ["courseRoomNo", "roomNo", "CourseRoomNo"]),
  };
};

export async function serverLogin(params: {
  account: string;
  password: string;
  cdigest?: string;
  captcha?: string;
}): Promise<{ res: Json }> {
  const res = await api.login(params);
  return { res };
}

export async function getLogout(tokenParam?: string): Promise<{ res: Json | { success: boolean } }> {
  const token = tokenParam ?? getAuthToken();
  if (!token || isDevToken(token)) {
    return { res: { success: true } };
  }
  const res = await api.logout(token);
  return { res };
}

export async function timetable(): Promise<ApiResult<TimetableData>> {
  const token = await getToken();
  if (!token) {
    return {
      data: {
        timetable: [],
        error: "Not authenticated",
        status: 401,
        stale: false,
      },
    };
  }
  if (isDevToken(token)) {
    return {
      data: {
        timetable: mockTimetable,
        error: null,
        status: SUCCESS_STATUS,
        stale: false,
      },
    };
  }

  try {
    const res = (await api.timetable(token)) as Json;
    const resRecord = res as LooseRecord;
    const schedule = toRecordArray(resRecord.schedule);

    const timetableData = schedule.map((dayRecord) => {
      const rawTable = Array.isArray(dayRecord.table) ? dayRecord.table : [];

      const classes: TimetableClass[] = Array.from({ length: canonicalSlots.length }, (_, idx) =>
        defaultTimetableClass(idx)
      );

      rawTable.forEach((slotRecord, absoluteIdx) => {
        if (!isRecord(slotRecord)) return;

        const courseTitle = pickStringField(slotRecord, ["name", "Name"]).trim();
        const hasClass = courseTitle.length > 0;

        let indices: number[] = [];
        const slotIndex1Based = read1BasedSlotIndex(slotRecord);
        if (Number.isFinite(slotIndex1Based)) {
          const zeroBased = slotIndex1Based - 1;
          if (zeroBased >= 0 && zeroBased < canonicalSlots.length) {
            indices = [zeroBased];
          }
        }

        if (!indices.length) {
          const timeText = pickStringField(slotRecord, ["time", "Time"]);
          const parsedRange = parseRange(timeText);
          if (parsedRange) {
            indices = mapRangeToSlots(parsedRange.start, parsedRange.end);
          } else {
            indices = [Math.min(Math.max(absoluteIdx, 0), canonicalSlots.length - 1)];
          }
        }

        const courseTypeRaw = pickStringField(slotRecord, ["courseType", "CourseType"]);
        const normalizedType = courseTypeRaw.toLowerCase().startsWith("p") ? "Lab" : "Theory";

        indices.forEach((idx, sequenceIndex) => {
          classes[idx] = {
            time: TIMETABLE_TIMES[idx],
            courseCode: pickStringField(slotRecord, ["code", "Code"]),
            courseTitle:
              courseTitle + (indices.length > 1 ? ` (${sequenceIndex + 1}/${indices.length})` : ""),
            courseRoomNo: pickStringField(slotRecord, ["roomNo", "RoomNo"]),
            courseType: hasClass ? normalizedType : "",
            slot: pickStringField(slotRecord, ["slot", "Slot"]),
            isClass: hasClass,
          };
        });
      });

      return {
        dayOrder: `Day ${pickStringField(dayRecord, ["day", "Day"], "")}`,
        class: classes,
      };
    });

    const stale = resRecord.stale === true;
    const status = toNumberValue(resRecord.status, SUCCESS_STATUS);
    return { data: { timetable: timetableData, error: null, status, stale } };
  } catch (error) {
    handleAuthError(error);
    return {
      data: {
        timetable: [],
        error: extractMessage(error, "Failed to fetch timetable"),
        status: extractStatus(error),
        stale: false,
      },
    };
  }
}

const defaultTimetableClass = (index: number): TimetableClass => ({
  time: TIMETABLE_TIMES[index] || "",
  courseCode: "",
  courseTitle: "",
  courseRoomNo: "",
  courseType: "",
  slot: "",
  isClass: false,
});

export async function attendance(): Promise<ApiResult<AttendanceData>> {
  const token = await getToken();
  if (!token) {
    return {
      data: {
        attendance: [],
        error: "Not authenticated",
        status: 401,
        stale: false,
      },
    };
  }
  if (isDevToken(token)) {
    return {
      data: {
        attendance: mockAttendance,
        error: null,
        status: SUCCESS_STATUS,
        stale: false,
      },
    };
  }

  try {
    const [res, courseList] = await Promise.all([api.attendance(token), getAllCourses(token)]);
    const resRecord = res as LooseRecord;
    const dataRecord = isRecord(resRecord.data) ? (resRecord.data as LooseRecord) : null;
    const rawAttendance = firstRecordArray(resRecord.attendance, dataRecord?.attendance);

    const attendanceRows = rawAttendance.map((entry) => {
      const conducted = pickNumberField(entry, [
        "hoursConducted",
        "HoursConducted",
        "courseConducted",
        "HoursHeld",
        "conducted",
      ]);
      const absent = pickNumberField(entry, ["hoursAbsent", "HoursAbsent", "courseAbsent", "absent"]);
      const present = Math.max(0, conducted - absent);
      const percentRaw = pickNumberField(entry, [
        "attendancePercentage",
        "AttendancePercentage",
        "courseAttendance",
      ]);
      const percent = conducted > 0 ? percentRaw : 0;

      const target = 0.75;
      let classes = 0;
      let status: "required" | "margin" = "margin";
      if (conducted > 0) {
        if (percent < 75) {
          status = "required";
          classes = Math.max(0, Math.ceil(((target * conducted - present) / (1 - target)) || 0));
        } else {
          status = "margin";
          classes = Math.max(0, Math.floor(present / target - conducted));
        }
      }

      const courseCode = pickStringField(entry, ["courseCode", "CourseCode"]);
      const course = courseList.find((c) => normalize(c.courseCode) === normalize(courseCode));
      const rawType = pickStringField(entry, ["category", "Category", "courseType", "CourseType"]).toLowerCase();
      const rawSlot = pickStringField(entry, ["slot", "Slot", "courseSlot", "CourseSlot"]).toUpperCase();
      const courseTypeLower = course?.courseType?.toLowerCase() ?? "";
      const derivedCategory =
        rawType.startsWith("p") ||
        rawType.includes("lab") ||
        rawSlot.startsWith("L") ||
        rawSlot.startsWith("P") ||
        courseTypeLower.startsWith("p")
          ? "practical"
          : "theory";
      const slotValue = valueFromKeys(entry, ["slot", "Slot", "courseSlot", "CourseSlot"]);
      const slotArray = toStringArray(slotValue);
      const slotString = slotArray.length > 0 ? slotArray.join(" , ") : toStringValue(slotValue);

      const faculty =
        pickStringField(entry, ["facultyName", "FacultyName", "courseFaculty", "CourseFaculty"]) ||
        course?.courseFaculty ||
        "";

      return {
        courseCode,
        courseTitle: pickStringField(entry, ["courseTitle", "CourseTitle"], course?.courseTitle ?? courseCode),
        courseCategory: derivedCategory,
        courseSlot: slotString.toUpperCase().startsWith("P") ? "LAB" : slotString,
        courseFaculty: faculty.split("(")[0].trim(),
        courseAttendance: toFixed2(percent),
        courseConducted: conducted,
        courseAbsent: absent,
        courseAttendanceStatus: { status, classes },
      };
    });

    const stale = resRecord.stale === true;
    const statusCode = toNumberValue(resRecord.status, SUCCESS_STATUS);
    return {
      data: {
        attendance: attendanceRows,
        error: null,
        status: statusCode,
        stale,
      },
    };
  } catch (error) {
    handleAuthError(error);
    return {
      data: {
        attendance: [],
        error: extractMessage(error, "Failed to fetch attendance"),
        status: extractStatus(error),
        stale: false,
      },
    };
  }
}

export async function marks(): Promise<ApiResult<MarksData>> {
  const token = await getToken();
  if (!token) {
    return {
      data: {
        markList: [],
        error: "Not authenticated",
        status: 401,
        stale: false,
      },
    };
  }
  if (isDevToken(token)) {
    const courseList = await getAllCourses(token);
    const markList = buildMarkList(mockMarks as unknown as LooseRecord[], courseList);
    return {
      data: {
        markList,
        error: null,
        status: SUCCESS_STATUS,
        stale: false,
      },
    };
  }

  try {
    const [res, courseList] = await Promise.all([api.marks(token), getAllCourses(token)]);
    const resRecord = res as LooseRecord;
    const dataRecord = isRecord(resRecord.data) ? (resRecord.data as LooseRecord) : null;
    const rawMarks = firstRecordArray(resRecord.marks, resRecord.markList, dataRecord?.markList);

    const markList = buildMarkList(rawMarks, courseList);

    const stale = resRecord.stale === true;
    const statusCode = toNumberValue(resRecord.status, SUCCESS_STATUS);
    return {
      data: {
        markList,
        error: null,
        status: statusCode,
        stale,
      },
    };
  } catch (error) {
    handleAuthError(error);
    return {
      data: {
        markList: [],
        error: extractMessage(error, "Failed to fetch marks"),
        status: extractStatus(error),
        stale: false,
      },
    };
  }
}

export async function Calendar(): Promise<ApiResult<CalendarData>> {
  const token = await getToken();
  if (!token) {
    return {
      data: {
        calendar: [],
        error: "Not authenticated",
        status: 401,
        stale: false,
      },
    };
  }
  if (isDevToken(token)) {
    return {
      data: {
        calendar: mockCalendar,
        error: null,
        status: SUCCESS_STATUS,
        stale: false,
      },
    };
  }

  try {
    const res = (await api.calendar(token)) as Json;
    const resRecord = res as LooseRecord;
    if (resRecord.status === 404) {
      handleAuthRedirect();
    }

    const dataRecord = isRecord(resRecord.data) ? (resRecord.data as LooseRecord) : null;
    const rawMonths = firstRecordArray(resRecord.calendar, resRecord.months, dataRecord?.calendar);

    const calendar = normalizeCalendarMonthsFromRecords(rawMonths);

    const status = toNumberValue(resRecord.status, SUCCESS_STATUS);

    if (calendar.length === 0) {
      calendarLog("Calendar API responded with zero months; attempting Supabase fallback.");
      const supabaseCalendar = await fetchCalendarFromSupabase("api-empty");
      if (supabaseCalendar.length > 0) {
        return {
          data: {
            calendar: supabaseCalendar,
            error: null,
            status,
            stale: true,
          },
        };
      }
      calendarLog("Supabase fallback also returned zero rows");
    }

    return {
      data: {
        calendar,
        error: null,
        status,
        stale: false,
      },
    };
  } catch (error) {
    calendarLog("Calendar API request failed", error);
    handleAuthError(error);
    const supabaseCalendar = await fetchCalendarFromSupabase("api-error", error);
    if (supabaseCalendar.length > 0) {
      return {
        data: {
          calendar: supabaseCalendar,
          error: null,
          status: SUCCESS_STATUS,
          stale: true,
        },
      };
    }
    calendarLog("Falling back to bundled mock calendar data");
    return {
      data: {
        calendar: mockCalendar,
        error: null,
        status: SUCCESS_STATUS,
        stale: true,
      },
    };
  }
}

type CalendarFallbackReason = "api-empty" | "api-error" | "dayorder-api-error" | "dayorder-missing-today";

async function fetchCalendarFromSupabase(
  reason: CalendarFallbackReason,
  err?: unknown
): Promise<CalendarMonthNormalized[]> {
  calendarLog("Attempting Supabase calendar fetch", {
    reason,
    hasError: Boolean(err),
  });

  const client = getSupabaseBrowserClient();
  if (!client) {
    calendarLog(
      "Supabase client unavailable. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SERVICE_KEY are configured."
    );
    return [];
  }

  calendarLog("Supabase client ready; querying 'gocal' table");

  const { startOfToday, endOfToday } = getTodayRange();
  calendarLog("Computed today's range", {
    startISO: startOfToday.toISOString(),
    endISO: endOfToday.toISOString(),
    startMs: startOfToday.getTime(),
    endMs: endOfToday.getTime(),
  });

  const { data, error } = await client
    .from("gocal")
    .select("date, day, event, month, order, created_at")
    .order("month", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    calendarLog("Supabase gocal query failed", {
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return [];
  }

  if (!data || data.length === 0) {
    calendarLog("Supabase gocal query returned 0 rows");
    return [];
  }

  const rows: GocalRow[] = data;
  calendarLog("Supabase gocal query succeeded", { rows: rows.length });

  const todaysRows = rows.filter((row) => {
    const createdAtMs = toEpoch(row.created_at);
    if (createdAtMs === null) return false;
    return createdAtMs >= startOfToday.getTime() && createdAtMs <= endOfToday.getTime();
  });
  calendarLog("Rows inside today's range", { count: todaysRows.length });

  const normalized = normalizeSupabaseCalendar(rows);
  calendarLog("Normalized Supabase calendar", { months: normalized.length });
  return normalized;
}

function normalizeCalendarMonthsFromRecords(rawMonths: LooseRecord[]): CalendarMonthNormalized[] {
  return rawMonths.map((monthRecord) => ({
    month: pickStringField(monthRecord, ["month", "Month"]),
    days: pickRecordArrayField(monthRecord, ["days", "Days"]).map((dayRecord) => ({
      day: pickStringField(dayRecord, ["day", "Day"]),
      date: pickStringField(dayRecord, ["date", "Date"]),
      dayOrder: pickStringField(dayRecord, ["dayOrder", "DayOrder"]),
      event: pickStringField(dayRecord, ["event", "Event"]),
    })),
  }));
}

const CALENDAR_MONTH_LABELS = [
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

function normalizeDayOrderValue(value: string): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (text === "-" || /holiday/i.test(text)) return "0";
  const match = text.match(/\d+/);
  return match ? match[0] : null;
}

function deriveDayOrderFromCalendarMonths(months: CalendarMonthNormalized[]): string | null {
  if (!months.length) return null;
  const now = new Date();
  const preferredLabel = formatCalendarLabel(now);
  const orderedMonths = prioritizeMonths(months, preferredLabel);
  const todayDate = now.getDate();

  for (const monthEntry of orderedMonths) {
    const candidate = monthEntry.days.find((day) => extractDayNumber(day.date) === todayDate);
    if (!candidate) continue;
    const normalized = normalizeDayOrderValue(candidate.dayOrder);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
}

function deriveDayOrderFromMockPlanner(): string | null {
  const normalized = mockCalendar.map((month) => ({
    month: month.month,
    days: month.days.map((day) => ({
      day: day.day,
      date: day.date,
      dayOrder: day.dayOrder,
      event: day.event,
    })),
  }));

  return deriveDayOrderFromCalendarMonths(normalized);
}

function prioritizeMonths(
  months: CalendarMonthNormalized[],
  preferredLabel: string
): CalendarMonthNormalized[] {
  const index = months.findIndex((entry) => entry.month.trim() === preferredLabel);
  if (index === -1) {
    return months;
  }
  return [months[index], ...months.slice(0, index), ...months.slice(index + 1)];
}

function extractDayNumber(value: string): number | null {
  if (!value) return null;
  const match = value.match(/\d+/);
  return match ? parseInt(match[0]!, 10) : null;
}

function formatCalendarLabel(date: Date): string {
  const suffix = String(date.getFullYear()).slice(-2);
  return `${CALENDAR_MONTH_LABELS[date.getMonth()]} '${suffix}`;
}

function normalizeSupabaseCalendar(rows: GocalRow[]): CalendarMonthNormalized[] {
  const monthOrder: string[] = [];
  const grouped = new Map<string, CalendarDayNormalized[]>();

  rows.forEach((row) => {
    const label = row.month ?? "Unknown";
    if (!grouped.has(label)) {
      grouped.set(label, []);
      monthOrder.push(label);
    }
    const entry: CalendarDayNormalized = {
      day: row.day ?? "",
      date: row.date ?? "",
      dayOrder: row.order ?? "-",
      event: row.event ?? "",
    };
    grouped.get(label)?.push(entry);
  });

  return monthOrder.map((label) => ({
    month: label,
    days: sortCalendarDays(grouped.get(label) ?? []),
  }));
}

function sortCalendarDays(days: CalendarDayNormalized[]): CalendarDayNormalized[] {
  return [...days].sort((a, b) => {
    const left = parseNumericDate(a.date);
    const right = parseNumericDate(b.date);
    if (left === right) {
      return a.date.localeCompare(b.date);
    }
    return left - right;
  });
}

function parseNumericDate(value: string): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed;
}

function getTodayRange() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return { startOfToday, endOfToday };
}

function toEpoch(value: unknown): number | null {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export async function Course(): Promise<ApiResult<CourseData>> {
  const token = await getToken();
  if (!token) {
    return {
      data: {
        courseList: [],
        batch: "",
        error: "Not authenticated",
        status: 401,
        stale: false,
      },
    };
  }
  if (isDevToken(token)) {
    const normalizedCourses = await getAllCourses(token);
    return {
      data: {
        courseList: normalizedCourses,
        batch: mockUserInfo.batch,
        error: null,
        status: SUCCESS_STATUS,
        stale: false,
      },
    };
  }

  try {
    const res = (await api.courses(token)) as Json;
    const courseList = await getAllCourses(token, res);
    const resRecord = res as LooseRecord;
    const dataRecord = isRecord(resRecord.data) ? (resRecord.data as LooseRecord) : null;
    const batch = pickStringField(dataRecord ?? resRecord, ["batch", "Batch"]);
    const stale = resRecord.stale === true;
    const status = toNumberValue(resRecord.status, SUCCESS_STATUS);

    return {
      data: {
        courseList,
        batch,
        error: null,
        status,
        stale,
      },
    };
  } catch (error) {
    handleAuthError(error);
    return {
      data: {
        courseList: [],
        batch: "",
        error: extractMessage(error, "Failed to fetch courses"),
        status: extractStatus(error),
        stale: false,
      },
    };
  }
}

const buildMarkList = (rawMarks: LooseRecord[], courseList: CourseLite[]): MarkRow[] =>
  rawMarks.map((entry) => {
    const courseCode = pickStringField(entry, ["courseCode", "course", "CourseCode"]);
    const ctRaw = pickStringField(entry, ["courseType", "category", "CourseType"]).toLowerCase();
    const course = courseList.find((c) => normalize(c.courseCode) === normalize(courseCode));
    const courseTypeLower = course?.courseType?.toLowerCase() ?? "";
    const category = ctRaw.startsWith("p") || courseTypeLower.startsWith("p") ? "practical" : "theory";

    const marksSource = pickRecordArrayField(entry, ["marks", "testPerformance", "TestPerformance"]);
    const marks = marksSource.map((attempt) => {
      const marksRecord = pickRecordField(attempt, ["marks", "Marks"]);
      const obtained = pickNumberField(attempt, ["obtained", "score"], pickNumberField(marksRecord, ["scored", "Scored"], 0));
      const maxMark = pickNumberField(attempt, ["maxMark", "total"], pickNumberField(marksRecord, ["total", "Total"], 0));
      return {
        exam: pickStringField(attempt, ["exam", "test", "Test"]),
        obtained,
        maxMark,
      };
    });

    const overallRecord = pickRecordField(entry, ["overall", "Overall"]);
    const totalRecord = pickRecordField(entry, ["total", "Total"]);
    const totalObtained = pickNumberField(overallRecord, ["scored", "Scored"], pickNumberField(totalRecord, ["obtained", "Obtained"], 0));
    const totalMax = pickNumberField(overallRecord, ["total", "Total"], pickNumberField(totalRecord, ["maxMark", "MaxMark", "total"], 0));

    return {
      course: courseCode,
      credits: course?.courseCredit ?? pickNumberField(entry, ["credits", "Credit"], 0),
      category,
      marks,
      total: {
        obtained: totalObtained,
        maxMark: totalMax,
      },
    };
  });

export async function userInfo(): Promise<ApiResult<UserInfoData>> {
  const token = await getToken();
  if (!token) {
    return {
      data: {
        userInfo: {
          name: "",
          regNumber: "",
          department: "",
          semester: "",
          section: "",
          mobile: "",
          program: "",
          batch: "",
        },
        error: "Not authenticated",
        status: 401,
      },
    };
  }
  if (isDevToken(token)) {
    return {
      data: {
        userInfo: mockUserInfo,
        error: null,
        status: SUCCESS_STATUS,
      },
    };
  }

  try {
    const res = (await api.user(token)) as Json;
    const record = res as LooseRecord;
    const status = toNumberValue(record.status, SUCCESS_STATUS);

    return {
      data: {
        userInfo: {
          name: pickStringField(record, ["name", "Name"]),
          regNumber: pickStringField(record, ["regNumber", "RegNumber"]),
          department: pickStringField(record, ["department", "Department"]),
          semester: pickStringField(record, ["semester", "Semester"]),
          section: pickStringField(record, ["section", "Section"]),
          mobile: pickStringField(record, ["mobile", "Mobile"]),
          program: pickStringField(record, ["program", "Program"]),
          batch: pickStringField(record, ["batch", "Batch"]),
        },
        error: null,
        status,
      },
    };
  } catch (error) {
    handleAuthError(error);
    return {
      data: {
        userInfo: {
          name: "",
          regNumber: "",
          department: "",
          semester: "",
          section: "",
          mobile: "",
          program: "",
          batch: "",
        },
        error: extractMessage(error, "Failed to fetch user info"),
        status: extractStatus(error),
      },
    };
  }
}

export async function dayOrder(): Promise<ApiResult<DayOrderData>> {
  const token = await getToken();
  const plannerDayOrder = deriveDayOrderFromMockPlanner();
  if (!token) {
    return {
      data: {
        dayOrder: plannerDayOrder ?? "0",
        error: "Not authenticated",
        status: 401,
        stale: plannerDayOrder !== null,
      },
    };
  }
  if (isDevToken(token)) {
    return {
      data: {
        dayOrder: plannerDayOrder ?? mockDayOrder.dayOrder,
        error: null,
        status: mockDayOrder.status,
        stale: plannerDayOrder !== null,
      },
    };
  }

  if (plannerDayOrder !== null) {
    return {
      data: {
        dayOrder: plannerDayOrder,
        error: null,
        status: SUCCESS_STATUS,
        stale: true,
      },
    };
  }

  try {
    const res = (await api.calendar(token)) as Json;
    const record = res as LooseRecord;
    const today = valueFromKeys(record, ["today", "Today"]);
    const todayRecord = isRecord(today) ? (today as LooseRecord) : null;
    const dayOrderValue = pickStringField(todayRecord, ["dayOrder", "DayOrder"], "");
    const status = toNumberValue(record.status, SUCCESS_STATUS);

    const normalizedDayOrder = normalizeDayOrderValue(dayOrderValue);
    if (normalizedDayOrder !== null) {
      return {
        data: {
          dayOrder: normalizedDayOrder,
          error: null,
          status,
          stale: false,
        },
      };
    }

    const dataRecord = isRecord(record.data) ? (record.data as LooseRecord) : null;
    const rawMonths = firstRecordArray(record.calendar, record.months, dataRecord?.calendar);
    const calendarMonths = normalizeCalendarMonthsFromRecords(rawMonths);
    const derivedDayOrder = deriveDayOrderFromCalendarMonths(calendarMonths);
    if (derivedDayOrder !== null) {
      return {
        data: {
          dayOrder: derivedDayOrder,
          error: null,
          status,
          stale: false,
        },
      };
    }

    const supabaseCalendar = await fetchCalendarFromSupabase("dayorder-missing-today");
    const supabaseDayOrder = deriveDayOrderFromCalendarMonths(supabaseCalendar);
    if (supabaseDayOrder !== null) {
      return {
        data: {
          dayOrder: supabaseDayOrder,
          error: null,
          status: SUCCESS_STATUS,
          stale: true,
        },
      };
    }

    return {
      data: {
        dayOrder: "0",
        error: "Unable to determine day order",
        status,
        stale: false,
      },
    };
  } catch (error) {
    handleAuthError(error);
    const supabaseCalendar = await fetchCalendarFromSupabase("dayorder-api-error", error);
    const supabaseDayOrder = deriveDayOrderFromCalendarMonths(supabaseCalendar);
    if (supabaseDayOrder !== null) {
      return {
        data: {
          dayOrder: supabaseDayOrder,
          error: null,
          status: SUCCESS_STATUS,
          stale: true,
        },
      };
    }
    calendarLog("Falling back to bundled mock day order");
    return {
      data: {
        dayOrder: mockDayOrder.dayOrder,
        error: null,
        status: mockDayOrder.status,
        stale: true,
      },
    };
  }
}
