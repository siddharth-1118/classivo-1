"use client";

import React, { useEffect, useState, useRef } from "react";
import menuData from "../../../../public/mess_menu.json";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import MessMenuCarousel, {
    MessMenuCarouselItem,
    CarouselHandle,
} from "../../../components/MessMenuCarousel";

type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";
type DayType =
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";

interface DayMenu {
    Breakfast: string[];
    Lunch: string[];
    Snacks: string[];
    Dinner: string[];
}

interface MenuData {
    [key: string]: DayMenu;
}

const days: DayType[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
const mealOrder: MealType[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];

export default function MessMenuPage() {
    const [carouselItems, setCarouselItems] = useState<MessMenuCarouselItem[]>([]);
    const [initialIndex, setInitialIndex] = useState<number>(0);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

    const carouselRef = useRef<CarouselHandle>(null);

    useEffect(() => {
        // 1. Flatten Data
        const items: MessMenuCarouselItem[] = [];
        const data = menuData as MenuData;
        let idCounter = 0;

        days.forEach((day) => {
            mealOrder.forEach((meal) => {
                if (data[day] && data[day][meal]) {
                    items.push({
                        id: idCounter++,
                        day: day,
                        meal: meal,
                        items: data[day][meal],
                    });
                }
            });
        });

        setCarouselItems(items);

        // 2. Calculate Initial Index
        const now = new Date();
        const dayIndex = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        let targetMeal: MealType = "Breakfast";
        let targetDayIndex = dayIndex;

        const M9_30 = 9 * 60 + 30;
        const M14_30 = 14 * 60 + 30;
        const M18_00 = 18 * 60;
        const M22_30 = 22 * 60 + 30;

        if (totalMinutes > M22_30) {
            targetMeal = "Breakfast";
            targetDayIndex = (dayIndex + 1) % 7;
        } else if (totalMinutes <= M9_30) {
            targetMeal = "Breakfast";
        } else if (totalMinutes <= M14_30) {
            targetMeal = "Lunch";
        } else if (totalMinutes <= M18_00) {
            targetMeal = "Snacks";
        } else {
            targetMeal = "Dinner";
        }

        const targetDayName = days[targetDayIndex];
        const foundIndex = items.findIndex(
            (item) => item.day === targetDayName && item.meal === targetMeal
        );

        const startIdx = foundIndex >= 0 ? foundIndex : 0;
        setInitialIndex(startIdx);
        setCurrentIndex(startIdx); // Sync initial state
        setIsLoaded(true);

        const updateTime = () => {
            const t = new Date();
            setCurrentTimeStr(
                t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            );
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleIndexChange = (index: number) => {
        setCurrentIndex(index);
    };

    const handlePrev = () => {
        carouselRef.current?.prev();
    };

    const handleNext = () => {
        carouselRef.current?.next();
    };

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center text-white bg-black">
                Loading menu...
            </div>
        );
    }

    // Get current item details from state
    const currentItem = carouselItems[currentIndex] || carouselItems[0];
    // Safe check if items are empty
    if (!currentItem) return null;

    return (
        <div className="flex flex-col items-center justify-start min-h-screen w-full text-white pt-8 pb-20">

            {/* Header Section */}
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Mess Menu</h1>

            {/* Navigation & Title */}
            <div className="flex items-center justify-center w-full max-w-sm mb-2 select-none relative">

                <button
                    onClick={handlePrev}
                    className="absolute left-0 p-3 text-white/70 hover:text-white transition-colors active:scale-95 z-20"
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>

                <div className="flex flex-col items-center justify-center text-center mx-10 z-10 w-full">
                    <h2 className="text-2xl leading-tight">{currentItem.day}</h2>
                    <h3 className="text-xl font-semibold text-white/90">{currentItem.meal}</h3>
                </div>

                <button
                    onClick={handleNext}
                    className="absolute right-0 p-3 text-white/70 hover:text-white transition-colors active:scale-95 z-20"
                    aria-label="Next"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            {/* Time Display */}
            <p className="text-xs font-mono text-white/60 mb-2 flex items-center gap-2">
                Current time: {currentTimeStr}
            </p>

            {/* Carousel Card */}
            <div className="flex-1 w-full max-w-md flex items-center justify-center">
                <MessMenuCarousel
                    ref={carouselRef}
                    items={carouselItems}
                    initialIndex={initialIndex}
                    loop={true}
                    baseWidth={320}
                    onIndexChange={handleIndexChange}
                />
            </div>
        </div>
    );
}
