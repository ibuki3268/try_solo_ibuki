import { ComponentType } from "react";
import { MiniGame, MiniGameComponentProps } from "../../types/game";
import BasicAgree from "./BasicAgree";
import Clicker from "./Clicker";
import ColorMatch from "./ColorMatch";
import EscapeButton from "./EscapeButton";
import LongPress from "./LongPress";
import MathQuiz from "./MathQuiz";
import MemoryGame from "./MemoryGame";
import RapidClick from "./RapidClick";
import ReflexTest from "./ReflexTest";
import TwoChoiceQuiz from "./TwoChoiceQuiz";
import TimingGame from "./TimingGame";
import WordSearch from "./WordSearch";
import DragDrop from "./DragDrop";
import Maze from "./Maze";
import SlotMachine from "./SlotMachine";
import SlidePuzzle from "./SlidePuzzle";

type MiniGameContainerProps = {
  game: MiniGame;
  consent: {
    article: string;
    title: string;
    items: string[];
  } | null;
  onSuccess: () => void;
  onFailure: () => void;
};

const gameComponentMap = {
  "basic-agree": BasicAgree,
  "escape-button": EscapeButton,
  "long-press": LongPress,
  "clicker": Clicker,
  "math-quiz": MathQuiz,
  "memory-game": MemoryGame,
  "reflex-test": ReflexTest,
  "two-choice-quiz": TwoChoiceQuiz,
  "color-match": ColorMatch,
  "rapid-click": RapidClick,
  "timing-game": TimingGame,
  "word-search": WordSearch,
  "drag-drop": DragDrop,
  "maze": Maze,
  "slot-machine": SlotMachine,
  "slide-puzzle": SlidePuzzle,
} as const;

export default function MiniGameContainer({
  game,
  consent,
  onSuccess,
  onFailure,
}: MiniGameContainerProps) {
  const GameComponent =
    gameComponentMap[
      game.id as keyof typeof gameComponentMap
    ] as ComponentType<MiniGameComponentProps> | undefined;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
            {consent ? `利用規約 ${consent.article}` : "Mini Game"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {consent ? consent.title : game.name}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{game.description}</p>
        </div>
        {game.timeLimit && (
          <div className="flex items-end text-xs text-slate-300">
            <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1">
              制限時間 {game.timeLimit}秒
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
        {consent && (
          <div className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-200/10 p-4 text-sm text-emerald-50">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">
              利用規約 {consent.article}
            </p>
            <p className="mt-2 text-base font-semibold text-emerald-50">
              {consent.title}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-50/90">
              {consent.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {GameComponent ? (
          <GameComponent
            onSuccess={onSuccess}
            onFailure={onFailure}
            timeLimit={game.timeLimit}
          />
        ) : (
          <div className="text-sm text-slate-300">
            このミニゲームは準備中です。
          </div>
        )}
      </div>
    </section>
  );
}
