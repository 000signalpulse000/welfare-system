"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { findUserById } from "@/data/users";
import {
  createMonitoring,
  MonitoringInput,
  type MonitoringDraft,
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

const progressOptions = [
  "達成",
  "概ね達成",
  "一部達成",
  "未達成",
  "計画見直しが必要",
] as const;

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

export default function UserMonitoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = findUserById(id);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
              <span className="text-slate-200">モニタリング</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">モニタリング</h1>
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

  const handleReset = () => {
    formRef.current?.reset();
    setSaveStatus("idle");
    setMessage(null);
  };

  const handleApplyDraft = (draft: MonitoringDraft) => {
    const form = formRef.current;
    setFormFieldValue(form, "monitoringDate", draft.monitoring_date);
    // staff_name is read-only on this form; skip overwriting.
    setFormFieldValue(form, "longTermStatus", draft.long_term_status);
    setFormFieldValue(form, "shortTermStatus", draft.short_term_status);
    setFormFieldValue(form, "longTermProgress", draft.long_term_progress);
    setFormFieldValue(form, "shortTermProgress", draft.short_term_progress);
    setFormFieldValue(form, "userCondition", draft.user_condition);
    setFormFieldValue(form, "issues", draft.issues);
    setFormFieldValue(form, "nextPlan", draft.next_plan);
    setFormFieldValue(form, "note", draft.note);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const monitoringDate = (data.get("monitoringDate") as string | null) ?? "";
    const periodStart = (data.get("periodStart") as string | null) ?? "";
    const periodEnd = (data.get("periodEnd") as string | null) ?? "";
    const signature = ((data.get("signature") as string | null) ?? "").trim();
    const signedDate = (data.get("signatureDate") as string | null) ?? "";

    if (
      !monitoringDate ||
      !periodStart ||
      !periodEnd ||
      !signature ||
      !signedDate
    ) {
      setSaveStatus("failed");
      setMessage("必須項目（日付・本人署名）を入力してください");
      return;
    }
    if (periodEnd < periodStart) {
      setSaveStatus("failed");
      setMessage("評価対象期間の終了日は開始日以降にしてください");
      return;
    }

    const payload: MonitoringInput = {
      user_id: user.id,
      service_type: user.service,
      monitoring_date: monitoringDate,
      staff_name: emptyToNull(data.get("monitoringStaff")) ?? user.staff,
      period_start: periodStart,
      period_end: periodEnd,
      long_term_status: emptyToNull(data.get("longTermStatus")),
      short_term_status: emptyToNull(data.get("shortTermStatus")),
      long_term_progress: emptyToNull(data.get("longTermProgress")),
      short_term_progress: emptyToNull(data.get("shortTermProgress")),
      user_condition: emptyToNull(data.get("userCondition")),
      issues: emptyToNull(data.get("issues")),
      next_plan: emptyToNull(data.get("nextPlan")),
      note: emptyToNull(data.get("note")),
      user_signature: signature,
      seal_note: emptyToNull(data.get("seal")),
      signed_date: signedDate,
    };

    setSaveStatus("saving");
    setMessage("保存中…");
    try {
      const saved = await createMonitoring(payload);
      setSaveStatus("saved");
      setMessage(`保存しました（ID: ${saved.id}）`);
      form.reset();
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
            <span className="text-slate-200">モニタリング</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">モニタリング</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            利用者の状況変化と目標進捗を確認する画面
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
          {message && (
            <span
              role="status"
              className={`text-xs rounded-full border px-3 py-1 ${statusClass}`}
            >
              {message}
            </span>
          )}
        </div>

        <ImportPanel<MonitoringDraft>
          screenType="monitoring"
          onApply={handleApplyDraft}
        />

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              基本情報
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="mon-user" label="利用者名">
                <input
                  id="mon-user"
                  name="userName"
                  type="text"
                  readOnly
                  defaultValue={user.name}
                  className={inputBase + " bg-slate-50 text-slate-700"}
                />
              </Field>
              <Field id="mon-service" label="サービス種別">
                <input
                  id="mon-service"
                  name="service"
                  type="text"
                  readOnly
                  defaultValue={user.service}
                  className={inputBase + " bg-slate-50 text-slate-700"}
                />
              </Field>
              <Field id="mon-date" label="モニタリング実施日" required>
                <input
                  id="mon-date"
                  name="monitoringDate"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="mon-staff" label="実施職員">
                <input
                  id="mon-staff"
                  name="monitoringStaff"
                  type="text"
                  readOnly
                  defaultValue={user.staff}
                  className={inputBase + " bg-slate-50 text-slate-700"}
                />
              </Field>
              <Field id="mon-period-start" label="評価対象期間（開始日）" required>
                <input
                  id="mon-period-start"
                  name="periodStart"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="mon-period-end" label="評価対象期間（終了日）" required>
                <input
                  id="mon-period-end"
                  name="periodEnd"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              目標進捗
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="mon-long-status" label="長期目標の進捗（区分）">
                <select
                  id="mon-long-status"
                  name="longTermStatus"
                  defaultValue=""
                  className={inputBase}
                >
                  <option value="">（未選択）</option>
                  {progressOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="mon-short-status" label="短期目標の進捗（区分）">
                <select
                  id="mon-short-status"
                  name="shortTermStatus"
                  defaultValue=""
                  className={inputBase}
                >
                  <option value="">（未選択）</option>
                  {progressOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="mon-long-detail"
                label="長期目標の進捗"
                full
                hint="計画に掲げた長期目標に対する進捗・変化を具体的に記載します。"
              >
                <textarea
                  id="mon-long-detail"
                  name="longTermProgress"
                  rows={4}
                  placeholder="例: 日中活動への参加が安定。生活リズムが整ってきている。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="mon-short-detail"
                label="短期目標の進捗"
                full
                hint="各短期目標に対する達成状況・残課題を記載します。"
              >
                <textarea
                  id="mon-short-detail"
                  name="shortTermProgress"
                  rows={4}
                  placeholder="例: 朝の通所が週3回定着。PC訓練は基本操作を習得。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              利用者の状況と今後の方針
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field
                id="mon-condition"
                label="本人の様子"
                full
                hint="体調・気分・人間関係・生活面など、期間中に観察された本人の様子を記載します。"
              >
                <textarea
                  id="mon-condition"
                  name="userCondition"
                  rows={4}
                  placeholder="例: 体調安定。他利用者と挨拶を交わすなど関わりが広がってきている。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="mon-issues"
                label="課題・留意点"
                full
                hint="支援上のリスク・今後注意して観察すべき点を記載します。"
              >
                <textarea
                  id="mon-issues"
                  name="issues"
                  rows={4}
                  placeholder="例: 疲労蓄積時に欠席傾向。通所ペースの継続配慮が必要。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="mon-next-plan"
                label="今後の支援方針"
                full
                hint="次期に向けた支援の方向性・強化点・変更点を記載します。"
              >
                <textarea
                  id="mon-next-plan"
                  name="nextPlan"
                  rows={4}
                  placeholder="例: 通所日数は現状維持。作業種目を段階的に広げていく。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="mon-note" label="備考" full>
                <textarea
                  id="mon-note"
                  name="note"
                  rows={3}
                  placeholder="例: 家族・関係機関との情報共有事項 など"
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
              <Field id="mon-signature" label="本人署名" required>
                <input
                  id="mon-signature"
                  name="signature"
                  type="text"
                  autoComplete="off"
                  placeholder="利用者本人による署名"
                  required
                  className={inputBase}
                />
              </Field>
              <Field id="mon-sign-date" label="署名日" required>
                <input
                  id="mon-sign-date"
                  name="signatureDate"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field
                id="mon-seal"
                label="捺印"
                full
                hint="紙面運用時は右の枠内に押印してください。"
              >
                <div className="flex items-center gap-3">
                  <input
                    id="mon-seal"
                    name="seal"
                    type="text"
                    autoComplete="off"
                    placeholder="（備考：押印済み／後日 など）"
                    className={inputBase + " flex-1"}
                  />
                  <div
                    role="img"
                    aria-label="捺印欄"
                    className="shrink-0 flex items-center justify-center h-16 w-16 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400 select-none"
                  >
                    印
                  </div>
                </div>
              </Field>
            </div>
          </section>

          <div className="flex items-center justify-between flex-wrap gap-2 bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              保存するとサーバー（PostgreSQL）に登録されます。
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
