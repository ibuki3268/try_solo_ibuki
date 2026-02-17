"use client";

import { useEffect, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1800;
const REACTION_LIMIT_MS = 450;
const READ_TIME = 15000; // 15秒（ミリ秒）

export default function ReflexTest({
  onSuccess,
  onFailure,
  failedAttempts = 0,
}: MiniGameComponentProps) {
  const [status, setStatus] = useState<"waiting" | "ready" | "fail" | "reading">(
    failedAttempts === 0 ? "reading" : "waiting"
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    // 初回のみ15秒の読む時間を設ける
    if (status === "reading") {
      readTimeoutRef.current = setTimeout(() => {
        setStatus("waiting");
      }, READ_TIME);
      return () => {
        if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      };
    }

    // waiting状態でゲーム開始
    if (status === "waiting") {
      const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)) + MIN_DELAY_MS;
      timeoutRef.current = setTimeout(() => {
        setStatus("ready");
      }, delay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status]);

  // ready状態で反応時間制限を管理
  useEffect(() => {
    if (status === "ready") {
      reactionTimeoutRef.current = setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          onFailure?.();
        }
      }, REACTION_LIMIT_MS);
    }

    return () => {
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    };
  }, [status, onFailure]);

  const handleClick = () => {
    if (doneRef.current) return;
    if (status === "waiting" || status === "reading") {
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
    status === "reading"
      ? "準備中..."
      : status === "waiting"
        ? "光るまで待って"
        : status === "ready"
          ? "今だ！"
          : "早すぎ！";

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">合図が出たらすぐに「同意する」を押してください。</p>
      <button
        onClick={handleClick}
        disabled={status === "reading"}
        className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
          status === "ready"
            ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            : status === "fail"
              ? "bg-rose-400 text-rose-950"
              : status === "reading"
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-700"
        }`}
      >
        同意する
      </button>
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</div>
    </div>
  );
}
