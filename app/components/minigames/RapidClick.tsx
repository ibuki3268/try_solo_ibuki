"use client";

import { useEffect, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

const TARGET_CLICKS = 12;

export default function RapidClick({
  onSuccess,
  onFailure,
  timeLimit = 6,
}: MiniGameComponentProps) {
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const doneRef = useRef(false);
  const countRef = useRef(0);

  const finish = (success: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const callback = success ? onSuccess : onFailure ?? (() => {});
    setTimeout(callback, 0);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finish(countRef.current >= TARGET_CLICKS);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    if (doneRef.current) return;
    setCount((prev) => {
      const next = prev + 1;
      countRef.current = next;
      if (next >= TARGET_CLICKS) {
        finish(true);
      }
      return next;
    });
  };

  const progress = Math.min((count / TARGET_CLICKS) * 100, 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
        <span>連打 {count}/{TARGET_CLICKS}</span>
        <span>残り {timeLeft}s</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-400 transition-[width]" style={{ width: `${progress}%` }} />
      </div>
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
      >
        同意する
      </button>
    </div>
  );
}
