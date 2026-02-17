"use client";

import { useState, useEffect, useRef } from "react";
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
  const nfcWsRef = useRef<WebSocket | null>(null);
  const nfcReconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // デバッグ用：Rキーでリズムゲームにジャンプ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') {
        const rhythmGameIndex = state.gameSequence.findIndex(
          (game) => game.id === 'rhythm-game'
        );
        if (rhythmGameIndex !== -1) {
          setState((prev) => ({
            ...prev,
            currentGameIndex: rhythmGameIndex,
            status: 'playing',
            failedAttempts: 0,
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.gameSequence]);

  // NFC WebSocket 接続ロジック
  useEffect(() => {
    if (state.status !== 'waiting-nfc') return;

    const connectNFC = () => {
      try {
        // ローカルブリッジへの接続（開発環境のみ）
        const ws = new WebSocket('ws://localhost:8787');

        ws.onopen = () => {
          console.log('NFC WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'nfc' && data.uid) {
              console.log('NFC card detected:', data.uid);
              // NFC読み込み成功 → ゲーム再開
              setState((prev) => ({ ...prev, status: 'playing', failedAttempts: 0 }));
            }
          } catch (err) {
            console.error('Failed to parse NFC message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('NFC WebSocket error:', error);
          console.error('Error code:', (error as any).code);
          console.error('Error message:', (error as any).message);
        };

        ws.onclose = () => {
          console.log('NFC WebSocket closed');
          // 3秒後に再接続
          if (nfcReconnectTimeoutRef.current) clearTimeout(nfcReconnectTimeoutRef.current);
          nfcReconnectTimeoutRef.current = setTimeout(connectNFC, 3000);
        };

        nfcWsRef.current = ws;
      } catch (err) {
        console.error('Failed to connect NFC WebSocket:', err);
      }
    };

    connectNFC();

    return () => {
      if (nfcWsRef.current) {
        nfcWsRef.current.close();
        nfcWsRef.current = null;
      }
      if (nfcReconnectTimeoutRef.current) {
        clearTimeout(nfcReconnectTimeoutRef.current);
      }
    };
  }, [state.status]);

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
        <section className="rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-8 text-emerald-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">ポートフォリオへの最終段階</h2>
            <p className="mt-2 text-sm text-emerald-100/80">
              このゲームをクリアするとあなたのポートフォリオページに到達します
            </p>
          </div>

          <div className="my-8 rounded-lg border-2 border-emerald-300 bg-emerald-500/5 p-6 text-center">
            <p className="mb-4 text-lg font-semibold">NFCカードをかざしてください</p>
            <div className="animate-pulse text-4xl">📱</div>
            <p className="mt-4 text-sm text-emerald-100/60">
              RC-300でカードを読み込んでください
            </p>
          </div>

          <div className="rounded-lg bg-white/5 p-4 text-sm mb-4">
            <p className="text-slate-300">
              失敗回数: <span className="font-semibold text-emerald-300">{state.failedAttempts}</span>
            </p>
            <p className="mt-2 text-slate-300">
              進捗: <span className="font-semibold text-emerald-300">{progress} / {state.totalGames}</span>
            </p>
          </div>

          <div className="rounded-lg bg-blue-500/10 border border-blue-300/30 p-4 text-xs mb-4">
            <p className="font-semibold text-blue-300 mb-2">💡 Windows から RC-300 を読み込む</p>
            <p className="text-blue-100/70 mb-2">RC-300 アプリでカードを読み込み、以下の URL にアクセス：</p>
            <code className="block bg-slate-900 p-2 rounded text-blue-200 overflow-x-auto text-xs break-all">
              http://localhost:8788/nfc/send?uid=XXXXXXXX
            </code>
            <p className="text-blue-100/70 mt-2">※ XXXXXXXX の部分を UID に置き換えてください</p>
          </div>

          <button
            onClick={() => {
              fetch('http://localhost:8788/nfc/send?uid=TestCard123')
                .then(r => r.json())
                .then(() => console.log('✅ Test NFC sent'))
                .catch(e => console.error('❌ Error:', e));
            }}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-yellow-600 px-6 py-2 text-xs font-semibold text-white transition hover:bg-yellow-500"
          >
            🧪 テストカード送信（動作確認用）
          </button>

          <button
            onClick={resumeGame}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-500/20"
          >
            スキップ（再開する）
          </button>
        </section>
      )}

      {state.status === "game-over" && (
        <section className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-6 text-rose-100">
          <h2 className="text-xl font-semibold">ゲームオーバー</h2>
          <p className="mt-2 text-sm text-rose-100/80">
            もう一度最初から挑戦しますか？
          </p>
          <button
            onClick={resetGame}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-rose-200 px-6 py-3 text-sm font-semibold text-rose-950 transition hover:bg-rose-100"
          >
            リトライ
          </button>
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
