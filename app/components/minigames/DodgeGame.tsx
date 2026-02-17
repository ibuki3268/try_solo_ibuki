'use client';

import { useState, useRef, useEffect } from 'react';
import type { MiniGameComponentProps } from '@/app/types/game';

type Obstacle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlayerPos = {
  x: number;
  y: number;
};

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PLAYER_SIZE = 25;
const OBSTACLE_HEIGHT = 25;
const OBSTACLE_SPEED = 6;
const SPAWN_RATE = 1000; // ms
const GAME_DURATION = 25000; // 25秒

/**
 * 避けゲー
 * 上から落下してくる障害物を避けてプレイヤーを生存させる
 */
export default function DodgeGame({ onSuccess, onFailure }: MiniGameComponentProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const playerPosRef = useRef<PlayerPos>({
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT - PLAYER_SIZE - 10,
  });

  const [playerPos, setPlayerPos] = useState<PlayerPos>(playerPosRef.current);

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [gameActive, setGameActive] = useState(true);
  const [gameLost, setGameLost] = useState(false);
  const hasFailedRef = useRef(false);

  const obstacleIdRef = useRef(0);
  const lastSpawnRef = useRef(Date.now());
  const gameStartRef = useRef(Date.now());

  // マウス移動でプレイヤー追従
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameRef.current || !gameActive || gameLost) return;

      const rect = gameRef.current.getBoundingClientRect();
      let x = e.clientX - rect.left - PLAYER_SIZE / 2;
      let y = e.clientY - rect.top - PLAYER_SIZE / 2;

      // 画面内に留める
      x = Math.max(0, Math.min(x, GAME_WIDTH - PLAYER_SIZE));
      y = Math.max(0, Math.min(y, GAME_HEIGHT - PLAYER_SIZE));

      const newPos = { x, y };
      playerPosRef.current = newPos;
      setPlayerPos(newPos);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gameActive, gameLost]);

  // 衝突フラグをチェック
  useEffect(() => {
    if (hasFailedRef.current) {
      doneRef.current = true;
      setGameActive(false);
      setGameLost(true);
      onFailure?.();
      hasFailedRef.current = false;
    }
  }, [obstacles, onFailure]);

  // ゲームループ
  useEffect(() => {
    if (!gameActive || gameLost || doneRef.current) return;

    const gameLoopInterval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - gameStartRef.current;
      const remainingTime = Math.max(
        0,
        GAME_DURATION - elapsedTime
      );

      setTimeLeft(Math.ceil(remainingTime / 1000));

      // 時間切れ = クリア
      if (remainingTime <= 0) {
        doneRef.current = true;
        setGameActive(false);
        onSuccess();
        return;
      }

      // 障害物生成
      if (now - lastSpawnRef.current > SPAWN_RATE) {
        // 幅をもっと不規則に（より難しい）
        const width = Math.random() * 100 + 30; // 30-130px
        const x = Math.random() * (GAME_WIDTH - width);

        setObstacles((prev) => [
          ...prev,
          {
            id: `obs-${obstacleIdRef.current++}`,
            x,
            y: -OBSTACLE_HEIGHT,
            width,
            height: OBSTACLE_HEIGHT,
          },
        ]);

        lastSpawnRef.current = now;
      }

      // 障害物移動・衝突判定
      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({
            ...obs,
            y: obs.y + OBSTACLE_SPEED,
          }))
          .filter((obs) => obs.y < GAME_HEIGHT);

        // 衝突判定
        const pos = playerPosRef.current;
        for (const obs of updated) {
          const playerRight = pos.x + PLAYER_SIZE;
          const playerBottom = pos.y + PLAYER_SIZE;
          const obsRight = obs.x + obs.width;
          const obsBottom = obs.y + obs.height;

          if (
            pos.x < obsRight &&
            playerRight > obs.x &&
            pos.y < obsBottom &&
            playerBottom > obs.y
          ) {
            // 衝突フラグを立てる（親の状態更新は避ける）
            hasFailedRef.current = true;
            return [];
          }
        }

        return updated;
      });
    }, 1000 / 60); // 60fps

    return () => clearInterval(gameLoopInterval);
  }, [gameActive, gameLost, onSuccess, onFailure]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">避けゲー</h2>
      <p className="text-sm text-slate-300">
        「不同意」を避けてプレイヤーを守り、25秒生き残ってください
      </p>

      <div className="flex items-center justify-between w-full max-w-md gap-4">
        <div className="text-lg font-semibold text-white">
          時間: <span className="text-emerald-400">{timeLeft}秒</span>
        </div>
        {gameLost && (
          <div className="text-lg font-semibold text-red-400">衝突！</div>
        )}
        {!gameLost && !gameActive && (
          <div className="text-lg font-semibold text-emerald-400">クリア！</div>
        )}
      </div>

      <div
        ref={gameRef}
        className="relative overflow-hidden rounded-lg border-2 border-white/20 bg-slate-900"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        {/* プレイヤー */}
        <div
          className="absolute bg-emerald-400 rounded transition-all"
          style={{
            width: `${PLAYER_SIZE}px`,
            height: `${PLAYER_SIZE}px`,
            left: `${playerPos.x}px`,
            top: `${playerPos.y}px`,
          }}
        />

        {/* 障害物 */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute bg-red-500 flex items-center justify-center font-bold text-white"
            style={{
              width: `${obs.width}px`,
              height: `${obs.height}px`,
              left: `${obs.x}px`,
              top: `${obs.y}px`,
              fontSize: `${Math.max(obs.width / 4, 8)}px`,
              lineHeight: '1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            不同意
          </div>
        ))}

        {/* ゲーム未開始メッセージ */}
        {gameActive && timeLeft === Math.ceil(GAME_DURATION / 1000) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-center text-sm">
              マウスを動かしてゲーム開始
            </p>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 max-w-md">
        🟢 プレイヤー（同意） | 🔴 障害物（不同意）
      </div>
    </div>
  );
}
