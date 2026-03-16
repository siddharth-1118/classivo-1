import {
    Home,
    CalendarCheck,
    Clock,
    GraduationCap,
    X,
    Bolt,
    Utensils,
    LucideIcon,
} from "lucide-react";

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

export const navItems: NavItem[] = [
    { name: "Home", href: "/app/dashboard", icon: Home },
    { name: "Attend", href: "/app/attendance", icon: CalendarCheck },
    { name: "Timetable", href: "/app/timetable", icon: Clock },
];

export const allPages: NavItem[] = [
    { name: "Dashboard", href: "/app/dashboard", icon: Home },
    { name: "Attendance", href: "/app/attendance", icon: CalendarCheck },
    { name: "Timetable", href: "/app/timetable", icon: Clock },
    { name: "Marks", href: "/app/marks", icon: GraduationCap },
    { name: "Calendar", href: "/app/calendar", icon: CalendarCheck },
    { name: "GradeX", href: "/app/gradex", icon: X },
    { name: "Mess Menu", href: "/app/messmenu", icon: Utensils },
    { name: "Settings", href: "/app/settings", icon: Bolt },
];

export const getPageIndex = (pathname: string): number => {
    return allPages.findIndex((page) => {
        if (page.href === pathname) return true;
        if (pathname.startsWith(page.href + "/")) return true;
        return false;
    });
};
