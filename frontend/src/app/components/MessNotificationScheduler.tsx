"use client";

import { useEffect } from "react";
import menuData from "../../../public/mess_menu.json";

type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";
type DayType = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

type DayMenu = Record<MealType, string[]>;
type MenuData = Record<DayType, DayMenu>;

type MealSchedule = {
  meal: MealType;
  hour: number;
  minute: number;
};

const days: DayType[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const mealSchedule: MealSchedule[] = [
  { meal: "Breakfast", hour: 7, minute: 30 },
  { meal: "Lunch", hour: 12, minute: 15 },
  { meal: "Snacks", hour: 16, minute: 30 },
  { meal: "Dinner", hour: 19, minute: 15 },
];

const storageKey = "classivo_mess_notification_last_sent";

const getTodayMealItems = (meal: MealType) => {
  const data = menuData as MenuData;
  const dayName = days[new Date().getDay()];
  return {
    dayName,
    items: data[dayName]?.[meal] ?? [],
  };
};

const getCurrentMealSlot = (now: Date) => {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    mealSchedule.find(({ hour, minute }) => currentMinutes >= hour * 60 + minute) ??
    null
  );
};

const getSentKey = (date: Date, meal: MealType) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}:${meal}`;
};

const showMealNotification = async (meal: MealType) => {
  const { dayName, items } = getTodayMealItems(meal);
  const body =
    items.length > 0
      ? `${dayName} ${meal}: ${items.slice(0, 5).join(", ")}${items.length > 5 ? "..." : ""}`
      : `${dayName} ${meal} menu is ready in Classivo.`;

  const options: NotificationOptions = {
    body,
    icon: "/favicon-512.png",
    badge: "/favicon-512.png",
    tag: `mess-${meal.toLowerCase()}`,
  };

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(`Mess Menu: ${meal}`, options);
      return;
    }
  } catch {
    // Fall back to the window notification API below.
  }

  new Notification(`Mess Menu: ${meal}`, options);
};

export default function MessNotificationScheduler() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const maybeSendMealNotification = async () => {
      if (Notification.permission !== "granted") {
        return;
      }

      const activeMeal = getCurrentMealSlot(new Date());
      if (!activeMeal) {
        return;
      }

      const sentKey = getSentKey(new Date(), activeMeal.meal);
      if (localStorage.getItem(storageKey) === sentKey) {
        return;
      }

      await showMealNotification(activeMeal.meal);
      localStorage.setItem(storageKey, sentKey);
    };

    void maybeSendMealNotification();
    const intervalId = window.setInterval(() => {
      void maybeSendMealNotification();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
