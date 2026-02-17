'use client';

import { useEffect, useState } from 'react';
import { playExplosionSound, clearAllPendingTimeouts } from '@/app/lib/audioUtils';

interface ParticleStyle {
  width: number;
  height: number;
  left: string;
  top: string;
  animation: string;
}

export default function PortfolioBroken() {
  const [particles, setParticles] = useState<ParticleStyle[]>([]);

  useEffect(() => {
    // クライアント側でのみランダム値を生成
    const newParticles = Array.from({ length: 30 }).map(() => ({
      width: Math.random() * 100 + 20,
      height: Math.random() * 100 + 20,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animation: `pulse ${2 + Math.random() * 2}s infinite`,
    }));
    setParticles(newParticles);
    
    // cleanup: コンポーネント破棄時にタイムアウトをクリア
    return () => {
      clearAllPendingTimeouts();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-rose-900/20 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景グリッチエフェクト */}
      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .glitch-text {
          animation: glitch 0.3s infinite;
        }
        .flicker-text {
          animation: flicker 0.15s infinite;
        }
      `}</style>

      {/* 破片エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((style, i) => (
          <div
            key={i}
            className="absolute bg-rose-500/30 animate-pulse"
            style={{
              width: style.width,
              height: style.height,
              left: style.left,
              top: style.top,
              animation: style.animation,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* 大きなエラーコード */}
        <div className="mb-4">
          <h1 className="text-9xl font-black text-rose-500 glitch-text drop-shadow-lg">
            404
          </h1>
        </div>

        {/* タイトル */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 flicker-text">
            ポートフォリオ崩壊
          </h2>
          <p className="text-rose-300 text-lg font-semibold">
            💥 Game Over Impact 💥
          </p>
        </div>

        {/* メッセージ */}
        <div className="mb-8 space-y-3">
          <p className="text-slate-300 text-sm font-mono">
            &gt; ミニゲーム連鎖: 失敗
          </p>
          <p className="text-slate-300 text-sm font-mono">
            &gt; ポートフォリオサイト: 爆発状態
          </p>
          <p className="text-rose-400 text-sm font-mono">
            &gt; ファイル復旧: 不可能
          </p>
        </div>

        {/* 説明文 */}
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          3度のゲーム失敗により<br/>
          ポートフォリオサーバーが爆発し、<br/>
          復旧不可能な状態になりました
        </p>

        {/* アクション */}
        <div className="space-y-3">
          <button
            onClick={() => {
              playExplosionSound().catch((err) => {
                console.warn('Failed to play explosion sound:', err);
              }).finally(() => {
                window.location.href = '/';
              });
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold rounded-lg transition"
          >
            ⚠️ 重大なエラーが発生しました
          </button>
        </div>

        {/* フッター */}
        <p className="mt-8 text-slate-500 text-xs font-mono">
          [restore_failed] | [backup_not_found] | [game_over]
        </p>
      </div>

      {/* 右下の壊れたコード */}
      <div className="fixed bottom-4 right-4 text-slate-600 text-xs font-mono opacity-50 max-w-xs">
        <pre className="text-rose-400 font-mono text-xs overflow-auto max-h-24">
{`Error: PortfolioNotFound
  at GameManager (line 42)
  at window.location
  at failed_attempts (3/3)
  
Stack: Exploded`}
        </pre>
      </div>
    </div>
  );
}
