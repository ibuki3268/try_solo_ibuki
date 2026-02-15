"use client";

import { useEffect, useRef } from "react";
import { MiniGameComponentProps } from "../../types/game";

const HOLD_MS = 3000;

export default function LongPress({ onSuccess, onFailure }: MiniGameComponentProps) {
  const doneRef = useRef(false);
  const pressedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = (success: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    pressedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (success) {
      onSuccess();
    } else {
      onFailure?.();
    }
  };

  const handlePressStart = () => {
    if (doneRef.current) return;
    pressedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      finish(true);
    }, HOLD_MS);
  };

  const handlePressEnd = () => {
    if (doneRef.current || !pressedRef.current) return;
    pressedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    finish(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">「同意する」を3秒以上長押ししてください。</p>
      <button
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onPointerCancel={handlePressEnd}
        className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
      >
        同意する
      </button>
    </div>
  );
}
