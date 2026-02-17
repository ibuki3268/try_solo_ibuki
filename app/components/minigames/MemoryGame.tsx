"use client";

import { useEffect, useRef, useState } from "react";
import { MiniGameComponentProps } from "../../types/game";

type Tile = {
  id: string;
  label: string;
  color: string;
};

const TILES: Tile[] = [
  { id: "emerald", label: "ミント", color: "#34d399" },
  { id: "sky", label: "スカイ", color: "#38bdf8" },
  { id: "rose", label: "ローズ", color: "#fb7185" },
  { id: "amber", label: "アンバー", color: "#f59e0b" },
];

const SEQUENCE_LENGTH = 4;

export default function MemoryGame({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [step, setStep] = useState(0);
  const [revealing, setRevealing] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sequence] = useState(() =>
    Array.from({ length: SEQUENCE_LENGTH }, () =>
      TILES[Math.floor(Math.random() * TILES.length)].id
    )
  );
  const doneRef = useRef(false);

  useEffect(() => {
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const playNext = () => {
      if (index >= sequence.length) {
        setActiveId(null);
        setRevealing(false);
        return;
      }

      setActiveId(sequence[index]);
      timeoutId = setTimeout(() => {
        setActiveId(null);
        index += 1;
        timeoutId = setTimeout(playNext, 350);
      }, 450);
    };

    timeoutId = setTimeout(playNext, 2000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sequence]);

  const handlePick = (id: string) => {
    if (doneRef.current || revealing) return;

    const expected = sequence[step];
    if (id === expected) {
      const nextStep = step + 1;
      if (nextStep >= sequence.length) {
        doneRef.current = true;
        setTimeout(onSuccess, 0);
      } else {
        setStep(nextStep);
      }
      return;
    }

    doneRef.current = true;
    setTimeout(onFailure ?? (() => {}), 0);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-300">
        {revealing
          ? "順番を覚えてください。"
          : "覚えた順にタップしてください。"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => {
          const isActive = activeId === tile.id;
          return (
            <button
              key={tile.id}
              onClick={() => handlePick(tile.id)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white transition"
              style={{
                borderColor: isActive ? tile.color : undefined,
                boxShadow: isActive ? `0 0 0 2px ${tile.color}` : undefined,
              }}
            >
              {tile.label}
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: tile.color }} />
            </button>
          );
        })}
      </div>
      <div className="text-xs text-slate-400">
        {revealing ? "観察中" : `進捗 ${step}/${sequence.length}`}
      </div>
    </div>
  );
}
