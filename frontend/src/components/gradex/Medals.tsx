import React from "react";

type MedalProps = {
  grade: "O" | "A+" | "A" | "B+" | "B" | "C";
  edit: boolean;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
};

const medalStyles = {
  O: {
    text: "text-green-400",
    bg: "bg-green-400/20",
    border: "border-green-400 border",
  },
  "A+": {
    text: "text-gray-400",
    bg: "bg-gray-700",
    border: "border-gray-600 border",
  },
  A: {
    text: "text-white",
    bg: "bg-white/5",
    border: "border-white/30 border",
  },
  "B+": {
    text: "text-white",
    bg: "bg-white/5",
    border: "border-white/30 border",
  },
  B: {
    text: "text-white",
    bg: "bg-white/5",
    border: "border-white/30 border",
  },
  C: {
    text: "text-white",
    bg: "bg-white/5",
    border: "border-white/30 border border-dashed",
  },
};

const Medal: React.FC<MedalProps> = ({ grade, edit, setEdit }) => {
  const { text, bg, border } = medalStyles[grade];

  return (
    <button
      tabIndex={0}
      onClick={() => setEdit((prev) => !prev)}
      className={`group flex w-full gap-3 ${bg} ${edit ? "py-1" : "py-5"} rounded-xl ${border} items-center justify-center`}
    >
      <h3 className={`text-3xl font-bold ${text}`}>{grade}</h3>
      <span className={`text-base font-medium ${text}`}>Grade</span>
    </button>
  );
};

export default Medal;

