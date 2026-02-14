// ゲームロジック

import { MiniGame, GameState, GAME_CONFIG } from '../types/game';

/**
 * 全てのミニゲームの定義
 */
export const ALL_MINI_GAMES: MiniGame[] = [
  {
    id: 'game-01',
    type: 'basic-agree',
    title: '基本の同意',
    description: '「同意する」ボタンをクリックしてください',
    difficulty: 1,
  },
  {
    id: 'game-02',
    type: 'escape-button',
    title: '逃げる同意',
    description: 'マウスから逃げるボタンをクリック！',
    difficulty: 2,
    timeLimit: 30,
  },
  {
    id: 'game-03',
    type: 'timing-game',
    title: 'タイミング同意',
    description: 'ゲージが緑の時にクリックしてください',
    difficulty: 2,
  },
  {
    id: 'game-04',
    type: 'rapid-click',
    title: '連打同意',
    description: '時間内に連打してゲージを貯めよう！',
    difficulty: 1,
    timeLimit: 10,
  },
  {
    id: 'game-05',
    type: 'slot-machine',
    title: 'スロット同意',
    description: 'スロットを揃えて同意しよう',
    difficulty: 2,
  },
  {
    id: 'game-06',
    type: 'slide-puzzle',
    title: 'スライドパズル',
    description: 'パズルを完成させてください',
    difficulty: 3,
    timeLimit: 60,
  },
  {
    id: 'game-07',
    type: 'maze',
    title: '迷路',
    description: '迷路をゴールまで進もう',
    difficulty: 2,
    timeLimit: 45,
  },
  {
    id: 'game-08',
    type: 'memory-game',
    title: '記憶力テスト',
    description: '表示された順番を記憶してください',
    difficulty: 2,
  },
  {
    id: 'game-09',
    type: 'reflex-test',
    title: '反射神経',
    description: '光ったボタンをすぐにクリック！',
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 'game-10',
    type: 'math-quiz',
    title: '計算問題',
    description: '簡単な算数の答えを入力してください',
    difficulty: 1,
    timeLimit: 20,
  },
  {
    id: 'game-11',
    type: 'long-press',
    title: '長押し',
    description: 'ボタンを3秒間長押ししてください',
    difficulty: 1,
  },
  {
    id: 'game-12',
    type: 'two-choice-quiz',
    title: '二択クイズ',
    description: '正しい答えを選んでください',
    difficulty: 1,
  },
  {
    id: 'game-13',
    type: 'color-match',
    title: '色合わせ',
    description: '指定された色を選択してください',
    difficulty: 1,
  },
  {
    id: 'game-14',
    type: 'word-search',
    title: '文字探し',
    description: '「同意する」という文字を探してください',
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 'game-15',
    type: 'drag-drop',
    title: 'ドラッグ&ドロップ',
    description: '要素を正しい位置に配置してください',
    difficulty: 2,
  },
  {
    id: 'game-16',
    type: 'rhythm-game',
    title: '音ゲー',
    description: 'タイミングよくボタンを押そう',
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 'game-17',
    type: 'dodge-game',
    title: '避けゲー',
    description: '障害物を避けながら進もう',
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 'game-18',
    type: 'clicker',
    title: 'クリッカー',
    description: '10回クリックしてください',
    difficulty: 1,
  },
  {
    id: 'game-19',
    type: 'chess-board',
    title: 'チェス盤',
    description: '指定されたマスをクリックしてください',
    difficulty: 2,
  },
  {
    id: 'game-20',
    type: 'final-challenge',
    title: '最終試練',
    description: '複数の挑戦を連続でクリアしよう',
    difficulty: 3,
    timeLimit: 40,
  },
];

/**
 * ゲームをシャッフルする
 */
export function shuffleGames(games: MiniGame[]): MiniGame[] {
  const shuffled = [...games];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 初期ゲーム状態を作成
 */
export function createInitialGameState(): GameState {
  return {
    status: 'idle',
    currentGameIndex: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    maxLives: GAME_CONFIG.INITIAL_LIVES,
    clearedGames: [],
    failedAttempts: 0,
    portfolioUrl: GAME_CONFIG.PORTFOLIO_URL,
  };
}

/**
 * ゲームをクリアしたかチェック
 */
export function isAllGamesCleared(state: GameState, totalGames: number): boolean {
  return state.clearedGames.length >= totalGames;
}

/**
 * ゲームオーバーかチェック
 */
export function isGameOver(state: GameState): boolean {
  return state.lives <= 0;
}

/**
 * 次のゲームに進む
 */
export function proceedToNextGame(
  state: GameState,
  games: MiniGame[]
): GameState {
  const nextIndex = state.currentGameIndex + 1;
  
  if (nextIndex >= games.length) {
    return {
      ...state,
      status: 'cleared',
    };
  }

  return {
    ...state,
    currentGameIndex: nextIndex,
    status: 'playing',
  };
}

/**
 * ゲームに失敗した時の処理
 */
export function handleGameFailure(state: GameState): GameState {
  const newLives = state.lives - 1;
  const newFailedAttempts = state.failedAttempts + 1;

  if (newLives <= 0) {
    return {
      ...state,
      lives: newLives,
      failedAttempts: newFailedAttempts,
      status: 'exploded',
    };
  }

  return {
    ...state,
    lives: newLives,
    failedAttempts: newFailedAttempts,
    status: 'idle', // NFC再読み込み待ちに戻る
  };
}

/**
 * ゲームに成功した時の処理
 */
export function handleGameSuccess(
  state: GameState,
  gameId: string
): GameState {
  return {
    ...state,
    clearedGames: [...state.clearedGames, gameId],
  };
}
