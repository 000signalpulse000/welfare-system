"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { findUserById } from "@/data/users";
import {
  createServiceMeeting,
  type ServiceMeetingInput,
  type ServiceMeetingDraft,
} from "@/lib/api";
import ImportPanel from "@/components/ImportPanel";

type SaveStatus = "idle" | "saving" | "saved" | "failed";

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

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : null;
}

function setFormFieldValue(
  form: HTMLFormElement | null,
  name: string,
  value: string | null | undefined,
) {
  if (!form) return;
  if (value == null) return;
  const el = form.elements.namedItem(name) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null;
  if (!el) return;
  el.value = value;
}

function setRadioValue(
  form: HTMLFormElement | null,
  name: string,
  value: string,
) {
  if (!form) return;
  const inputs = form.querySelectorAll<HTMLInputElement>(
    `input[type="radio"][name="${name}"]`,
  );
  inputs.forEach((el) => {
    el.checked = el.value === value;
  });
}

export default function MeetingNewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = findUserById(id);
  const router = useRouter();

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-slate-800 text-white border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-bold tracking-wide">
              サービス担当者会議
            </h1>
          </div>
        </header>
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
  const userDetailHref = `/users/${lowerId}`;
  const listHref = `/users/${lowerId}/meeting`;

  const handleReset = () => {
    formRef.current?.reset();
    setSaveStatus("idle");
    setMessage(null);
  };

  const handleApplyDraft = (draft: ServiceMeetingDraft) => {
    const form = formRef.current;
    setFormFieldValue(form, "meetingTitle", draft.meeting_title);
    setFormFieldValue(form, "meetingDate", draft.meeting_date);
    setFormFieldValue(form, "meetingTime", draft.meeting_time);
    setFormFieldValue(form, "meetingPlace", draft.meeting_place);
    setFormFieldValue(form, "attendees", draft.attendees);
    setFormFieldValue(form, "agenda", draft.agenda);
    setFormFieldValue(form, "statusCheck", draft.status_check);
    setFormFieldValue(form, "issues", draft.issues);
    setFormFieldValue(form, "discussion", draft.discussion);
    setFormFieldValue(form, "decision", draft.decision);
    setFormFieldValue(form, "nextPolicy", draft.next_policy);
    setFormFieldValue(form, "nextAction", draft.next_action);
    setFormFieldValue(form, "nextScheduledDate", draft.next_scheduled_date);
    setFormFieldValue(form, "note", draft.note);
    setFormFieldValue(form, "userSignature", draft.user_signature);
    setFormFieldValue(form, "userSeal", draft.user_seal);
    setFormFieldValue(form, "staffSignature", draft.staff_signature);
    setFormFieldValue(form, "staffSeal", draft.staff_seal);
    if (draft.user_attended === true) setRadioValue(form, "userAttended", "yes");
    else if (draft.user_attended === false)
      setRadioValue(form, "userAttended", "no");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const meetingDate = (data.get("meetingDate") as string | null) ?? "";
    const meetingPlace = ((data.get("meetingPlace") as string | null) ?? "").trim();
    const serviceType = ((data.get("service") as string | null) ?? "").trim();

    if (!meetingDate || !meetingPlace || !serviceType) {
      setSaveStatus("failed");
      setMessage(
        "必須項目（サービス種別・開催日・開催場所）を入力してください",
      );
      return;
    }

    const userAttendedRaw = data.get("userAttended") as string | null;
    const userAttended =
      userAttendedRaw === "yes"
        ? true
        : userAttendedRaw === "no"
          ? false
          : null;

    const payload: ServiceMeetingInput = {
      user_id: user.id,
      service_type: serviceType,
      meeting_title: emptyToNull(data.get("meetingTitle")),
      meeting_date: meetingDate,
      meeting_time: emptyToNull(data.get("meetingTime")),
      meeting_place: meetingPlace,
      attendees: emptyToNull(data.get("attendees")),
      user_attended: userAttended,
      agenda: emptyToNull(data.get("agenda")),
      status_check: emptyToNull(data.get("statusCheck")),
      issues: emptyToNull(data.get("issues")),
      discussion: emptyToNull(data.get("discussion")),
      decision: emptyToNull(data.get("decision")),
      next_policy: emptyToNull(data.get("nextPolicy")),
      next_action: emptyToNull(data.get("nextAction")),
      next_scheduled_date: emptyToNull(data.get("nextScheduledDate")),
      note: emptyToNull(data.get("note")),
      user_signature: emptyToNull(data.get("userSignature")),
      user_seal: emptyToNull(data.get("userSeal")),
      staff_signature: emptyToNull(data.get("staffSignature")),
      staff_seal: emptyToNull(data.get("staffSeal")),
    };

    setSaveStatus("saving");
    setMessage("保存中…");
    try {
      const saved = await createServiceMeeting(payload);
      setSaveStatus("saved");
      setMessage(`保存しました（ID: ${saved.id}）`);
      setTimeout(() => {
        router.push(`/users/${lowerId}/meeting/${saved.id}`);
      }, 400);
    } catch {
      setSaveStatus("failed");
      setMessage("保存に失敗しました。通信状況を確認してください。");
    }
  };

  const statusClass =
    saveStatus === "saved"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : saveStatus === "failed"
        ? "text-rose-700 bg-rose-50 border-rose-200"
        : "text-slate-600 bg-slate-100 border-slate-200";

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
            <span className="text-slate-200">新規作成</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            サービス担当者会議 新規作成
          </h1>
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
          {message && (
            <span
              role="status"
              className={`text-xs rounded-full border px-3 py-1 ${statusClass}`}
            >
              {message}
            </span>
          )}
        </div>

        <ImportPanel<ServiceMeetingDraft>
          screenType="service_meeting"
          onApply={handleApplyDraft}
        />

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
              <Field id="meeting-service" label="サービス種別" required>
                <input
                  id="meeting-service"
                  name="service"
                  type="text"
                  defaultValue={user.service}
                  placeholder="例: 就労継続支援B型"
                  required
                  className={inputBase}
                />
              </Field>
              <Field id="meeting-title" label="会議名" full>
                <input
                  id="meeting-title"
                  name="meetingTitle"
                  type="text"
                  placeholder="例: 第2期個別支援計画 更新会議"
                  className={inputBase}
                />
              </Field>
              <Field id="meeting-date" label="開催日" required>
                <input
                  id="meeting-date"
                  name="meetingDate"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="meeting-time" label="開催時刻">
                <input
                  id="meeting-time"
                  name="meetingTime"
                  type="time"
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="meeting-place" label="開催場所" required full>
                <input
                  id="meeting-place"
                  name="meetingPlace"
                  type="text"
                  autoComplete="off"
                  placeholder="例: 事業所 相談室／オンライン"
                  required
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
              <Field label="本人出席有無" full>
                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="userAttended"
                      value="yes"
                      defaultChecked
                    />
                    出席
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input type="radio" name="userAttended" value="no" />
                    欠席
                  </label>
                  <label className="inline-flex items-center gap-1 text-slate-500">
                    <input type="radio" name="userAttended" value="" />
                    未記入
                  </label>
                </div>
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              協議内容
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="meeting-agenda" label="議題" full>
                <textarea
                  id="meeting-agenda"
                  name="agenda"
                  rows={3}
                  placeholder="例: 個別支援計画（第2期）更新の確認／通所ペースの見直しについて"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-status" label="現状確認" full>
                <textarea
                  id="meeting-status"
                  name="statusCheck"
                  rows={4}
                  placeholder="例: 通所は週3日で継続中。体調・服薬は安定。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-issues" label="課題" full>
                <textarea
                  id="meeting-issues"
                  name="issues"
                  rows={4}
                  placeholder="例: 朝の送り出しが家族の負担。対人面の疲れから欠席が増加傾向。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-discussion" label="協議内容" full>
                <textarea
                  id="meeting-discussion"
                  name="discussion"
                  rows={5}
                  placeholder="例: 送迎時間の調整案、活動内容の見直しについて意見交換。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-decision" label="決定事項" full>
                <textarea
                  id="meeting-decision"
                  name="decision"
                  rows={4}
                  placeholder={
                    "例:\n・通所は現行継続（週3回）\n・送迎時間を8:45→9:00に変更"
                  }
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-next-policy" label="今後の支援方針" full>
                <textarea
                  id="meeting-next-policy"
                  name="nextPolicy"
                  rows={4}
                  placeholder="例: 生活リズムの安定を最優先に、通所継続を支援。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="meeting-next-action" label="次回までの対応" full>
                <textarea
                  id="meeting-next-action"
                  name="nextAction"
                  rows={4}
                  placeholder={
                    "例:\n・当事業所: 計画書の差し替え案を今週中に家族へ送付\n・相談支援専門員: 次回会議日程の調整（1ヶ月以内）"
                  }
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="meeting-next-scheduled"
                label="次回開催予定"
              >
                <input
                  id="meeting-next-scheduled"
                  name="nextScheduledDate"
                  type="date"
                  className={inputBase + " tabular-nums"}
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

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              本人確認
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="user-signature" label="本人署名">
                <input
                  id="user-signature"
                  name="userSignature"
                  type="text"
                  placeholder="例: 佐藤 健一"
                  className={inputBase}
                />
              </Field>
              <Field id="user-seal" label="本人印" hint="印影の内容・備考">
                <input
                  id="user-seal"
                  name="userSeal"
                  type="text"
                  placeholder="例: 佐藤印（朱肉）"
                  className={inputBase + " border-dashed"}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              支援者確認
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="staff-signature" label="支援者署名">
                <input
                  id="staff-signature"
                  name="staffSignature"
                  type="text"
                  placeholder="例: 田中 美咲"
                  defaultValue={user.staff}
                  className={inputBase}
                />
              </Field>
              <Field id="staff-seal" label="支援者印" hint="印影の内容・備考">
                <input
                  id="staff-seal"
                  name="staffSeal"
                  type="text"
                  placeholder="例: 田中印（朱肉）"
                  className={inputBase + " border-dashed"}
                />
              </Field>
            </div>
          </section>

          <div className="flex items-center justify-between flex-wrap gap-2 bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              保存するとサーバー（PostgreSQL）に登録され、会議一覧から参照できます。
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-slate-300 bg-white text-sm px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                入力クリア
              </button>
              <button
                type="submit"
                disabled={saveStatus === "saving"}
                className="rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saveStatus === "saving" ? "保存中…" : "保存"}
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
