const menuItems = [
  {
    title: "利用者一覧",
    description: "登録利用者の基本情報と受給者証情報を確認する",
    icon: "👥",
  },
  {
    title: "インテイク",
    description: "新規利用者の受付情報とアセスメントを登録する",
    icon: "📋",
  },
  {
    title: "個別支援計画",
    description: "利用者ごとの支援計画を作成・更新・署名管理する",
    icon: "📝",
  },
  {
    title: "支援記録",
    description: "日々の支援内容・バイタル・特記事項を記録する",
    icon: "📒",
  },
  {
    title: "モニタリング",
    description: "計画の進捗状況と目標達成度を定期評価する",
    icon: "📊",
  },
  {
    title: "月次集計",
    description: "月ごとの利用実績と出勤状況を集計する",
    icon: "🗂️",
  },
];

const statusItems = [
  {
    label: "バックエンド",
    value: "接続確認済み",
    tone: "ok",
  },
  {
    label: "データベース",
    value: "起動中",
    tone: "ok",
  },
  {
    label: "請求機能",
    value: "v1で実装予定",
    tone: "pending",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 text-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-2xl font-bold tracking-wide">福祉業務システム</h1>
          <p className="mt-1 text-sm text-slate-300">
            就労継続支援B型＋自立訓練（生活訓練）
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            利用者情報、計画、記録、モニタリング、月次集計を一元管理するための業務画面
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-slate-700">業務メニュー</h2>
            <span className="text-xs text-slate-500">v1 スコープ</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <button
                key={item.title}
                type="button"
                className="group flex cursor-pointer flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-base font-bold text-slate-800">{item.title}</span>
                  <span className="text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-slate-900">
                  開く
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-base font-semibold text-slate-700">システム状況</h2>

          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {statusItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span
                  className={
                    "inline-flex items-center gap-2 text-sm font-medium " +
                    (item.tone === "ok" ? "text-emerald-700" : "text-amber-700")
                  }
                >
                  <span
                    aria-hidden
                    className={
                      "inline-block h-2 w-2 rounded-full " +
                      (item.tone === "ok" ? "bg-emerald-500" : "bg-amber-500")
                    }
                  />
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <span>© 2026 福祉業務システム</span>
          <span>内部業務利用</span>
        </div>
      </footer>
    </div>
  );
}