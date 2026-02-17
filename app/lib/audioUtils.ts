// シングルトンのAudioContext
let audioContext: AudioContext | null = null;
const pendingTimeouts: Set<NodeJS.Timeout> = new Set();

/**
 * 再利用可能な AudioContext を取得
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioContextClass =
      typeof window !== 'undefined' &&
      (window.AudioContext || (window as any).webkitAudioContext);
    
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
    
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/**
 * 爆発音を再生（3連音）- Promise 対応版、タイムアウトトラッキング
 * @param options - 再生オプション
 * @returns Promise
 */
export async function playExplosionSound(options?: {
  baseFrequency?: number;
  duration?: number;
  gain?: number;
}): Promise<void> {
  try {
    const ctx = getAudioContext();
    
    // AudioContext が suspend 状態の場合は再開
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('Could not resume AudioContext:', e);
      }
    }
    
    const baseFreq = options?.baseFrequency ?? 220;
    const duration = options?.duration ?? 0.4;
    const gainValue = options?.gain ?? 0.3;

    // 3つの爆発音を連続で再生
    for (let i = 0; i < 3; i++) {
      const timeoutId = setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'square';
          const startFreq = baseFreq - i * 60;
          const endFreq = 20;

          osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            endFreq,
            ctx.currentTime + duration
          );

          gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            ctx.currentTime + duration
          );

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + duration);

          // cleanup: ノードの削除を待つ
          const cleanupTimeoutId = setTimeout(() => {
            try {
              osc.disconnect(gainNode);
              gainNode.disconnect(ctx.destination);
            } catch (e) {
              // 既に削除されている場合
            }
            pendingTimeouts.delete(cleanupTimeoutId);
          }, (duration * 1000) + 100);
          
          pendingTimeouts.add(cleanupTimeoutId);
        } catch (e) {
          console.error('Error playing explosion sound:', e);
        }
        pendingTimeouts.delete(timeoutId);
      }, i * 200);
      
      pendingTimeouts.add(timeoutId);
    }
  } catch (e) {
    console.warn('Audio context unavailable:', e);
  }
}

/**
 * AudioContext の状態を取得
 */
export function getAudioContextState(): {
  available: boolean;
  state?: 'suspended' | 'running' | 'closed';
} {
  try {
    const ctx = getAudioContext();
    return {
      available: true,
      state: ctx.state as 'suspended' | 'running' | 'closed',
    };
  } catch {
    return {
      available: false,
    };
  }
}

/**
 * 保留中のタイムアウトをすべてクリア
 */
export function clearAllPendingTimeouts(): void {
  pendingTimeouts.forEach((timeoutId) => {
    clearTimeout(timeoutId);
  });
  pendingTimeouts.clear();
}

/**
 * AudioContext を再開（ユーザーインタラクション後）
 */
export async function resumeAudioContext(): Promise<void> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch (e) {
    console.warn('Could not resume audio context:', e);
  }
}
