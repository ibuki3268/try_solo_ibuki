'use client';

import { useState, useEffect, useMemo } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

// 正解のキーワード候補
const KEYWORDS = ['同意', '承諾', '確認', '了解', '合意'];
// ダミー文字の候補（似た漢字を混ぜて難易度調整）
const DUMMY_CHARS = ['意', '同', '承', '諾', '確', '認', '了', '解', '合', '約', '明', '理', '納', '得', '賛', '成', '許', '可', '応', '答'];

/**
 * 文字探しゲーム
 * ランダムな文字の中から正解のキーワードを見つける
 */
export default function WordSearch({ onSuccess, onFailure }: MiniGameComponentProps) {
  const TIME_LIMIT = 15; // 15秒
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [found, setFound] = useState(false);

  // ゲームデータを生成（初回のみ）
  const gameData = useMemo(() => {
    const targetWord = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    const size = 64;
    const chars: string[] = [];
    
    // ランダムなダミー文字で埋める
    for (let i = 0; i < size; i++) {
      chars.push(DUMMY_CHARS[Math.floor(Math.random() * DUMMY_CHARS.length)]);
    }

    // 横方向の配置可能位置を探す（行をまたがない位置）
    const possiblePositions = [];
    for (let i = 0; i < size - targetWord.length; i++) {
      const col = i % 8;
      if (col + targetWord.length <= 8) {
        possiblePositions.push(i);
      }
    }

    const startPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    
    // キーワードを配置
    for (let i = 0; i < targetWord.length; i++) {
      chars[startPos + i] = targetWord[i];
    }

    return { targetWord, grid: chars, answerPos: startPos };
  }, []);

  // タイマー
  useEffect(() => {
    if (found) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onFailure) {
            setTimeout(() => onFailure(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [found, onFailure]);

  const handleCharClick = (index: number) => {
    if (found) return;

    // クリックした位置から始まる文字列をチェック
    const clickedSequence = gameData.grid.slice(index, index + gameData.targetWord.length).join('');
    
    if (clickedSequence === gameData.targetWord) {
      setFound(true);
      setTimeout(() => onSuccess(), 0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">文字探しゲーム</h2>
        <p className="text-sm text-gray-400 mb-1">
          文字の中から <span className="text-yellow-400 font-bold">「{gameData.targetWord}」</span> を見つけてクリック！
        </p>
        <p className="text-xs text-gray-500">
          ヒント: 横方向に並んでいます
        </p>
      </div>

      <div className="text-xl font-mono">
        残り時間: <span className={timeLeft <= 5 ? 'text-red-400' : 'text-green-400'}>{timeLeft}秒</span>
      </div>

      {/* グリッド表示 */}
      <div className="grid grid-cols-8 gap-1 p-4 bg-gray-800/50 rounded-lg">
        {gameData.grid.map((char, index) => (
          <button
            key={index}
            onClick={() => handleCharClick(index)}
            disabled={found}
            className={`
              w-10 h-10 flex items-center justify-center
              text-lg font-bold rounded
              transition-all duration-150
              ${found 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-700 text-white hover:bg-blue-600 hover:scale-110 active:scale-95 cursor-pointer'
              }
            `}
          >
            {char}
          </button>
        ))}
      </div>

      {found && (
        <div className="text-green-400 font-bold text-xl animate-pulse">
          見つけた！ ✓
        </div>
      )}
    </div>
  );
}
