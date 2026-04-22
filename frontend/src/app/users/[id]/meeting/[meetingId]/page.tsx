import Link from "next/link";
import { findUserById } from "@/data/users";
import { getServiceMeeting, type BackendServiceMeeting } from "@/lib/api";

function Value({ value }: { value: string | null | undefined }) {
  const v = (value ?? "").trim();
  if (v.length === 0) {
    return <span className="text-slate-400">—</span>;
  }
  return <span className="whitespace-pre-wrap break-words">{v}</span>;
}

function Row({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={
        (full ? "md:col-span-12" : "md:col-span-6") +
        " grid grid-cols-[7rem_1fr] items-start gap-2 text-sm"
      }
    >
      <dt className="text-xs text-slate-500 pt-0.5">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  );
}

function formatAttendance(v: boolean | null): string {
  if (v === true) return "出席";
  if (v === false) return "欠席";
  return "未記入";
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

async function loadMeeting(
  meetingId: number,
): Promise<{ meeting: BackendServiceMeeting | null; error: string | null }> {
  try {
    const meeting = await getServiceMeeting(meetingId);
    return { meeting, error: null };
  } catch {
    return {
      meeting: null,
      error: "会議記録の取得に失敗しました。通信状況を確認してください。",
    };
  }
}

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const { id, meetingId } = await params;
  const user = findUserById(id);
  const parsed = Number.parseInt(meetingId, 10);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="max-w-6xl mx-auto px-6 py-10">
          <section className="bg-white border border-slate-200 rounded-lg p-8 text-center">
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
  const listHref = `/users/${lowerId}/meeting`;
  const userDetailHref = `/users/${lowerId}`;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="max-w-6xl mx-auto px-6 py-10">
          <section className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-sm text-slate-500 mb-6">
              不正な会議IDです。
            </p>
            <Link
              href={listHref}
              className="inline-flex items-center gap-1 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
            >
              <span aria-hidden>←</span>
              会議一覧へ戻る
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const { meeting, error } = await loadMeeting(parsed);

  if (!meeting) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-slate-800 text-white border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-bold tracking-wide">
              サービス担当者会議 詳細
            </h1>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-10 space-y-4">
          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <section className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <div className="text-4xl mb-3" aria-hidden>
              🔍
            </div>
            <p className="text-sm text-slate-500 mb-6">
              会議記録が見つかりませんでした（ID: {meetingId}）。
            </p>
            <Link
              href={listHref}
              className="inline-flex items-center gap-1 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
            >
              <span aria-hidden>←</span>
              会議一覧へ戻る
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const title =
    meeting.meeting_title?.trim() ||
    (meeting.agenda?.trim()?.split(/\r?\n/)[0] ?? "").trim() ||
    "（件名未入力）";

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
            <Link
              href={listHref}
              className="hover:text-white hover:underline"
            >
              サービス担当者会議
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200 truncate max-w-[20ch]">
              {title}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">{title}</h1>
          <p className="text-xs text-slate-400 mt-1 tabular-nums">
            会議ID: {meeting.id} ／ 登録: {formatDateTime(meeting.created_at)}
            {meeting.updated_at !== meeting.created_at
              ? ` ／ 更新: ${formatDateTime(meeting.updated_at)}`
              : ""}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-sm">
            <Link
              href={listHref}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <span aria-hidden>←</span>
              会議一覧へ戻る
            </Link>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <Link
              href={userDetailHref}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              利用者詳細へ
            </Link>
          </div>
        </div>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            開催情報
          </h2>
          <dl className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
            <Row label="利用者">
              <Value value={user.name} />
            </Row>
            <Row label="サービス種別">
              <Value value={meeting.service_type} />
            </Row>
            <Row label="会議名" full>
              <Value value={meeting.meeting_title ?? title} />
            </Row>
            <Row label="開催日">
              <span className="tabular-nums">
                {meeting.meeting_date}
                {meeting.meeting_time ? ` ${meeting.meeting_time}` : ""}
              </span>
            </Row>
            <Row label="開催場所">
              <Value value={meeting.meeting_place} />
            </Row>
            <Row label="参加者" full>
              <Value value={meeting.attendees} />
            </Row>
            <Row label="本人出席">
              {formatAttendance(meeting.user_attended)}
            </Row>
            <Row label="次回開催予定">
              <span className="tabular-nums">
                {meeting.next_scheduled_date ?? "—"}
              </span>
            </Row>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            協議内容
          </h2>
          <dl className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
            <Row label="議題" full>
              <Value value={meeting.agenda} />
            </Row>
            <Row label="現状確認" full>
              <Value value={meeting.status_check} />
            </Row>
            <Row label="課題" full>
              <Value value={meeting.issues} />
            </Row>
            <Row label="協議内容" full>
              <Value value={meeting.discussion} />
            </Row>
            <Row label="決定事項" full>
              <Value value={meeting.decision} />
            </Row>
            <Row label="今後の支援方針" full>
              <Value value={meeting.next_policy} />
            </Row>
            <Row label="次回までの対応" full>
              <Value value={meeting.next_action} />
            </Row>
            <Row label="備考" full>
              <Value value={meeting.note} />
            </Row>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            本人確認
          </h2>
          <dl className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
            <Row label="本人署名">
              <Value value={meeting.user_signature} />
            </Row>
            <Row label="本人印">
              <Value value={meeting.user_seal} />
            </Row>
          </dl>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            支援者確認
          </h2>
          <dl className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
            <Row label="支援者署名">
              <Value value={meeting.staff_signature} />
            </Row>
            <Row label="支援者印">
              <Value value={meeting.staff_seal} />
            </Row>
          </dl>
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
