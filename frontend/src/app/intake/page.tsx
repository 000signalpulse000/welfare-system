import Link from "next/link";

const consultationRoutes = [
  "本人",
  "家族",
  "相談支援事業所",
  "医療機関",
  "その他",
] as const;

function Field({
  id,
  label,
  required,
  children,
  hint,
  full,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-12" : "md:col-span-6"}>
      <label
        htmlFor={id}
        className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1"
      >
        <span>{label}</span>
        {required && (
          <span className="text-[10px] text-rose-600 font-semibold">必須</span>
        )}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400";

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white hover:underline">
              ホーム
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200">インテイク</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">インテイク</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            新規利用者の受付情報と相談内容を確認する画面
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            トップへ戻る
          </Link>
          <span className="text-xs text-slate-500">v1（保存機能は準備中）</span>
        </div>

        <form className="space-y-6">
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              基本情報
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="intake-name" label="氏名" required>
                <input
                  id="intake-name"
                  name="name"
                  type="text"
                  autoComplete="off"
                  placeholder="例: 佐藤 健一"
                  className={inputBase}
                />
              </Field>
              <Field id="intake-kana" label="フリガナ">
                <input
                  id="intake-kana"
                  name="kana"
                  type="text"
                  autoComplete="off"
                  placeholder="例: サトウ ケンイチ"
                  className={inputBase}
                />
              </Field>
              <Field id="intake-dob" label="生年月日">
                <input
                  id="intake-dob"
                  name="dob"
                  type="date"
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="intake-tel" label="電話番号">
                <input
                  id="intake-tel"
                  name="tel"
                  type="tel"
                  autoComplete="off"
                  placeholder="例: 090-1234-5678"
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="intake-address" label="住所" full>
                <input
                  id="intake-address"
                  name="address"
                  type="text"
                  autoComplete="off"
                  placeholder="例: 東京都○○区○○1-2-3 ○○マンション101"
                  className={inputBase}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              相談内容
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="intake-service" label="利用希望サービス" required>
                <select
                  id="intake-service"
                  name="service"
                  defaultValue=""
                  className={inputBase}
                >
                  <option value="" disabled>
                    選択してください
                  </option>
                  <option value="就労継続支援B型">就労継続支援B型</option>
                  <option value="自立訓練（生活訓練）">
                    自立訓練（生活訓練）
                  </option>
                </select>
              </Field>
              <Field id="intake-route" label="相談経路">
                <select
                  id="intake-route"
                  name="route"
                  defaultValue=""
                  className={inputBase}
                >
                  <option value="" disabled>
                    選択してください
                  </option>
                  {consultationRoutes.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="intake-memo"
                label="相談内容メモ"
                full
                hint="受付時に聞き取った主訴・ニーズ・現状・生活状況などを記録します。"
              >
                <textarea
                  id="intake-memo"
                  name="memo"
                  rows={8}
                  placeholder="例: 現在は在宅生活が中心。日中活動の場を希望。送迎可能な事業所を探している。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
            </div>
          </section>

          <div className="flex items-center justify-between flex-wrap gap-2 bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              入力内容の保存機能は v2 で対応予定です。現時点では画面確認用です。
            </p>
            <div className="flex items-center gap-2">
              <button
                type="reset"
                className="rounded-md border border-slate-300 bg-white text-sm px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                入力クリア
              </button>
              <button
                type="button"
                disabled
                aria-disabled
                title="準備中"
                className="rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 opacity-70 cursor-not-allowed"
              >
                保存（準備中）
              </button>
            </div>
          </div>
        </form>
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
