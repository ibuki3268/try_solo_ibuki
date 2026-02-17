'use client';

import { useState, useEffect } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

interface Tile {
  id: number;
  value: number | null;
  position: number;
}

/**
 * スライドパズル
 * 数字を順番に揃える 15パズル風
 */
export default function SlidePuzzle({ onSuccess, onFailure }: MiniGameComponentProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const GRID_SIZE = 4; // 4x4 = 16マス
  const EMPTY_TILE_ID = 99;

  // パズルを初期化
  useEffect(() => {
    const initPuzzle = () => {
      let isSolvable = false;

      while (!isSolvable) {
        // 1-15 + 空白(null)
        let initialTiles: Tile[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
          id: i,
          value: i === GRID_SIZE * GRID_SIZE - 1 ? null : i + 1,
          position: i,
        }));

        // シャッフル（後戻りを防ぎながら50回スワップ）
        let emptyIndex = GRID_SIZE * GRID_SIZE - 1;
        let previousEmptyIndex = -1;

        for (let i = 0; i < 50; i++) {
          let validMoves = getValidMoves(emptyIndex);
          // 前の位置に戻らないようにフィルタリング
          validMoves = validMoves.filter((move) => move !== previousEmptyIndex);
          
          const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          [initialTiles[emptyIndex], initialTiles[randomMove]] = [
            initialTiles[randomMove],
            initialTiles[emptyIndex],
          ];
          previousEmptyIndex = emptyIndex;
          emptyIndex = randomMove;
        }

        // solvedな状態でないことを確認
        if (!isSolved(initialTiles)) {
          setTiles(initialTiles);
          setMoves(0);
          setSolved(false);
          isSolvable = true;
        }
      }
    };
    
    initPuzzle();
  }, [GRID_SIZE]);

  const initializePuzzle = () => {
    let isSolvable = false;

    while (!isSolvable) {
      // 1-15 + 空白(null)
      let initialTiles: Tile[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
        id: i,
        value: i === GRID_SIZE * GRID_SIZE - 1 ? null : i + 1,
        position: i,
      }));

      // シャッフル（後戻りを防ぎながら50回スワップ）
      let emptyIndex = GRID_SIZE * GRID_SIZE - 1;
      let previousEmptyIndex = -1;

      for (let i = 0; i < 50; i++) {
        let validMoves = getValidMoves(emptyIndex);
        // 前の位置に戻らないようにフィルタリング
        validMoves = validMoves.filter((move) => move !== previousEmptyIndex);
        
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        [initialTiles[emptyIndex], initialTiles[randomMove]] = [
          initialTiles[randomMove],
          initialTiles[emptyIndex],
        ];
        previousEmptyIndex = emptyIndex;
        emptyIndex = randomMove;
      }

      // solvedな状態でないことを確認
      if (!isSolved(initialTiles)) {
        setTiles(initialTiles);
        setMoves(0);
        setSolved(false);
        isSolvable = true;
      }
    }
  };

  const getValidMoves = (emptyIndex: number): number[] => {
    const validMoves: number[] = [];
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;

    if (row > 0) validMoves.push(emptyIndex - GRID_SIZE); // 上
    if (row < GRID_SIZE - 1) validMoves.push(emptyIndex + GRID_SIZE); // 下
    if (col > 0) validMoves.push(emptyIndex - 1); // 左
    if (col < GRID_SIZE - 1) validMoves.push(emptyIndex + 1); // 右

    return validMoves;
  };

  const handleTileClick = (clickedIndex: number) => {
    if (solved) return;

    const emptyIndex = tiles.findIndex((t) => t.value === null);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(clickedIndex)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[clickedIndex]] = [
        newTiles[clickedIndex],
        newTiles[emptyIndex],
      ];
      setTiles(newTiles);
      setMoves((m) => m + 1);

      // 完成チェック
      if (isSolved(newTiles)) {
        setSolved(true);
        setTimeout(() => onSuccess?.(), 500);
      }
    }
  };

  const isSolved = (tilesToCheck: Tile[]): boolean => {
    for (let i = 0; i < tilesToCheck.length - 1; i++) {
      if (tilesToCheck[i].value !== i + 1) return false;
    }
    return tilesToCheck[tilesToCheck.length - 1].value === null;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold">スライドパズル 🧩</h2>
      <p className="text-sm text-gray-400">数字を順番に並べてパズルを完成させよう</p>

      {/* ステータス */}
      <div className="flex gap-8 text-center">
        <div>
          <p className="text-xs text-gray-400">移動回数</p>
          <p className="text-2xl font-bold text-blue-400">{moves}</p>
        </div>
        {solved && (
          <div>
            <p className="text-xs text-gray-400">ステータス</p>
            <p className="text-2xl font-bold text-green-400">✓ 完成!</p>
          </div>
        )}
      </div>

      {/* パズルグリッド */}
      <div className="grid gap-2 p-4 bg-gray-900 rounded-lg" style={{ 
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        width: 'fit-content'
      }}>
        {tiles.map((tile, index) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(index)}
            disabled={tile.value === null || solved}
            className={`w-16 h-16 text-xl font-bold rounded transition ${
              tile.value === null
                ? 'bg-gray-800 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg'
            }`}
          >
            {tile.value}
          </button>
        ))}
      </div>

      {/* リセットボタン */}
      <button
        onClick={initializePuzzle}
        disabled={solved}
        className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-full disabled:opacity-50"
      >
        リセット
      </button>

      {solved && (
        <div className="text-center">
          <p className="text-lg text-green-500">🎉 完成しました！</p>
          <p className="text-sm text-gray-400">合計 {moves} 回の移動</p>
        </div>
      )}
    </div>
  );
}
