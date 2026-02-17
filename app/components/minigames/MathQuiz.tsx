"use client";

import { useEffect, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

const OPERATORS = ["+", "-"] as const;

export default function MathQuiz({ onSuccess, onFailure, timeLimit = 12 }: MiniGameComponentProps) {
  const doneRef = useRef(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [quiz] = useState(() => {
    const left = Math.floor(Math.random() * 90) + 10;
    const right = Math.floor(Math.random() * 90) + 10;
    const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
    if (op === "-") {
      const larger = Math.max(left, right);
      const smaller = Math.min(left, right);
      const result = larger - smaller;
      return { left: larger, right: smaller, op, result };
    }
    const result = left + right;
    return { left, right, op, result };
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        onFailure?.();
      }
    }, timeLimit * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [timeLimit, onFailure]);

  const handleSubmit = () => {
    if (doneRef.current || !quiz) return;
    
    if (answer.trim() === "") {
      setError("答えを入力してください");
      return;
    }
    
    doneRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (Number(answer) === quiz.result) {
      onSuccess();
    } else {
      onFailure?.();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">答えを入力して「同意する」を押してください。</p>
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-lg">
        {quiz.left} {quiz.op} {quiz.right} = ?
      </div>
      <input
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          setError("");
        }}
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white"
        inputMode="numeric"
        placeholder="答えを入力"
      />
      {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
      <button
        onClick={handleSubmit}
        className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
      >
        同意する
      </button>
    </div>
  );
}
