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

  const stopSlot = (index: number) => {
    const id = intervalsRef.current[index];
    if (id) clearInterval(id as any);
    delete intervalsRef.current[index];

    setIsSpinning((prev) => {
      const next = [...prev];
      next[index] = false;
      
      // 全スロット停止したか確認（state更新後の値でチェック）
      if (next.every((s) => !s)) {
        // 全停止したので結果判定
        setTimeout(() => {
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
      
      return next;
    });
  };

  const spinSlots = () => {
    if (isSpinning.some((s) => s)) return; // 既に回転中なら無視

    setResult(null);
    setIsSpinning([true, true, true]);

    // 既存インターバルをクリア
    intervalsRef.current.forEach((id) => clearInterval(id as any));
    intervalsRef.current = [] as any;

    [0, 1, 2].forEach((index) => {
      const intervalId = setInterval(() => {
        setSlots((prev) => {
          const next = [...prev];
          next[index] = getRandomSymbol();
          latestSlotsRef.current = next;
          return next;
        });
      }, 300);
      intervalsRef.current.push(intervalId as any);
    });
    
    // タイムアウトは削除 - 手動停止のみで結果判定
  };

  useEffect(() => {
    return () => {
      // defensive cleanup
      if (intervalsRef && intervalsRef.current) {
        intervalsRef.current.forEach((id) => { if (id) clearInterval(id as any); });
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

      <button onClick={spinSlots} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">スロット回転</button>

      {result && (
        <div className={`text-xl font-bold mt-4 ${result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
          {result === 'win' ? 'おめでとう！揃いました！' : '残念！もう一度挑戦！'}
        </div>
      )}
    </div>
  );
}
