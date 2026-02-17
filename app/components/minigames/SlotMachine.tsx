'use client';

import { useState, useEffect, useRef } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

/**
 * スロットマシンゲーム
 * 目押しで3つの絵柄を揃える
 */
export default function SlotMachine({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [slots, setSlots] = useState(["🍒", "🍋", "🍊"]);
  const [isSpinning, setIsSpinning] = useState([false, false, false]);
  const [result, setResult] = useState<string | null>(null);

  const symbols = ["🍒", "🍋", "🍊", "⭐", "🍇"];

  // refs: ここで一度だけ宣言
  const intervalsRef = useRef<(number | NodeJS.Timeout)[]>([]);
  const latestSlotsRef = useRef(slots);
  const hasSpunRef = useRef(false);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopSlot = (index: number) => {
    const id = intervalsRef.current[index];
    if (id) clearInterval(id as NodeJS.Timeout | number);
    delete intervalsRef.current[index];

    setIsSpinning((prev) => {
      const newSpinning = [...prev];
      newSpinning[index] = false;

      // Check against newSpinning, not pre-update state
      if (newSpinning.every((s) => !s)) {
        // All stopped - clear the timeout
        if (resultTimeoutRef.current) {
          clearTimeout(resultTimeoutRef.current);
          resultTimeoutRef.current = null;
        }
      }

      return newSpinning;
    });
  };

  const spinSlots = () => {
    if (isSpinning.some((s) => s)) return; // 既に回転中なら無視

    setResult(null);
    setIsSpinning([true, true, true]);

    // Clear any existing timeout from previous spin
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }

    // 既存インターバルをクリア
    intervalsRef.current.forEach((id) => clearInterval(id as NodeJS.Timeout | number));
    intervalsRef.current = [];

    [0, 1, 2].forEach((index) => {
      const intervalId = setInterval(() => {
        setSlots((prev) => {
          const next = [...prev];
          next[index] = getRandomSymbol();
          latestSlotsRef.current = next;
          return next;
        });
      }, 300);
      intervalsRef.current.push(intervalId as NodeJS.Timeout | number);
    });
    
    // タイムアウトは削除 - 手動停止のみで結果判定
    hasSpunRef.current = true;
  };

  // isSpinning状態を監視して、全停止時に結果判定を実行
  useEffect(() => {
    if (!hasSpunRef.current) return; // 初回レンダリングは無視

    const allStopped = isSpinning.every((s) => !s);
    if (allStopped) {
      // 全スロット停止 - 結果判定を実行
      resultTimeoutRef.current = setTimeout(() => {
        const finalSlots = latestSlotsRef.current;
        if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
          setResult('win');
          onSuccess();
        } else {
          setResult('lose');
          onFailure?.();
        }
      }, 100);
    }

    return () => {
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, [isSpinning, onSuccess, onFailure]);

  useEffect(() => {
    return () => {
      // defensive cleanup
      if (intervalsRef && intervalsRef.current) {
        intervalsRef.current.forEach((id) => { if (id) clearInterval(id as NodeJS.Timeout | number); });
      }
    };
  }, []);

  const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold">スロットマシン</h2>
      <p className="text-sm text-gray-400">目押しで3つの絵柄を揃えてください！</p>

      <div className="flex gap-4 text-4xl">
        {slots.map((slot, i) => (
          <div key={i} className="w-16 h-16 flex items-center justify-center border-2 border-gray-500 bg-gray-800 text-white">
            {slot}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {isSpinning.map((s, i) => (
          <button key={i} onClick={() => stopSlot(i)} disabled={!s} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-500">
            {s ? `ストップ ${i + 1}` : '停止中'}
          </button>
        ))}
      </div>

      <button onClick={spinSlots} disabled={isSpinning.some((s) => s)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed">スロット回転</button>

      {result && (
        <div className={`text-xl font-bold mt-4 ${result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
          {result === 'win' ? 'おめでとう！揃いました！' : '残念！もう一度挑戦！'}
        </div>
      )}
    </div>
  );
}
