type LifeDisplayProps = {
  current: number;
  max: number;
};

export default function LifeDisplay({ current, max }: LifeDisplayProps) {
  const hearts = Array.from({ length: max }, (_, index) => index < current);

  return (
    <div className="flex items-center gap-4 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2">
      <div className="flex items-center gap-1 text-xl" aria-label={`ライフ ${current}/${max}`}>
        {hearts.map((filled, index) => (
          <span key={index} className={filled ? 'text-rose-400 drop-shadow' : 'text-slate-700'}>
            ❤
          </span>
        ))}
      </div>
      <div className="text-xs uppercase tracking-[0.28em] text-slate-300">
        LIFE {current}/{max}
      </div>
    </div>
  );
}
