import Link from "next/link";
import { findUserById } from "@/data/users";

function Field({
  id,
  label,
  required,
  children,
  hint,
  full,
}: {
  id?: string;
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

export default async function UserMeetingPage({
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
              <span className="text-slate-200">サービス担当者会議</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">
              サービス担当者会議
            </h1>
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

  const userDetailHref = `/users/${user.id.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 flex-wrap">
            <Link href="/" className="hover:text-white hover:underline">
              ホーム
            </Link>
            <span aria-hidden>/</span>
            <Link href="/users" className="hover:text-white hover:underline">
              利用者一覧
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={userDetailHref}
              className="hover:text-white hover:underline"
            >
              {user.name}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200">サービス担当者会議</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            サービス担当者会議
          </h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            関係者間で支援方針と対応内容を整理する画面
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={userDetailHref}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <span aria-hidden>←</span>
              利用者詳細へ戻る
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link
              href="/users"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              利用者一覧へ
            </Link>
          </div>
          <span className="text-xs text-slate-500">v1(保存機能は準備中)</span>
        </div>

        <form className="space-y-6">
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              開催情報
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="meeting-user" label="利用者名">
                <input
                  id="meeting-user"
                  name="userName"
                  type="text"
                  readOnly
                  defaultValue={user.name}
                  className={inputBase + " bg-slate-50 text-slate-700"}
                />
              </Field>
              <Field id="meeting-service" label="サービス種別">
                <input
                  id="meeting-service"
                  name="service"
                  type="text"
                  defaultValue={user.service}
                  placeholder="例: 就労継続支援B型"
                  className={inputBase}
                />
              </Field>
              <Field id="meeting-date" label="開催日" required>
                <input
                  id="meeting-date"
                  name="meetingDate"
                  type="date"
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="meeting-place" label="開催場所" required>
                <input
                  id="meeting-place"
                  name="meetingPlace"
                  type="text"
                  autoComplete="off"
                  placeholder="例: 事業所 相談室／オンライン"
                  className={inputBase}
                />
              </Field>
              <Field
                id="meeting-attendees"
                label="参加者"
                full
                hint="氏名・所属・役割を1行1名または区切り文字で記載します。"
              >
                <textarea
                  id="meeting-attendees"
                  name="attendees"
                  rows={4}
                  placeholder={
                    "例:\n本人 佐藤 健一\n家族 佐藤 花子（母）\n相談支援専門員 ○○（△△相談支援事業所）\nサービス管理責任者 田中 美咲（当事業所）"
                  }
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              協議内容
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field
                id="meeting-agenda"
                label="議題"
                full
                hint="会議の目的・テーマを簡潔に記載します。"
              >
                <textarea
                  id="meeting-agenda"
                  name="agenda"
                  rows={3}
                  placeholder="例: 個別支援計画（第2期）更新の確認／通所ペースの見直しについて"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="meeting-discussion"
                label="協議内容"
                full
                hint="議題に沿って交わされた意見・発言の要点を記載します。"
              >
                <textarea
                  id="meeting-discussion"
                  name="discussion"
                  rows={6}
                  placeholder="例: 本人より、通所は継続したい意向。家族より、朝の送り出しが負担との発言。送迎時間の調整案について検討。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="meeting-decision"
                label="決定事項"
                full
                hint="合意された事項・結論を箇条書きで記載します。"
              >
                <textarea
                  id="meeting-decision"
                  name="decision"
                  rows={5}
                  placeholder={
                    "例:\n・通所は現行継続（週3回）\n・送迎時間を8:45→9:00に変更\n・次回モニタリングは3ヶ月後"
                  }
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="meeting-next-action"
                label="今後の対応"
                full
                hint="誰が・いつまでに・何を行うかを明確に記載します。"
              >
                <textarea
                  id="meeting-next-action"
                  name="nextAction"
                  rows={5}
                  placeholder={
                    "例:\n・当事業所: 計画書の差し替え案を今週中に家族へ送付\n・相談支援専門員: 次回会議日程の調整（1ヶ月以内）"
                  }
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-note" label="備考" full>
                <textarea
                  id="meeting-note"
                  name="note"
                  rows={3}
                  placeholder="例: 欠席者への情報共有方法、議事録配布先 など"
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
