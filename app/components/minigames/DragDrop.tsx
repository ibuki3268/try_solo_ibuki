'use client';

import { useState, useEffect } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

interface DropZone {
  id: string;
  label: string;
  color: string;
  filled?: string;
}

/**
 * ドラッグ&ドロップゲーム（難易度上げ版）
 * 複数のアイテムを正しいターゲットにドラッグして配置する
 */
export default function DragDrop({ onSuccess, onFailure }: MiniGameComponentProps) {
  const items = [
    { id: 'awesome', label: '神ゲー', targetId: 'agree' },
    { id: 'agree', label: '同意', targetId: 'agree' },
    { id: 'terrible', label: 'クソゲー', targetId: 'disagree' },
    { id: 'disagree', label: '不同意', targetId: 'disagree' },
  ];

  const dropZones: DropZone[] = [
    { id: 'agree', label: '👍 同意', color: 'blue' },
    { id: 'disagree', label: '👎 不同意', color: 'red' },
  ];

  const [filledZones, setFilledZones] = useState<Record<string, string[]>>({
    agree: [],
    disagree: [],
  });

  const [isComplete, setIsComplete] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('itemId', itemId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, zoneId: string) => {
    e.preventDefault();
    
    if (isComplete) return;

    const itemId = e.dataTransfer.getData('itemId');
    const item = items.find((i) => i.id === itemId);

    if (!item) return;

    // 正しいターゲットにドロップされたか確認
    if (item.targetId === zoneId) {
      setFilledZones((prev) => {
        // 既に配置済みでないか確認
        const alreadyPlaced = Object.values(prev).some((zone) =>
          zone.includes(itemId)
        );

        if (alreadyPlaced) {
          if (onFailure) onFailure();
          return prev;
        }

        const updated = {
          ...prev,
          [zoneId]: [...prev[zoneId], itemId],
        };

        // すべてのアイテムが配置されたか確認
        const totalPlaced = Object.values(updated).reduce((sum, zone) => sum + zone.length, 0);
        if (totalPlaced === items.length) {
          setIsComplete(true);
        }

        return updated;
      });
    } else {
      // 間違ったターゲットにドロップ
      if (onFailure) onFailure();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // ドラッグ中のアイテムかを確認
  const isItemDragging = (itemId: string) => {
    return Object.values(filledZones).some((zone) => zone.includes(itemId));
  };

  // isComplete が true になったら onSuccess() を呼ぶ
  useEffect(() => {
    if (isComplete) {
      onSuccess();
    }
  }, [isComplete, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold">同意/不同意グループ分け</h2>
      <p className="text-sm text-slate-300">
        各ワードを「同意」か「不同意」に分類してください
      </p>

      {/* ドラッグ可能なアイテムリスト */}
      <div className="flex flex-wrap gap-3 justify-center">
        {items.map((item) => (
          <div
            key={item.id}
            draggable={!isItemDragging(item.id)}
            onDragStart={(e) => handleDragStart(e, item.id)}
            className={`px-4 py-2 rounded-lg font-semibold cursor-grab active:cursor-grabbing transition ${
              isItemDragging(item.id)
                ? 'opacity-30 cursor-not-allowed bg-slate-500'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* ドロップゾーン */}
      <div className="flex gap-6 justify-center flex-wrap">
        {dropZones.map((zone) => (
          <div
            key={zone.id}
            onDrop={(e) => handleDrop(e, zone.id)}
            onDragOver={handleDragOver}
            className={`w-48 h-40 border-4 rounded-lg flex flex-col items-center justify-center p-4 transition ${
              filledZones[zone.id].length === items.filter((i) => i.targetId === zone.id).length
                ? zone.id === 'agree'
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-red-400 bg-red-500/10'
                : zone.id === 'agree'
                ? 'border-blue-600 bg-blue-900/20 hover:border-blue-400'
                : 'border-red-600 bg-red-900/20 hover:border-red-400'
            }`}
          >
            <div className="text-2xl mb-2">{zone.label}</div>
            {filledZones[zone.id].length > 0 && (
              <div className="text-sm text-slate-300">
                ({filledZones[zone.id].length} / {items.filter((i) => i.targetId === zone.id).length})
              </div>
            )}
            {filledZones[zone.id].map((itemId) => (
              <div key={itemId} className="text-xs text-slate-400 mt-1">
                ✓ {items.find((i) => i.id === itemId)?.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}