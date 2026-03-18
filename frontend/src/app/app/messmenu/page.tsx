"use client";

import React, { useEffect, useState, useRef } from "react";
import menuData from "../../../../public/mess_menu.json";
import { ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import MessMenuCarousel, {
  MessMenuCarouselItem,
  CarouselHandle,
} from "../../../components/MessMenuCarousel";

type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";
type DayType = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
interface DayMenu { Breakfast: string[]; Lunch: string[]; Snacks: string[]; Dinner: string[]; }
interface MenuData { [key: string]: DayMenu; }

const days: DayType[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const mealOrder: MealType[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export default function MessMenuPage() {
  const [carouselItems, setCarouselItems] = useState<MessMenuCarouselItem[]>([]);
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const carouselRef = useRef<CarouselHandle>(null);

  useEffect(() => {
    const items: MessMenuCarouselItem[] = [];
    const data = menuData as MenuData;
    let idCounter = 0;

    days.forEach((day) => {
      mealOrder.forEach((meal) => {
        if (data[day] && data[day][meal]) {
          items.push({ id: idCounter++, day, meal, items: data[day][meal] });
        }
      });
    });

    setCarouselItems(items);

    const now = new Date();
    const dayIndex = now.getDay();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    let targetMeal: MealType = "Breakfast";
    let targetDayIndex = dayIndex;

    if (totalMinutes > 22 * 60 + 30) {
      targetMeal = "Breakfast";
      targetDayIndex = (dayIndex + 1) % 7;
    } else if (totalMinutes <= 9 * 60 + 30) {
      targetMeal = "Breakfast";
    } else if (totalMinutes <= 14 * 60 + 30) {
      targetMeal = "Lunch";
    } else if (totalMinutes <= 18 * 60) {
      targetMeal = "Snacks";
    } else {
      targetMeal = "Dinner";
    }

    const targetDayName = days[targetDayIndex];
    const foundIndex = items.findIndex((item) => item.day === targetDayName && item.meal === targetMeal);
    const startIdx = foundIndex >= 0 ? foundIndex : 0;
    setInitialIndex(startIdx);
    setCurrentIndex(startIdx);
    setIsLoaded(true);

    const updateTime = () => {
      const t = new Date();
      setCurrentTimeStr(t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentItem = carouselItems[currentIndex] || carouselItems[0];
  if (!isLoaded) return <div className="flex h-screen w-full items-center justify-center text-white bg-black"><span>Loading menu...</span></div>;
  if (!currentItem) return null;

  return (
    <main className="min-h-screen w-full text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-4 pb-20 sm:px-6">
        <header className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-premium-gold">
            <Sparkles size={12} />
            Mess Menu
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Mess Menu Overview</h1>
          <p className="mt-2 text-sm leading-7 text-zinc-300">
            Browse breakfast, lunch, snacks, and dinner in the same premium glassmorphism interface.
          </p>
        </header>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-center gap-6 select-none relative">
            <button onClick={() => carouselRef.current?.prev()} className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Previous">
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl leading-tight text-white">{currentItem.day}</h2>
              <h3 className="text-lg font-semibold text-zinc-300">{currentItem.meal}</h3>
            </div>

            <button onClick={() => carouselRef.current?.next()} className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Next">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <p className="mb-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Clock size={14} />
            Current time: {currentTimeStr}
          </p>

          <div className="flex w-full items-center justify-center">
            <MessMenuCarousel
              ref={carouselRef}
              items={carouselItems}
              initialIndex={initialIndex}
              loop={true}
              baseWidth={320}
              onIndexChange={setCurrentIndex}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
