import {
  attendance,
  Calendar,
  Course,
  dayOrder,
  marks,
  timetable,
  userInfo,
} from "@/server/action";
import { useQuery } from "@tanstack/react-query";
import {
  DaySchedule,
  AttendanceDetail,
  MarkDetail,
  UserInfo,
  CourseDetail,
  Month,
  DayOrderResponse,
} from "srm-academia-api";
import { toast } from "sonner";

export function useTimetable() {
  return useQuery({
    queryKey: ["timetable"],
    queryFn: async () => {
      const { data } = await timetable();
      if (data.error) throw new Error(data.error);
      if (data.stale) {
        toast.warning("Showing cached data. Portal is unavailable.");
      }
      return data.timetable as DaySchedule[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data } = await attendance();
      if (data.error) throw new Error(data.error);
      if (data.stale) {
        toast.warning("Showing cached data. Portal is unavailable.");
      }
      return data.attendance as AttendanceDetail[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}

export function useMarks() {
  return useQuery({
    queryKey: ["marks"],
    queryFn: async () => {
      const { data } = await marks();
      if (data.error) throw new Error(data.error);
      if (data.stale) {
        toast.warning("Showing cached data. Portal is unavailable.");
      }
      return data.markList.map((mark) => ({
        ...mark,
        subject: mark.course,
      })) as unknown as MarkDetail[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  });
}

export function useUserInfo(enabled = true) {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const { data } = await userInfo();
      if (data.error) throw new Error(data.error);
      return data.userInfo as UserInfo;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
    enabled,
  });
}

export function useCourse() {
  return useQuery({
    queryKey: ["course"],
    queryFn: async () => {
      const { data } = await Course();
      if (data.error) throw new Error(data.error);
      if (data.stale) {
        toast.warning("Showing cached data. Portal is unavailable.");
      }
      return data.courseList as CourseDetail[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}

export function useCalendar() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: async () => {
      const { data } = await Calendar();
      if (data.error) throw new Error(data.error);
      return data.calendar as Month[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}

export function useDayOrder() {
  return useQuery({
    queryKey: ["dayOrder"],
    queryFn: async () => {
      const { data } = await dayOrder();
      if (data.error) throw new Error(data.error);
      return data as DayOrderResponse;
    },
    retry: 1,
  });
}