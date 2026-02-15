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
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white transition hover:border-white/40"
        >
          {quiz.left}
        </button>
        <button
          onClick={() => handleSelect("right")}
          className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white transition hover:border-white/40"
        >
          {quiz.right}
        </button>
      </div>
    </div>
  );
}
