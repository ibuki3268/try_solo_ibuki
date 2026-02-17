'use client';

import { useState, useRef } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

type Piece = {
  id: string;
  type: 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
  position: number;
  isTarget: boolean;
};

const PIECES = ['♞', '♝', '♜', '♛', '♚'];
const PIECE_TYPES: Array<'knight' | 'bishop' | 'rook' | 'queen' | 'king'> = [
  'knight',
  'bishop',
  'rook',
  'queen',
  'king',
];

/**
 * チェスボードゲーム
 * ボード上の特定のナイト駒を見つけてクリック
 */
export default function ChessBoard({ onSuccess }: MiniGameComponentProps) {
  const doneRef = useRef(false);
  const [pieces] = useState(() => {
    const generatedPieces: Piece[] = [];
    const usedPositions = new Set<number>();

    // 4つのナイト駒を配置（ターゲット）
    for (let i = 0; i < 4; i++) {
      let pos = Math.floor(Math.random() * 64);
      while (usedPositions.has(pos)) {
        pos = Math.floor(Math.random() * 64);
      }
      usedPositions.add(pos);
      generatedPieces.push({
        id: `knight-${i}`,
        type: 'knight',
        position: pos,
        isTarget: true,
      });
    }

    // 10つのダミー駒を配置
    for (let i = 0; i < 10; i++) {
      let pos = Math.floor(Math.random() * 64);
      while (usedPositions.has(pos)) {
        pos = Math.floor(Math.random() * 64);
      }
      usedPositions.add(pos);
      const type = PIECE_TYPES[Math.floor(Math.random() * 4) + 1]; // knight以外（インデックス1-4）
      generatedPieces.push({
        id: `piece-${i}`,
        type,
        position: pos,
        isTarget: false,
      });
    }

    return generatedPieces.sort((a, b) => a.position - b.position);
  });

  const [found, setFound] = useState<string[]>([]);
  const board = Array(64).fill(null);

  const handlePieceClick = (pieceId: string, isTarget: boolean) => {
    if (doneRef.current || found.includes(pieceId)) return;

    if (!isTarget) return; // ターゲット以外はクリック無効

    const newFound = [...found, pieceId];
    setFound(newFound);

    if (newFound.length === 4) {
      doneRef.current = true;
      onSuccess();
    }
  };

  pieces.forEach((piece) => {
    board[piece.position] = piece;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">チェスボード</h2>
      <p className="text-sm text-slate-300">
        ナイト駒（♞）を4つ見つけてクリックしてください
      </p>

      <div className="inline-block rounded-lg border border-white/20 bg-slate-900/80 p-2">
        <div className="grid grid-cols-8 gap-0">
          {board.map((piece, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const isLight = (row + col) % 2 === 0;
            const isPiece = piece !== null;
            const isFound = found.includes(piece?.id);

            return (
              <div
                key={idx}
                className={`w-12 h-12 flex items-center justify-center text-2xl cursor-pointer transition ${
                  isLight ? 'bg-amber-100' : 'bg-amber-700'
                } ${isPiece && !isFound ? 'hover:scale-110' : ''} ${
                  isFound ? 'bg-green-500 opacity-50' : ''
                }`}
                onClick={() => {
                  if (isPiece && !isFound) {
                    handlePieceClick(piece.id, piece.isTarget);
                  }
                }}
              >
                {isPiece && !isFound && PIECES[PIECE_TYPES.indexOf(piece.type)]}
                {isFound && '✓'}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-slate-300">
        見つけた: <span className="font-semibold text-emerald-400">{found.length}</span> / 4
      </div>
    </div>
  );
}
