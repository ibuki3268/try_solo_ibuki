"use client";

import { useMemo, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

const ATTEMPTS_BEFORE_SUCCESS = 5;
const MOVE_COOLDOWN_MS = 120;

export default function EscapeButton({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [attempts, setAttempts] = useState(0);
  const doneRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMoveRef = useRef(0);

  const moveButton = () => {
    const container = containerRef.current;
    if (!container) return;

    const maxX = Math.max(container.clientWidth - 140, 0);
    const maxY = Math.max(container.clientHeight - 48, 0);
    const nextX = Math.random() * maxX;
    const nextY = Math.random() * maxY;

    container.style.setProperty("--escape-x", `${nextX}px`);
    container.style.setProperty("--escape-y", `${nextY}px`);
  };

  const handleHover = () => {
    if (doneRef.current || attempts >= ATTEMPTS_BEFORE_SUCCESS) return;
    setAttempts((prev) => {
      const next = prev + 1;
      if (next < ATTEMPTS_BEFORE_SUCCESS) {
        moveButton();
      }
      return next;
    });
  };

  const handleChase = () => {
    if (doneRef.current || attempts >= ATTEMPTS_BEFORE_SUCCESS) return;
    const now = Date.now();
    if (now - lastMoveRef.current < MOVE_COOLDOWN_MS) return;
    lastMoveRef.current = now;
    moveButton();
  };

  const handleClick = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (attempts >= ATTEMPTS_BEFORE_SUCCESS) {
      setTimeout(onSuccess, 0);
    } else {
      setTimeout(onFailure ?? (() => {}), 0);
    }
  };

  const hint = useMemo(() => {
    if (attempts === 0) return "近づいただけではダメ。";
    if (attempts === 1) return "あと少しで逃げ疲れそう…";
    return "最後のチャンス。";
  }, [attempts]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">逃げ回る「同意する」に近づいてください。</p>
      <div
        ref={containerRef}
        onMouseMove={handleChase}
        className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60"
        style={{
          // Default to centered position.
          ["--escape-x" as string]: "50%",
          ["--escape-y" as string]: "50%",
        }}
      >
        <button
          onMouseEnter={handleHover}
          onFocus={handleHover}
          onClick={handleClick}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 transition"
          style={{
            left: "var(--escape-x)",
            top: "var(--escape-y)",
          }}
        >
          同意する
        </button>
      </div>
      <div className="text-xs text-slate-400">{hint}</div>
    </div>
  );
}
