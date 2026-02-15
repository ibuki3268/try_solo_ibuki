import LifeDisplay from "./components/LifeDisplay";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-[38rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:gap-12 sm:px-10 sm:py-14 lg:px-16">
        <header className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/20 text-2xl">
              ✔
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                Consent Quest
              </p>
              <h1 className="text-2xl font-semibold text-white">同意チャレンジ</h1>
            </div>
          </div>
        </header>

        <main className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-['Shippori_Mincho_B1'] font-semibold leading-[1.2] text-white sm:text-5xl">
                ボタンは、素直に押させてくれない。
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                20種類のミニゲームを突破して「同意する」ボタンへ到達。NFCで挑戦を開始し、すべてをクリアすると
                ポートフォリオへ遷移します。
              </p>
              <p className="text-sm text-emerald-200/80">ポートフォリオを覗きたい人へ。</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300 sm:w-auto">
                NFCで開始する
                <span className="text-lg transition group-hover:translate-x-1">→</span>
              </button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white sm:w-auto">
                NFCがない人はこちら
              </button>
            </div>

            <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
              <LifeDisplay current={3} max={3} />
              <div className="text-sm text-slate-300">
                成功すると次のゲームへ。
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="rounded-3xl border border-amber-200/20 bg-amber-200/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">ルール</p>
              <ul className="mt-4 space-y-3 text-sm text-amber-50/90">
                <li>・NFCで挑戦開始（または通常開始）</li>
                <li>・ミニゲームはランダム順で出題</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
