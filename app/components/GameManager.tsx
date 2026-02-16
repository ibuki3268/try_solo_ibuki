"use client";

import { useState } from "react";
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
        />
      )}
    </div>
  );
}
