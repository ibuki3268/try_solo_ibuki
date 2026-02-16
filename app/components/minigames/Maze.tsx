'use client';

import { useState, useEffect } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

/**
 * 迷路ゲーム
 * キーボードでキャラクターをゴールまで移動させる
 */
export default function Maze({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const goalPosition = { x: 9, y: 9 };

  const maze = [
    [0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  ];

  const handleKeyDown = (e: KeyboardEvent) => {
    setPlayerPosition((prev) => {
      const newPosition = { ...prev };
      if (e.key === 'ArrowUp') newPosition.y -= 1;
      if (e.key === 'ArrowDown') newPosition.y += 1;
      if (e.key === 'ArrowLeft') newPosition.x -= 1;
      if (e.key === 'ArrowRight') newPosition.x += 1;

      console.log(`Key pressed: ${e.key}, New Position:`, newPosition);

      // 境界チェック
      if (
        newPosition.x < 0 ||
        newPosition.y < 0 ||
        newPosition.x >= maze[0].length ||
        newPosition.y >= maze.length ||
        maze[newPosition.y][newPosition.x] === 1
      ) {
        console.log('Invalid move');
        return prev; // 無効な移動は無視
      }

      return newPosition;
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (
      playerPosition.x === goalPosition.x &&
      playerPosition.y === goalPosition.y
    ) {
      onSuccess();
    }
  }, [playerPosition, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold">迷路ゲーム</h2>
      <p className="text-sm text-gray-400">矢印キーでキャラクターをゴールまで移動させてください。</p>

      <div className="grid grid-cols-10 gap-1">
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-10 h-10 flex items-center justify-center border
                ${playerPosition.x === x && playerPosition.y === y ? 'bg-gray-300 text-black font-bold animate-bounce' : ''}
                ${cell === 1 ? 'bg-blue-500' : 'bg-gray-700'}`}
            >
              {playerPosition.x === x && playerPosition.y === y ? '🟢' : ''}
              {goalPosition.x === x && goalPosition.y === y && '🏁'}
            </div>
          ))
        )}
      </div>
    </div>
  );
}