"use client";

import { MiniGameComponentProps } from "../../types/game";

export default function BasicAgree({ onSuccess }: MiniGameComponentProps) {
  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-sm text-slate-300">
        表示された「同意する」ボタンを押してください。
      </p>
      <button
        onClick={onSuccess}
        className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
      >
        同意する
      </button>
    </div>
  );
}
