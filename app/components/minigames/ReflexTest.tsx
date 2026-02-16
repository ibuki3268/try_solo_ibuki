"use client";

import { useEffect, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1800;
const REACTION_LIMIT_MS = 450;

export default function ReflexTest({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [status, setStatus] = useState<"waiting" | "ready" | "fail">("waiting");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)) + MIN_DELAY_MS;
    timeoutRef.current = setTimeout(() => {
      setStatus("ready");
      timeoutRef.current = setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          onFailure?.();
        }
      }, REACTION_LIMIT_MS);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onFailure]);

  const handleClick = () => {
    if (doneRef.current) return;
    if (status === "waiting") {
      doneRef.current = true;
      setStatus("fail");
      onFailure?.();
      return;
    }
    if (status === "ready") {
      doneRef.current = true;
      onSuccess();
    }
  };

  const label =
    status === "waiting"
      ? "光るまで待って"
      : status === "ready"
        ? "今だ！"
        : "早すぎ！";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">合図が出たらすぐに「同意する」を押してください。</p>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
          status === "ready"
            ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            : status === "fail"
              ? "bg-rose-400 text-rose-950"
              : "bg-slate-100 text-slate-700"
        }`}
      >
        同意する
      </button>
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</div>
    </div>
  );
}
