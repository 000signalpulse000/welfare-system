import Link from "next/link";
import { findUserById, statusBadge } from "@/data/users";

type FutureEntry = {
  title: string;
  description: string;
  icon: string;
  note?: string;
  slug?: "records";
};

const futureEntries: FutureEntry[] = [
  {
    title: "インテイク",
    description: "受付時のアセスメントと基本情報の登録",
    icon: "📋",
  },
  {
    title: "個別支援計画",
    description: "長期・短期目標と支援内容の計画管理",
    icon: "📝",
  },
  {
    title: "支援記録",
    description: "日々の支援内容と特記事項を記録",
    icon: "📒",
    note: "定型文チェック入力・定型文追加保存対応予定",
    slug: "records",
  },
  {
    title: "モニタリング",
    description: "計画の進捗状況と目標達成度の定期評価",
    icon: "📊",
  },
];

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-900">{children}</dd>
    </div>
  );
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = findUserById(id);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-slate-800 text-white border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Link href="/" className="hover:text-white hover:underline">
                ホーム
              </Link>
              <span aria-hidden>/</span>
              <Link
                href="/users"
                className="hover:text-white hover:underline"
              >
                利用者一覧
              </Link>
              <span aria-hidden>/</span>
              <span className="text-slate-200">利用者詳細</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">利用者詳細</h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          <section className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-3" aria-hidden>
              🔍
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              利用者が見つかりません
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              指定されたID「{id}」に該当する利用者は登録されていません。
            </p>
            <Link
              href="/users"
              className="inline-flex items-center gap-1 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
            >
              <span aria-hidden>←</span>
              利用者一覧へ戻る
            </Link>
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white hover:underline">
              ホーム
            </Link>
            <span aria-hidden>/</span>
            <Link href="/users" className="hover:text-white hover:underline">
              利用者一覧
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200">{user.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">{user.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            ID: <span className="tabular-nums">{user.id}</span>
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/users"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            利用者一覧へ戻る
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 opacity-70 cursor-not-allowed"
            aria-disabled
            title="準備中"
          >
            <span aria-hidden>✎</span>
            編集（準備中）
          </button>
        </div>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            基本情報
          </h2>
          <dl className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            <InfoRow label="氏名">{user.name}</InfoRow>
            <InfoRow label="フリガナ">{user.kana}</InfoRow>
            <InfoRow label="サービス種別">{user.service}</InfoRow>
            <InfoRow label="担当職員">{user.staff}</InfoRow>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            利用状況
          </h2>
          <dl className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            <InfoRow label="利用状況">
              <span
                className={
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                  statusBadge[user.status]
                }
              >
                {user.status}
              </span>
            </InfoRow>
            <InfoRow label="受給者証期限">
              <span className="tabular-nums">{user.recipientCertExpiry}</span>
            </InfoRow>
          </dl>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">
              関連機能
            </h2>
            <span className="text-xs text-slate-500">v1 実装予定</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {futureEntries.map((entry) => {
              const href = entry.slug
                ? `/users/${user.id.toLowerCase()}/${entry.slug}`
                : null;
              const inner = (
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {entry.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-slate-800">
                        {entry.title}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {href ? "開く →" : "準備中"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mt-1">
                      {entry.description}
                    </p>
                    {entry.note && (
                      <span className="mt-2 inline-flex w-fit items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {entry.note}
                      </span>
                    )}
                  </div>
                </div>
              );

              if (href) {
                return (
                  <Link
                    key={entry.title}
                    href={href}
                    className="flex flex-col gap-3 bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-0.5 transition-all"
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <div
                  key={entry.title}
                  className="flex flex-col gap-3 bg-white border border-slate-200 rounded-lg p-5 opacity-90"
                >
                  {inner}
                </div>
              );
            })}
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
