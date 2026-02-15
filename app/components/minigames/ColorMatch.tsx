"use client";

import { useMemo, useRef } from "react";
import { MiniGameComponentProps } from "../../types/game";

type ColorOption = {
  label: string;
  value: string;
};

const COLORS: ColorOption[] = [
  { label: "ミント", value: "#34d399" },
  { label: "コーラル", value: "#fb7185" },
  { label: "サンド", value: "#facc15" },
  { label: "インク", value: "#38bdf8" },
];

export default function ColorMatch({ onSuccess, onFailure }: MiniGameComponentProps) {
  const doneRef = useRef(false);
  const target = useMemo(
    () => COLORS[Math.floor(Math.random() * COLORS.length)],
    []
  );

  const handlePick = (option: ColorOption) => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (option.value === target.value) {
      onSuccess();
    } else {
      onFailure?.();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">
        指定された色と同じ色を選んでください。
      </p>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
        <span className="text-sm text-slate-300">指定色</span>
        <span className="h-6 w-6 rounded-full" style={{ backgroundColor: target.value }} />
        <span className="text-sm text-white">{target.label}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {COLORS.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePick(option)}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white transition hover:border-white/40"
          >
            {option.label}
            <span className="h-5 w-5 rounded-full" style={{ backgroundColor: option.value }} />
          </button>
        ))}
      </div>
    </div>
  );
}
