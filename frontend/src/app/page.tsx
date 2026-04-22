import Link from "next/link";

const menuItems = [
  {
    title: "利用者一覧",
    description: "登録利用者の基本情報と受給者証情報を確認する",
    icon: "👥",
    href: "/users",
  },
  {
    title: "インテイク",
    description: "新規利用者の受付情報とアセスメントを登録する",
    icon: "📋",
    href: null,
  },
  {
    title: "個別支援計画",
    description: "利用者ごとの支援計画を作成・更新・署名管理する",
    icon: "📝",
    href: null,
  },
  {
    title: "支援記録",
    description: "日々の支援内容・バイタル・特記事項を記録する",
    icon: "📒",
    href: null,
  },
  {
    title: "モニタリング",
    description: "計画の進捗状況と目標達成度を定期評価する",
    icon: "📊",
    href: null,
  },
  {
    title: "月次集計",
    description: "月ごとの利用実績と出勤状況を集計する",
    icon: "🗂️",
    href: null,
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

const cardClass =
  "group flex flex-col justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-0.5 transition-all text-left cursor-pointer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold tracking-wide">福祉業務システム</h1>
          <p className="text-sm text-slate-300 mt-1">
            就労継続支援B型＋自立訓練（生活訓練）
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            利用者情報、計画、記録、モニタリング、月次集計を一元管理するための業務画面
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-700">
              業務メニュー
            </h2>
            <span className="text-xs text-slate-500">v1 スコープ</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => {
              const inner = (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-2xl" aria-hidden>
                      {item.icon}
                    </span>
                    <span className="text-base font-bold text-slate-800">
                      {item.title}
                    </span>
                    <span className="text-sm text-slate-500 leading-relaxed">
                      {item.description}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-slate-900">
                    {item.href ? "開く" : "準備中"}
                    {item.href && (
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    )}
                  </span>
                </>
              );

              if (item.href) {
                return (
                  <Link key={item.title} href={item.href} className={cardClass}>
                    {inner}
                  </Link>
                );
              }
              return (
                <button
                  key={item.title}
                  type="button"
                  disabled
                  aria-disabled
                  className={cardClass + " opacity-70 cursor-not-allowed"}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-base font-semibold text-slate-700 mb-4">
            システム状況
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {statusItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-5 py-3"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span
                  className={
                    "inline-flex items-center gap-2 text-sm font-medium " +
                    (item.tone === "ok"
                      ? "text-emerald-700"
                      : "text-amber-700")
                  }
                >
                  <span
                    aria-hidden
                    className={
                      "inline-block h-2 w-2 rounded-full " +
                      (item.tone === "ok"
                        ? "bg-emerald-500"
                        : "bg-amber-500")
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
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-500 flex items-center justify-between">
          <span>© 2026 福祉業務システム</span>
          <span>内部業務利用</span>
        </div>
      </footer>
    </div>
  );
}
