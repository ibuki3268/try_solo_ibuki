'use client';

import { useState, useRef, useEffect } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

type Note = {
  id: string;
  time: number; // ゲーム開始からの経過時間（ms）
  hit: boolean;
};

type JudgeResult = 'perfect' | 'good' | 'bad' | null;

// ノーツシーケンス定義
const NOTES_SEQUENCE: Note[] = [
  { id: 'note-0', time: 1000, hit: false },
  { id: 'note-1', time: 2000, hit: false },
  { id: 'note-2', time: 3000, hit: false },
  { id: 'note-3', time: 4000, hit: false },
  { id: 'note-4', time: 5000, hit: false },
  { id: 'note-5', time: 6000, hit: false },
  { id: 'note-6', time: 7000, hit: false },
  { id: 'note-7', time: 8000, hit: false },
  { id: 'note-8', time: 9000, hit: false },
  { id: 'note-9', time: 10000, hit: false },
  { id: 'note-10', time: 11000, hit: false },
  { id: 'note-11', time: 12000, hit: false },
];

// 最後のノーツの時刻 + 1秒のバッファでゲーム時間を設定
const MAX_NOTE_TIME = Math.max(...NOTES_SEQUENCE.map(n => n.time));
const GAME_DURATION = MAX_NOTE_TIME + 1000; // 約13秒
const JUDGE_LINE_Y = 300; // 判定ラインのY座標（画面内に見える位置）
const NOTE_SPEED = 0.2; // ノーツの速度（ピクセル/ms）
// 計算: ノーツが判定ラインに到達するまでの時間 = JUDGE_LINE_Y / NOTE_SPEED
const ARRIVAL_TIME = JUDGE_LINE_Y / NOTE_SPEED; // 約1500ms
const JUDGE_PERFECT_RANGE = 250; // Perfect判定の範囲（ms）
const JUDGE_GOOD_RANGE = 400; // Good判定の範囲（ms）
const SCORE_PERFECT = 20;
const SCORE_GOOD = 10;
const SCORE_BAD = 0;
const TARGET_SCORE = 30; // クリアに必要なスコア

/**
 * リズムゲーム（音声なし版）
 * 流れてくるノーツをタイミングよくクリック
 */
export default function RhythmGame({ onSuccess, onFailure }: MiniGameComponentProps) {
  const doneRef = useRef(false);
  const gameStartRef = useRef(Date.now());

  // ノーツシーケンスへの参照
  const notesSequenceRef = useRef<Note[]>(NOTES_SEQUENCE);

  // hit フラグの状態管理（notesSequenceRef の notes を直接変更する）
  const [hitNotes, setHitNotes] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [gameActive, setGameActive] = useState(true);
  const [judgeDisplay, setJudgeDisplay] = useState('');

  const judgeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNoteClick = (noteId: string) => {
    if (!gameActive || doneRef.current) {
      return;
    }

    // 既に hit している場合はスキップ
    if (hitNotes.has(noteId)) {
      return;
    }

    const now = Date.now();
    const elapsedTime = now - gameStartRef.current;

    const note = notesSequenceRef.current.find((n) => n.id === noteId);
    if (!note) return;

    // タイミング判定
    const timeDiff = elapsedTime - note.time;
    
    let judge: JudgeResult = null;
    let addScore = 0;
    let displayText = '';

    if (Math.abs(timeDiff) <= JUDGE_PERFECT_RANGE) {
      judge = 'perfect';
      addScore = SCORE_PERFECT;
      displayText = '🟩 Perfect!';
    } else if (Math.abs(timeDiff) <= JUDGE_GOOD_RANGE) {
      judge = 'good';
      addScore = SCORE_GOOD;
      displayText = '🟨 Good!';
    } else {
      judge = 'bad';
      addScore = SCORE_BAD;
      displayText = '🟥 Bad';
    }

    setJudgeDisplay(displayText);
    setScore((prev) => prev + addScore);
    setHitNotes((prev) => new Set([...prev, noteId]));

    // 判定表示を1秒後に消す
    if (judgeTimeoutRef.current) clearTimeout(judgeTimeoutRef.current);
    judgeTimeoutRef.current = setTimeout(() => {
      setJudgeDisplay('');
    }, 800);

    // スコアチェック（この時点では prev なので addScore と組み合わせる）
    const newScore = score + addScore;
    if (newScore >= TARGET_SCORE) {
      doneRef.current = true;
      setGameActive(false);
      onSuccess();
    }
  };

  // ゲームループ
  useEffect(() => {
    if (!gameActive || doneRef.current) return;

    const gameLoopInterval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - gameStartRef.current;
      const remainingTime = Math.max(0, GAME_DURATION - elapsedTime);

      setTimeLeft(Math.ceil(remainingTime / 1000));

      // 時間切れ
      if (remainingTime <= 0) {
        doneRef.current = true;
        setGameActive(false);
        if (score >= TARGET_SCORE) {
          onSuccess();
        } else {
          onFailure?.();
        }
        return;
      }
    }, 1000 / 60); // 60fps

    return () => clearInterval(gameLoopInterval);
  }, [gameActive, score, onSuccess, onFailure]);

  // ノーツのY座標を計算
  const getNotesWithPositions = () => {
    const now = Date.now();
    const elapsedTime = now - gameStartRef.current;

    // ノーツは上から落ちてくる
    // 判定ラインに到達する時刻がnote.timeなら、その時Y座標がJUDGE_LINE_Yになる
    return notesSequenceRef.current.map((note) => {
      const noteY = JUDGE_LINE_Y + (elapsedTime - note.time) * NOTE_SPEED;
      return { ...note, y: noteY, hit: hitNotes.has(note.id) };
    });
  };

  const notesWithPos = getNotesWithPositions();

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">リズムゲー</h2>
      <p className="text-sm text-slate-300">
        降ってくるノーツをタイミングよくクリック
      </p>

      <div className="flex items-center justify-between w-full max-w-md gap-4">
        <div className="text-lg font-semibold text-white">
          スコア: <span className="text-emerald-400">{score}</span> / {TARGET_SCORE}
        </div>
        <div className="text-sm text-slate-300">残り {timeLeft}秒</div>
      </div>

      {/* ゲーム領域 */}
      <div className="relative w-full max-w-md h-screen rounded-lg border-2 border-white/20 bg-slate-900 overflow-hidden">
        {/* 判定ライン */}
        <div
          className="absolute inset-x-0 border-b-4 border-yellow-400 h-0 pointer-events-none shadow-lg shadow-yellow-400/50"
          style={{ top: `${JUDGE_LINE_Y}px` }}
        />

        {/* ノーツ */}
        {notesWithPos.map((note) => (
          <button
            key={note.id}
            onClick={() => handleNoteClick(note.id)}
            className={`absolute w-12 h-12 rounded transition ${
              note.hit
                ? 'bg-emerald-400/30 opacity-50'
                : 'bg-cyan-400 hover:bg-cyan-300 cursor-pointer'
            }`}
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              top: `${note.y}px`,
              pointerEvents: note.hit ? 'none' : 'auto',
              zIndex: note.hit ? 0 : 10,
            }}
          >
            ♪
          </button>
        ))}

        {/* 判定表示 */}
        {judgeDisplay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold animate-pulse">{judgeDisplay}</span>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400">
        <p>♪ クリックでノーツを打つ</p>
        <p>目標スコア: {TARGET_SCORE}点以上</p>
      </div>
    </div>
  );
}
