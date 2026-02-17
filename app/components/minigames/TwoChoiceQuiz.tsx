"use client";

import { useMemo, useRef } from "react";
import { MiniGameComponentProps } from "../../types/game";

type Choice = {
  question: string;
  left: string;
  right: string;
  correct: "left" | "right";
};

const QUESTIONS: Choice[] = [
  {
    question: "同意するを選んでください",
    left: "同意する",
    right: "同意しない",
    correct: "left",
  },
  {
    question: "規約を読むふりをしますか？",
    left: "はい",
    right: "いいえ",
    correct: "right",
  },
  {
    question: "開発者に優しいのはどっち？",
    left: "優しい",
    right: "厳しい",
    correct: "left",
  },
];

export default function TwoChoiceQuiz({ onSuccess, onFailure }: MiniGameComponentProps) {
  const doneRef = useRef(false);
  const quiz = useMemo(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)], []);

  const handleSelect = (choice: "left" | "right") => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (choice === quiz.correct) {
      onSuccess();
    } else {
      onFailure?.();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">{quiz.question}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => handleSelect("left")}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            selected === "left"
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
              : "border-white/10 bg-slate-900/60 text-white hover:border-white/40"
          }`}
        >
          {quiz.left}
        </button>
        <button
          onClick={() => handleSelect("right")}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            selected === "right"
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
              : "border-white/10 bg-slate-900/60 text-white hover:border-white/40"
          }`}
        >
          {quiz.right}
        </button>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
      >
        同意する
      </button>
    </div>
  );
}
