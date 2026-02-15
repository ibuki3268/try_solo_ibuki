/**
 * ゲームの状態を表す型
 */
export type GameStatus = 
  | 'idle'        // 待機中（ゲーム開始前）
  | 'playing'     // プレイ中
  | 'cleared'     // 全クリア
  | 'game-over'   // ゲームオーバー（ライフ0）
  | 'waiting-nfc' // NFC読み取り待機中
  | 'paused';     // 一時停止

/**
 * ミニゲームの種類
 */
export type MiniGameType =
  | 'basic-agree'      // 1. 基本の同意
  | 'escape-button'    // 2. 逃げる同意
  | 'timing-game'      // 3. タイミング同意
  | 'rapid-click'      // 4. 連打同意
  | 'slot-machine'     // 5. スロット同意
  | 'slide-puzzle'     // 6. スライドパズル
  | 'maze'             // 7. 迷路
  | 'memory-game'      // 8. 記憶力テスト
  | 'reflex-test'      // 9. 反射神経
  | 'math-quiz'        // 10. 計算問題
  | 'long-press'       // 11. 長押し
  | 'two-choice-quiz'  // 12. 二択クイズ
  | 'color-match'      // 13. 色合わせ
  | 'word-search'      // 14. 文字探し
  | 'drag-drop'        // 15. ドラッグ&ドロップ
  | 'rhythm-game'      // 16. 音ゲー
  | 'dodge-game'       // 17. 避けゲー
  | 'clicker'          // 18. クリッカー
  | 'chess-board'      // 19. チェス盤
  | 'final-challenge'; // 20. 最終試練

/**
 * 難易度
 */
export type Difficulty = 1 | 2 | 3;

/**
 * ミニゲームの定義
 */
export interface MiniGame {
  id: MiniGameType;
  name: string;
  description: string;
  difficulty: Difficulty;
  timeLimit?: number; // 秒数（未指定の場合は制限なし）
}

/**
 * ゲーム全体の状態
 */
export interface GameState {
  status: GameStatus;
  currentLife: number;
  maxLife: number;
  totalGames: number;
  currentGameIndex: number;
  gameSequence: MiniGame[]; // シャッフルされたゲームの順番
  clearedGames: MiniGameType[];
  failedAttempts: number; // 現在のゲームでの失敗回数
  startTime?: number; // ゲーム開始時刻（タイムスタンプ）
  endTime?: number; // ゲーム終了時刻（タイムスタンプ）
}

/**
 * ミニゲームのプレイ結果
 */
export interface GameResult {
  success: boolean;
  message?: string;
  score?: number;
}

/**
 * ミニゲーム共通のprops
 */
export type MiniGameComponentProps = {
  onSuccess: () => void;
  onFailure?: () => void;
  timeLimit?: number;
};

/**
 * ゲーム設定定数
 */
export const GAME_CONSTANTS = {
  MAX_LIFE: 3,              // 最大ライフ数
  TOTAL_GAMES: 20,          // ゲーム総数
  ACTIVE_GAMES: 10,         // 1プレイあたりの出題数
  DEFAULT_TIME_LIMIT: 30,   // デフォルト制限時間（秒）
  PORTFOLIO_URL: 'https://portfolio-nine-green-82.vercel.app/', // ポートフォリオURL
} as const;
