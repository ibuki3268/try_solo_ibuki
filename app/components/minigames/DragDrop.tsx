'use client';

import { useState } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

/**
 * ドラッグ&ドロップゲーム
 * 要素を正しい位置にドラッグして配置する
 */
export default function DragDrop({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text');
    if (data === 'correct') {
      setIsCompleted(true);
      onSuccess();
    } else {
      if (onFailure) {
        onFailure();
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold">ドラッグ&ドロップゲーム</h2>
      <p className="text-sm text-gray-400">正しいアイテムをターゲットにドラッグしてください。</p>

      <div className="flex gap-4">
        <div
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text', 'correct')}
          className="w-20 h-20 bg-blue-500 text-white flex items-center justify-center cursor-grab"
        >
          正解
        </div>
        <div
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text', 'wrong')}
          className="w-20 h-20 bg-red-500 text-white flex items-center justify-center cursor-grab"
        >
          不正解
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`w-40 h-40 border-4 ${isCompleted ? 'border-green-500' : 'border-gray-500'} flex items-center justify-center`}
      >
        {isCompleted ? '成功！' : 'ここにドロップ'}
      </div>
    </div>
  );
}