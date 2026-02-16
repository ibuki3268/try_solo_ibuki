'use client';

import { useState, useEffect } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

/**
 * スロットマシンゲーム
 * 目押しで3つの絵柄を揃える
 */
export default function SlotMachine({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [slots, setSlots] = useState(["🍒", "🍋", "🍊"]);
  const [isSpinning, setIsSpinning] = useState([true, true, true]);
  const [result, setResult] = useState<string | null>(null);

  const symbols = ["🍒", "🍋", "🍊", "⭐", "🍇"];

  const stopSlot = (index: number) => {
    setIsSpinning((prev) => {
      const newSpinning = [...prev];
      newSpinning[index] = false;
      return newSpinning;
    });
  };

  const spinSlots = () => {
    setIsSpinning([true, true, true]); // 各スロットを回転状態に設定

    const intervals = isSpinning.map((spinning, index) => {
      if (spinning) {
        return setInterval(() => {
          setSlots((prev) => {
            const newSlots = [...prev];
            newSlots[index] = getRandomSymbol();
            return newSlots;
          });
        }, 300); // スロットの回転速度を遅くする
      }
      return null;
    });

    setTimeout(() => {
      intervals.forEach((interval) => {
        if (interval) clearInterval(interval);
      });

      setIsSpinning([false, false, false]); // 全スロットを停止状態に設定

      if (slots[0] === slots[1] && slots[1] === slots[2]) {
        setResult("win");
        onSuccess();
      } else {
        setResult("lose");
        onFailure?.();
      }
    }, 3000);
  };

  useEffect(() => {
    const intervals = isSpinning.map((spinning, index) => {
      if (spinning) {
        return setInterval(() => {
          setSlots((prev) => {
            const newSlots = [...prev];
            newSlots[index] = getRandomSymbol();
            return newSlots;
          });
        }, 300);
      }
      return null;
    });

    return () => {
      intervals.forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [isSpinning]);

  useEffect(() => {
    if (isSpinning.every((spinning) => !spinning)) {
      if (slots[0] === slots[1] && slots[1] === slots[2]) {
        setResult("win");
        onSuccess();
      } else {
        setResult("lose");
        onFailure?.();
      }
    }
  }, [isSpinning]);

  const getRandomSymbol = () => {
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold">スロットマシン</h2>
      <p className="text-sm text-gray-400">目押しで3つの絵柄を揃えてください！</p>

      <div className="flex gap-4 text-4xl">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="w-16 h-16 flex items-center justify-center border-2 border-gray-500 bg-gray-800 text-white"
          >
            {slot}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {isSpinning.map((spinning, index) => (
          <button
            key={index}
            onClick={() => stopSlot(index)}
            disabled={!spinning}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-500"
          >
            {spinning ? `ストップ ${index + 1}` : "停止中"}
          </button>
        ))}
      </div>

      <button
        onClick={spinSlots}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        スロット回転
      </button>

      {result && (
        <div
          className={`text-xl font-bold mt-4 ${
            result === "win" ? "text-green-500" : "text-red-500"
          }`}
        >
          {result === "win" ? "おめでとう！揃いました！" : "残念！もう一度挑戦！"}
        </div>
      )}
    </div>
  );
}