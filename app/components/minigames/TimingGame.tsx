"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

const SUCCESS_MIN = 45;
const SUCCESS_MAX = 55;
const READ_TIME = 15000; // 15秒（ミリ秒）

export default function TimingGame({
  onSuccess,
  onFailure,
  timeLimit = 8,
  failedAttempts = 0,
}: MiniGameComponentProps) {
  const [position, setPosition] = useState(0);
  const [isReading, setIsReading] = useState(failedAttempts === 0); // 初回（failedAttempts=0）のみ15秒待機
  const directionRef = useRef(1);
  const doneRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback((success: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
    if (success) {
      onSuccess();
    } else {
      onFailure?.();
    }
  }, [onSuccess, onFailure]);

  useEffect(() => {
    // 読む時間がある場合、その後にゲームを開始
    if (isReading) {
      readTimeoutRef.current = setTimeout(() => {
        setIsReading(false);
      }, READ_TIME);
      return () => {
        if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      };
    }

    // ゲーム開始
    intervalRef.current = setInterval(() => {
      setPosition((prev) => {
        let next = prev + directionRef.current * 2.4;
        if (next >= 100) {
          next = 100;
          directionRef.current = -1;
        }
        if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        }
        return next;
      });
    }, 30);

    timeoutRef.current = setTimeout(() => {
      finish(false);
    }, timeLimit * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeLimit, finish, isReading]);

  const handleClick = () => {
    finish(position >= SUCCESS_MIN && position <= SUCCESS_MAX);
  };

  return (
    <div className="flex flex-col gap-4">
      {isReading ? null : (
        <>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
            <span>タイミング</span>
            <span>残り {timeLimit}s</span>
          </div>
          <div className="relative h-3 rounded-full bg-slate-800">
            <div
              className="absolute inset-y-0 rounded-full bg-emerald-400/30"
              style={{ left: `${SUCCESS_MIN}%`, width: `${SUCCESS_MAX - SUCCESS_MIN}%` }}
            />
            <div
              className="absolute -top-2 h-7 w-2 rounded-full bg-emerald-300"
              style={{ left: `calc(${position}% - 4px)` }}
            />
          </div>
          <button
            onClick={handleClick}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            同意する
          </button>
        </>
      )}
    </div>
  );
}
