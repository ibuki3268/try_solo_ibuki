// ゲームロジック

import { MiniGame, GameState, GAME_CONSTANTS } from '../types/game';

/**
 * 全てのミニゲームの定義
 */
export const ALL_MINI_GAMES: MiniGame[] = [
  {
    id: 'basic-agree',
    name: '基本の同意',
    description: '「同意する」ボタンをクリックしてください',
    difficulty: 1,
  },
  {
    id: 'escape-button',
    name: '逃げる同意',
    description: 'マウスから逃げるボタンをクリック！',
    difficulty: 2,
    timeLimit: 30,
  },
  {
    id: 'timing-game',
    name: 'タイミング同意',
    description: 'ゲージが緑の時にクリックしてください',
    difficulty: 2,
  },
  {
    id: 'rapid-click',
    name: '連打同意',
    description: '時間内に連打してゲージを貯めよう！',
    difficulty: 1,
    timeLimit: 10,
  },
  {
    id: 'slot-machine',
    name: 'スロット同意',
    description: 'スロットを揃えて同意しよう',
    difficulty: 2,
  },
  {
    id: 'slide-puzzle',
    name: 'スライドパズル',
    description: 'パズルを完成させてください',
    difficulty: 3,
    timeLimit: 60,
  },
  {
    id: 'maze',
    name: '迷路',
    description: '迷路をゴールまで進もう',
    difficulty: 2,
    timeLimit: 45,
  },
  {
    id: 'memory-game',
    name: '記憶力テスト',
    description: '表示された順番を記憶してください',
    difficulty: 2,
  },
  {
    id: 'reflex-test',
    name: '反射神経',
    description: '光ったボタンをすぐにクリック！',
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 'math-quiz',
    name: '計算問題',
    description: '簡単な算数の答えを入力してください',
    difficulty: 1,
    timeLimit: 20,
  },
  {
    id: 'long-press',
    name: '長押し',
    description: 'ボタンを3秒間長押ししてください',
    difficulty: 1,
  },
  {
    id: 'two-choice-quiz',
    name: '二択クイズ',
    description: '正しい答えを選んでください',
    difficulty: 1,
  },
  {
    id: 'color-match',
    name: '色合わせ',
    description: '指定された色を選択してください',
    difficulty: 1,
  },
  {
    id: 'word-search',
    name: '文字探し',
    description: '「同意する」という文字を探してください',
    difficulty: 2,
    timeLimit: 20,
  },
  {
    id: 'drag-drop',
    name: 'ドラッグ&ドロップ',
    description: '要素を正しい位置に配置してください',
    difficulty: 2,
  },
  {
    id: 'rhythm-game',
    name: '音ゲー',
    description: 'タイミングよくボタンを押そう',
    difficulty: 3,
    timeLimit: 30,
  },
  {
    id: 'dodge-game',
    name: '避けゲー',
    description: '障害物を避けながら進もう',
    difficulty: 2,
    timeLimit: 25,
  },
  {
    id: 'clicker',
    name: 'クリッカー',
    description: '40回クリックしてください',
    difficulty: 1,
  },
  {
    id: 'chess-board',
    name: 'チェス盤',
    description: '指定されたマスをクリックしてください',
    difficulty: 2,
  },
  {
    id: 'final-challenge',
    name: '最終試練',
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
 * プレイ順のゲーム一覧を作成
 */
export function createGameSequence(
  games: MiniGame[] = ALL_MINI_GAMES,
  totalGames: number = GAME_CONSTANTS.ACTIVE_GAMES
): MiniGame[] {
  const initial = games.find((game) => game.id === "basic-agree");
  const rest = games.filter((game) => game.id !== "basic-agree");
  const shuffled = shuffleGames(rest);
  const sequence = initial ? [initial, ...shuffled] : shuffled;

  return sequence.slice(0, totalGames);
}

/**
 * 初期ゲーム状態を作成
 */
export function createInitialGameState(
  games: MiniGame[] = ALL_MINI_GAMES,
  totalGames: number = GAME_CONSTANTS.ACTIVE_GAMES
): GameState {
  const gameSequence = createGameSequence(games, totalGames);

  return {
    status: 'idle',
    currentGameIndex: 0,
    currentLife: GAME_CONSTANTS.MAX_LIFE,
    maxLife: GAME_CONSTANTS.MAX_LIFE,
    totalGames: gameSequence.length,
    gameSequence,
    clearedGames: [],
    failedAttempts: 0,
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
  return state.currentLife <= 0;
}

/**
 * 次のゲームに進む
 */
export function proceedToNextGame(
  state: GameState,
  games: MiniGame[]
): GameState {
  const gameList = games.length > 0 ? games : state.gameSequence;
  const nextIndex = state.currentGameIndex + 1;
  
  if (nextIndex >= gameList.length) {
    return {
      ...state,
      status: 'cleared',
    };
  }

  return {
    ...state,
    currentGameIndex: nextIndex,
    failedAttempts: 0,
    status: 'playing',
  };
}

/**
 * ゲームに失敗した時の処理
 */
export function handleGameFailure(state: GameState): GameState {
  const newLives = state.currentLife - 1;
  const newFailedAttempts = state.failedAttempts + 1;

  if (newLives <= 0) {
    return {
      ...state,
      currentLife: newLives,
      failedAttempts: newFailedAttempts,
      status: 'game-over',
    };
  }

  return {
    ...state,
    currentLife: newLives,
    failedAttempts: newFailedAttempts,
    status: 'waiting-nfc', // NFC再読み込み待ちに戻る
  };
}

/**
 * ゲームに成功した時の処理
 */
export function handleGameSuccess(
  state: GameState,
  gameId: MiniGame['id']
): GameState {
  const clearedGames = state.clearedGames.includes(gameId)
    ? state.clearedGames
    : [...state.clearedGames, gameId];

  return {
    ...state,
    clearedGames,
  };
}
