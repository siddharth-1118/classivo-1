"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { MarkDetail } from "srm-academia-api";
import { Card } from "@/app/components/ui/Card";
import { formatNumber } from "@/utils/number";
import { useCourse } from "@/hooks/query";

interface TotalMarksCardProps {
    marks?: MarkDetail[];
    className?: string; // Allow passing extra classes for layout
}

export const TotalMarksCard = ({ marks = [], className = "" }: TotalMarksCardProps) => {
    const { data: courses } = useCourse();
    const [isExpanded, setIsExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate totals
    const totalMarks = marks.reduce((acc, curr) => acc + Number(curr.total?.obtained || 0), 0);
    const maxMarks = marks.reduce((acc, curr) => acc + Number(curr.total?.maxMark || 0), 0);

    // Prepare chart data
    const chartData = React.useMemo(() => {
        const baseData = marks.map(m => {
            const obtained = m.total?.obtained || 0;
            const max = m.total?.maxMark || 100;

            // Resolve proper subject name using course code
            const courseDetail = courses?.find(c => c.courseCode === m.course);
            // Default to code if title not found, otherwise use title
            const fullName = courseDetail?.courseTitle || m.course;

            // Extract the first word
            const label = fullName.split(" ")[0];

            return {
                label,
                category: m.category,
                fullSubject: fullName,
                obtained: obtained,
                max: max,
                percentage: max > 0 ? (obtained / max) * 100 : 0
            };
        }).filter(d => {
            const isLab = d.category?.toLowerCase() === 'practical' ||
                d.category?.toLowerCase() === 'lab' ||
                d.fullSubject.toLowerCase().includes('lab');
            return d.max > 0 && !isLab;
        });

        // Ensure unique labels for the chart
        const usedLabels = new Set<string>();
        return baseData.map(d => {
            let uniqueLabel = d.label;

            // If label is already taken, try to make it unique
            if (usedLabels.has(uniqueLabel)) {
                // Try appending (Lab) if it's a practical course
                const isLab = d.category?.toLowerCase() === 'practical' ||
                    d.category?.toLowerCase() === 'lab' ||
                    d.fullSubject.toLowerCase().includes('lab');

                if (isLab && !usedLabels.has(`${uniqueLabel} (Lab)`)) {
                    uniqueLabel = `${uniqueLabel} (Lab)`;
                } else {
                    // Fallback to numbering
                    let counter = 2;
                    while (usedLabels.has(`${uniqueLabel} ${counter}`)) {
                        counter++;
                    }
                    uniqueLabel = `${uniqueLabel} ${counter}`;
                }
            }

            usedLabels.add(uniqueLabel);

            return {
                ...d,
                subject: uniqueLabel
            };
        });
    }, [marks, courses]);

    const handleExpand = () => setIsExpanded(true);
    const handleCollapse = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <>
            <motion.div
                className={`relative cursor-pointer ${className}`}
                onClick={handleExpand}
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.95 }}
            >
                <Card className="h-full relative overflow-hidden group bg-[#121315] border-white/5 backdrop-blur-md transition-all hover:border-white/10">
                    <div className="p-5 sm:p-6 h-full flex flex-col justify-between">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[#8A8F98] text-[11px] font-medium uppercase tracking-[0.1em]">Performance</h3>
                            </div>
                            <div className="mt-8">
                                <div className="flex items-baseline gap-1.5 mb-2">
                                    <span className="text-3xl sm:text-4xl font-medium text-[#EDEDED] tracking-tight font-display">{formatNumber(totalMarks, 1)}</span>
                                    <span className="text-sm text-[#8A8F98]">/ {formatNumber(maxMarks, 0)}</span>
                                </div>

                                <div className="w-full bg-zinc-800/30 rounded-full h-1 overflow-hidden">
                                    <div
                                        className="bg-white/50 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        style={{ width: `${maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {mounted && createPortal(
                <AnimatePresence>
                    {isExpanded && (
                        <div className="fixed inset-0 z-[50] flex items-center justify-center px-4 font-sans pointer-events-auto">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-lg"
                                onClick={handleCollapse}
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-zinc-700/30 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl z-[51]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 bg-zinc-700/30">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight">Performance Analysis</h2>
                                            <p className="text-zinc-400 text-sm">Subject-wise breakdown</p>
                                        </div>
                                        <button
                                            onClick={handleCollapse}
                                            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="h-[330px] w-full bg-zinc-700/30 rounded-xl flex items-center justify-center relative">
                                        {chartData.length > 2 ? (
                                            <RadarChart
                                                height={300}
                                                series={[{
                                                    data: chartData.map(d => d.percentage),
                                                    color: '#10b9819a',
                                                    // @ts-ignore - MUI X Charts type definition for 'area' might be missing in some versions but works in runtime
                                                    fillArea: true,
                                                    valueFormatter: (v) => `${v?.toFixed(1)}%`
                                                }]}
                                                radar={{
                                                    metrics: chartData.map(d => ({
                                                        name: d.subject,
                                                        max: 100
                                                    })),
                                                }}
                                                sx={{
                                                    ".MuiChartsAxis-line": { stroke: "#f5f5f5ff" }, // Reverted to neutral grey for theme consistency
                                                    ".MuiChartsAxis-tick": { stroke: "#9c9c9cff" }, // Reverted to neutral grey for theme consistency
                                                    "& .MuiChartsRadar-mark": { display: 'none' },
                                                    "& text": { fill: "#a1a1aa !important", fontSize: "12px !important" } // Increased font size visibility
                                                }}
                                                // Increased margins to fix clipping of top/bottom labels
                                                margin={{ top: 50, bottom: 50, left: 0, right: 0 }}
                                            />
                                        ) : (
                                            <div className="text-zinc-500 text-sm">Need at least 3 subjects for radar chart</div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-between items-center text-sm font-medium border-t border-zinc-800 pt-4">
                                        <span className="text-zinc-400">Total Score</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl text-white font-display">{formatNumber(totalMarks, 1)}</span>
                                            <span className="text-zinc-600">/ {formatNumber(maxMarks, 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};
