"use client";

import { useState, useEffect } from "react";
import {
  ALL_MINI_GAMES,
  createInitialGameState,
  handleGameFailure,
  handleGameSuccess,
  proceedToNextGame,
} from "../lib/gameLogic";
import { GAME_CONSTANTS, MiniGameType } from "../types/game";
import LifeDisplay from "./LifeDisplay";
import MiniGameContainer from "./minigames/MiniGameContainer";
import { playExplosionSound, clearAllPendingTimeouts } from "@/app/lib/audioUtils";

const IMPLEMENTED_GAME_IDS: MiniGameType[] = [
  "basic-agree",
  "escape-button",
  "rapid-click",
  "timing-game",
  "long-press",
  "clicker",
  "math-quiz",
  "memory-game",
  "reflex-test",
  "two-choice-quiz",
  "color-match",
  "word-search",
  "drag-drop",
  "maze",
  "slot-machine",
  "slide-puzzle",
  "chess-board",
  "dodge-game",
  "rhythm-game",
];

const ACTIVE_GAMES = ALL_MINI_GAMES.filter((game) =>
  IMPLEMENTED_GAME_IDS.includes(game.id)
);

const consentArticles = [
  {
    article: "第1条",
    title: "利用者の姿勢について",
    items: [
      "(1) 利用者は本ゲームを楽しむ姿勢で臨みます。",
      "(2) 利用者はクリア後に到達するポートフォリオが突貫のしょぼい物でも、苦言を呈さないと誓います。",
      "(3) 利用者は途中で不機嫌にならず、最後まで同意の姿勢を保ちます。",
      "(4) 利用者は必ず以後の利用規約を読みます。",
    ],
  },
  {
    article: "第2条",
    title: "開発者への配慮について",
    items: [
      "(1) 利用者は本ゲームを遊ぶ際、開発者の努力に敬意を払います。",
      "(2) 利用者は開発者も人間であることを理解し、些細な不具合や誤字脱字には目をつむります。",
      "(3) 利用者は開発者への連絡を行う場合、穏やかな文面を心がけます。",
      "(4) 利用者は文句がある場合でもピキることなく論理的に伝えます。",
    ],
  },
  {
    article: "第3条",
    title: "不具合に対する姿勢について",
    items: [
      "(1) 利用者は細かなバグや不具合があった場合、煽らずに開発者へ伝えます。",
      "(2) 利用者は脆弱性やセキュリティに関する指摘は、語気を抑えて伝えると誓います。",
      "(3) 利用者は再現手順が分かる場合、可能な範囲で補足情報を添えます。",
      "(4) 利用者は改善点の提案を行う際、代替案を添えて伝えます。",
    ],
  },
];

export default function GameManager() {
  const [state, setState] = useState(() =>
    createInitialGameState(ACTIVE_GAMES, GAME_CONSTANTS.ACTIVE_GAMES)
  );
  const currentGame = state.gameSequence[state.currentGameIndex];
  const consentArticle = consentArticles[state.currentGameIndex] ?? null;
  const progress = Math.min(state.currentGameIndex + 1, state.totalGames);

  const startGame = () => {
    setState((prev) => ({ ...prev, status: "playing" }));
  };

  const resumeGame = () => {
    setState((prev) => ({ ...prev, status: "playing" }));
  };

  const resetGame = () => {
    setState(createInitialGameState(ACTIVE_GAMES, GAME_CONSTANTS.ACTIVE_GAMES));
  };

  // デバッグ用：各ゲームへのキーボードジャンプ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // ゲームIDとキーのマッピング
    const gameKeyMap: Record<string, MiniGameType> = {
      '1': 'basic-agree',
      '2': 'escape-button',
      '3': 'rapid-click',
      '4': 'timing-game',
      '5': 'long-press',
      '6': 'clicker',
      '7': 'math-quiz',
      '8': 'memory-game',
      '9': 'reflex-test',
      '0': 'two-choice-quiz',
      'q': 'color-match',
      'w': 'word-search',
      'e': 'drag-drop',
      'a': 'maze',
      's': 'slot-machine',
      'd': 'slide-puzzle',
      'f': 'chess-board',
      'g': 'dodge-game',
      'r': 'rhythm-game',
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const targetGameId = gameKeyMap[key];
      
      if (targetGameId) {
        setState((prevState) => {
          // まず現在のシーケンスから探す
          let gameIndex = prevState.gameSequence.findIndex(
            (game) => game.id === targetGameId
          );
          
          if (gameIndex !== -1) {
            console.log(`[DEBUG] Jumped to ${targetGameId} (found in sequence at index: ${gameIndex}) using key: ${key}`);
            return {
              ...prevState,
              currentGameIndex: gameIndex,
              status: 'playing' as const,
              failedAttempts: 0,
            };
          } else {
            // シーケンスに無い場合は、ACTIVE_GAMESから探してシーケンスに追加
            const targetGame = ACTIVE_GAMES.find((game) => game.id === targetGameId);
            if (targetGame) {
              const newSequence = [...prevState.gameSequence, targetGame];
              console.log(`[DEBUG] Jumped to ${targetGameId} (added to sequence) using key: ${key}`);
              return {
                ...prevState,
                gameSequence: newSequence,
                currentGameIndex: newSequence.length - 1,
                status: 'playing' as const,
                failedAttempts: 0,
              };
            } else {
              console.warn(`[DEBUG] Game ${targetGameId} not found at all`);
              return prevState;
            }
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [process.env.NODE_ENV]);

  // cleanup: コンポーネント破棄時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      clearAllPendingTimeouts();
    };
  }, []);

  const handleSuccess = () => {
    if (!currentGame) return;

    setState((prev) => {
      const updated = handleGameSuccess(prev, currentGame.id);
      return proceedToNextGame(updated, prev.gameSequence);
    });
  };

  const handleFailure = () => {
    setState((prev) => handleGameFailure(prev));
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
            Progress
          </p>
          <div className="text-lg font-semibold text-white">
            {progress} / {state.totalGames}
          </div>
        </div>
        <LifeDisplay current={state.currentLife} max={state.maxLife} />
      </header>

      {state.status === "idle" && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100">
          <h2 className="text-xl font-semibold">準備完了</h2>
          <p className="mt-2 text-sm text-slate-300">
            まずは3つのミニゲームからスタートします。
          </p>
          <button
            onClick={startGame}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            ゲーム開始
          </button>
        </section>
      )}

      {state.status === "waiting-nfc" && (
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100">
          <h2 className="text-xl font-semibold">再挑戦の準備中</h2>
          <p className="mt-2 text-sm text-slate-300">
            次のゲームへ進むには再開してください。
          </p>
          <button
            onClick={resumeGame}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
          >
            再開する
          </button>
        </section>
      )}

      {state.status === "game-over" && (
        <section className="relative overflow-hidden rounded-3xl border-2 border-rose-400 bg-gradient-to-b from-rose-600/20 to-rose-900/20 p-8 text-rose-100 shadow-2xl"
          style={{ animation: "flash-explosion 0.5s ease-out" }}
          onAnimationStart={() => {
            playExplosionSound({ baseFrequency: 220, duration: 0.5, gain: 0.4 }).catch((err) => {
              console.warn('Failed to play game-over explosion sound:', err);
            });
          }}
        >
          {/* 背景フラッシュ */}
          <div
            className="absolute inset-0 bg-white/30 pointer-events-none"
            style={{ animation: "flash-fade 0.3s ease-out" }}
          />
          
          {/* 爆破パーティクル */}
          {Array.from({ length: 40 }).map((_, i) => {
            const randomTx = (Math.random() - 0.5) * 200;
            const randomTy = (Math.random() - 0.5) * 200;
            return (
              <div
                key={i}
                className="particle absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 30 + 10}px`,
                  height: `${Math.random() * 30 + 10}px`,
                  backgroundColor: ["#ff6b6b", "#ff8787", "#ffa8a8", "#ffb3b3", "#ff4444"][Math.floor(Math.random() * 5)],
                  animation: `particle-explode ${2 + Math.random() * 1}s ease-out forwards`,
                  animationDelay: `${i * 0.04}s`,
                  boxShadow: "0 0 10px rgba(255, 100, 100, 0.8)",
                  '--tx': `${randomTx}px`,
                  '--ty': `${randomTy}px`,
                } as React.CSSProperties}
              />
            );
          })}
          
          {/* メインテキスト - 強化版 */}
          <div className="shake-container relative z-10 text-center">
            <h2 
              className="text-6xl font-black text-white drop-shadow-2xl" 
              style={{ 
                animation: "shake-intense 0.5s ease-out, glow-pulse 2s ease-in-out infinite 0.5s",
                textShadow: "0 0 20px rgba(255, 100, 100, 0.8), 0 0 40px rgba(255, 50, 50, 0.6)",
              }}
            >
              💥 GAME OVER 💥
            </h2>
            <p className="mt-4 text-xl font-bold text-rose-200" style={{ textShadow: "0 0 10px rgba(255, 100, 100, 0.6)" }}>
              3回失敗してしまいました...
            </p>
          </div>

          {/* ボタン */}
          <div className="relative z-10 mt-8 flex flex-col gap-3">
            <button
              onClick={() => window.location.href = '/portfolio-broken'}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-3 text-lg font-bold text-white shadow-xl transition hover:from-rose-600 hover:to-pink-600 hover:shadow-2xl"
              style={{ animation: "pulse-button 2s ease-in-out infinite 0.6s" }}
            >
              💔 ポートフォリオを見る
            </button>
            <button
              onClick={resetGame}
              className="inline-flex items-center justify-center rounded-full bg-rose-200/50 px-6 py-2 text-sm font-semibold text-rose-950 transition hover:bg-rose-200"
            >
              リトライ
            </button>
          </div>

          <style>{`
            @keyframes shake-intense {
              0% { transform: translateX(0) rotateZ(0deg) scale(0.8); }
              25% { transform: translateX(-8px) rotateZ(-2deg) scale(1.05); }
              50% { transform: translateX(8px) rotateZ(2deg) scale(1.05); }
              75% { transform: translateX(-5px) rotateZ(-1deg) scale(1.02); }
              100% { transform: translateX(0) rotateZ(0deg) scale(1); }
            }

            @keyframes particle-explode {
              0% {
                opacity: 1;
                transform: translate(0, 0) rotate(0deg) scale(1);
              }
              100% {
                opacity: 0;
                transform: translate(var(--tx, 100px), var(--ty, 100px)) rotate(360deg) scale(0);
              }
            }

            @keyframes particle-fall {
              0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
              }
              100% {
                opacity: 0;
                transform: translateY(100px) rotate(180deg);
              }
            }

            @keyframes flash-explosion {
              0% { 
                filter: brightness(2) saturate(2);
                transform: scale(0.95);
              }
              100% { 
                filter: brightness(1) saturate(1);
                transform: scale(1);
              }
            }

            @keyframes flash-fade {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }

            @keyframes glow-pulse {
              0%, 100% {
                text-shadow: 0 0 20px rgba(255, 100, 100, 0.8), 0 0 40px rgba(255, 50, 50, 0.6);
              }
              50% {
                text-shadow: 0 0 30px rgba(255, 100, 100, 1), 0 0 60px rgba(255, 50, 50, 0.8);
              }
            }

            @keyframes pulse-button {
              0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 20px rgba(244, 63, 94, 0.6);
              }
              50% { 
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(244, 63, 94, 0.8);
              }
            }

            .explosion-section {
              animation: explode-flash 0.4s ease-out;
            }

            @keyframes explode-flash {
              0% { filter: brightness(2) saturate(1.5); }
              100% { filter: brightness(1) saturate(1); }
            }
          `}</style>
        </section>
      )}

      {state.status === "cleared" && (
        <section className="rounded-3xl border border-emerald-200/30 bg-emerald-400/10 p-6 text-emerald-100">
          <h2 className="text-xl font-semibold">ステージクリア</h2>
          <p className="mt-2 text-sm text-emerald-100/80">
            ここまでのミニゲームを突破しました。
          </p>
          <button
            onClick={resetGame}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200"
          >
            もう一度遊ぶ
          </button>
        </section>
      )}

      {state.status === "playing" && currentGame && (
        <MiniGameContainer
          game={currentGame}
          consent={consentArticle}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          failedAttempts={state.failedAttempts}
        />
      )}
    </div>
  );
}
