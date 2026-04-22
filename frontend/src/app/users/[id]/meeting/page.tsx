import Link from "next/link";
import { findUserById } from "@/data/users";
import { listServiceMeetings, type BackendServiceMeeting } from "@/lib/api";

function countAttendees(attendees: string | null): number {
  if (!attendees) return 0;
  return attendees
    .split(/\r?\n|、|,|・/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;
}

function formatDate(value: string): string {
  return value;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return value;
  }
}

async function loadMeetings(
  userId: string,
): Promise<{ items: BackendServiceMeeting[]; error: string | null }> {
  try {
    const items = await listServiceMeetings(userId);
    return { items, error: null };
  } catch {
    return {
      items: [],
      error: "会議一覧の取得に失敗しました。通信状況を確認してください。",
    };
  }
}

export default async function MeetingListPage({
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
              <Link href="/users" className="hover:text-white hover:underline">
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
      </div>
    );
  }

  const lowerId = user.id.toLowerCase();
  const userDetailHref = `/users/${lowerId}`;
  const newHref = `/users/${lowerId}/meeting/new`;
  const { items, error } = await loadMeetings(user.id);

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
            関係者間で支援方針と対応内容を整理した会議記録の一覧
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
          <Link
            href={newHref}
            className="inline-flex items-center gap-1 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
          >
            <span aria-hidden>＋</span>
            新規作成
          </Link>
        </div>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-slate-700">
              会議一覧
            </h2>
            <span className="text-xs text-slate-500">
              {items.length} 件 / 開催日の新しい順
            </span>
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {items.length === 0 && !error ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <div className="text-3xl mb-2" aria-hidden>
                🗒
              </div>
              <p className="text-sm text-slate-600 mb-4">
                会議記録はまだ登録されていません。
              </p>
              <Link
                href={newHref}
                className="inline-flex items-center gap-1 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
              >
                <span aria-hidden>＋</span>
                最初の会議を登録
              </Link>
            </div>
          ) : (
            <ul className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
              {items.map((m) => {
                const detailHref = `/users/${lowerId}/meeting/${m.id}`;
                const title =
                  m.meeting_title?.trim() ||
                  (m.agenda?.trim()?.split(/\r?\n/)[0] ?? "").trim() ||
                  "（件名未入力）";
                const attendeeCount = countAttendees(m.attendees);
                return (
                  <li key={m.id}>
                    <Link
                      href={detailHref}
                      className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="col-span-12 sm:col-span-3 text-sm">
                        <div className="text-xs text-slate-500">開催日</div>
                        <div className="tabular-nums text-slate-800">
                          {formatDate(m.meeting_date)}
                          {m.meeting_time ? ` ${m.meeting_time}` : ""}
                        </div>
                      </div>
                      <div className="col-span-12 sm:col-span-5 text-sm">
                        <div className="text-xs text-slate-500">会議名</div>
                        <div className="text-slate-900 font-medium truncate">
                          {title}
                        </div>
                      </div>
                      <div className="col-span-6 sm:col-span-2 text-sm">
                        <div className="text-xs text-slate-500">参加者</div>
                        <div className="text-slate-700 tabular-nums">
                          {attendeeCount > 0 ? `${attendeeCount} 名` : "—"}
                        </div>
                      </div>
                      <div className="col-span-6 sm:col-span-2 text-sm text-right">
                        <div className="text-xs text-slate-500">最終更新</div>
                        <div className="text-slate-700 text-xs tabular-nums">
                          {formatDateTime(m.updated_at)}
                        </div>
                      </div>
                      <div className="col-span-12 text-right text-xs text-slate-500 hover:text-slate-800">
                        詳細を見る →
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
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
