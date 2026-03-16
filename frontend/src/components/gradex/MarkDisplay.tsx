import React from "react";

interface Marks {
  scored?: string;
  total: string;
}

export function MarkDisplay({ marks }: { marks: Marks }) {
  const scored = marks.scored;
  return (
    <div
      className={`${
        Number(scored) === Number(marks.total) && !scored
          ? "border-green-400"
          : Number(scored) < Number(marks.total) / 2 && !scored
            ? "border-red-400 border-dashed"
            : "border-transparent"
      } flex items-center gap-1 rounded-full border bg-white/5`}
    >
      <span
        className={`px-2 pr-1 text-sm font-medium ${
          scored == "Abs" || Number(scored) < Number(marks.total) / 2
            ? "text-red-400"
            : Number(scored) === Number(marks.total)
              ? "text-green-400"
              : "text-white"
        }`}
      >
        {scored}
      </span>
      <span
        className={`${
          scored
            ? "bg-green-400/20 text-green-400"
            : "bg-white/10 text-white/80"
        } rounded-full px-2 py-0.5 text-sm font-bold opacity-80`}
      >
        {scored ? marks.total.split(".")[0] : marks.total}
      </span>
    </div>
  );
}

