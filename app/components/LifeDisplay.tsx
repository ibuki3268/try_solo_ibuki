type LifeDisplayProps = {
  current: number;
  max: number;
};

export default function LifeDisplay({ current, max }: LifeDisplayProps) {
  const hearts = Array.from({ length: max }, (_, index) => index < current);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-lg" aria-label={`ライフ ${current}/${max}`}>
        {hearts.map((filled, index) => (
          <span key={index} className={filled ? 'text-rose-400' : 'text-slate-600'}>
            ❤
          </span>
        ))}
      </div>
      <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
        LIFE {current}/{max}
      </div>
    </div>
  );
}
