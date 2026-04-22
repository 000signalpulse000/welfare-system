"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { findUserById } from "@/data/users";
import {
  createSupportPlan,
  SupportPlanInput,
  type SupportPlanDraft,
} from "@/lib/api";
import ImportPanel from "@/components/ImportPanel";

const MAX_SHORT_TERM_GOALS = 6;
const INITIAL_SHORT_TERM_GOALS = 3;

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

function createEmptyShortTermGoals(): string[] {
  return Array.from({ length: INITIAL_SHORT_TERM_GOALS }, () => "");
}

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

export default function UserPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = findUserById(id);

  const [shortTermGoals, setShortTermGoals] = useState<string[]>(
    createEmptyShortTermGoals
  );
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
              <span className="text-slate-200">個別支援計画</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">個別支援計画</h1>
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

  const handleShortTermGoalChange = (index: number, value: string) => {
    setShortTermGoals((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddShortTermGoal = () => {
    setShortTermGoals((prev) =>
      prev.length >= MAX_SHORT_TERM_GOALS ? prev : [...prev, ""]
    );
  };

  const handleRemoveShortTermGoal = (index: number) => {
    setShortTermGoals((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const canAddShortTermGoal = shortTermGoals.length < MAX_SHORT_TERM_GOALS;

  const handleReset = () => {
    setShortTermGoals(createEmptyShortTermGoals());
    setSaveStatus("idle");
    setMessage(null);
  };

  const handleApplyDraft = (draft: SupportPlanDraft) => {
    const form = formRef.current;
    setFormFieldValue(form, "createdAt", draft.plan_created_date);
    setFormFieldValue(form, "periodStart", draft.period_start);
    setFormFieldValue(form, "periodEnd", draft.period_end);
    setFormFieldValue(form, "longTermGoal", draft.long_term_goal);
    setFormFieldValue(form, "supportContent", draft.support_content);
    setFormFieldValue(form, "userIntention", draft.user_intention);
    setFormFieldValue(form, "note", draft.note);
    if (Array.isArray(draft.short_term_goals) && draft.short_term_goals.length > 0) {
      const trimmed = draft.short_term_goals
        .map((g) => (typeof g === "string" ? g : ""))
        .filter((g) => g.length > 0)
        .slice(0, MAX_SHORT_TERM_GOALS);
      setShortTermGoals(
        trimmed.length >= INITIAL_SHORT_TERM_GOALS
          ? trimmed
          : [
              ...trimmed,
              ...Array(INITIAL_SHORT_TERM_GOALS - trimmed.length).fill(""),
            ],
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const planCreatedDate = (data.get("createdAt") as string | null) ?? "";
    const periodStart = (data.get("periodStart") as string | null) ?? "";
    const periodEnd = (data.get("periodEnd") as string | null) ?? "";
    const signature = ((data.get("signature") as string | null) ?? "").trim();
    const signedDate = (data.get("signatureDate") as string | null) ?? "";

    if (
      !planCreatedDate ||
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
      setMessage("計画期間の終了日は開始日以降にしてください");
      return;
    }

    const cleanedShortTermGoals = shortTermGoals
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const payload: SupportPlanInput = {
      user_id: user.id,
      service_type: user.service,
      plan_created_date: planCreatedDate,
      period_start: periodStart,
      period_end: periodEnd,
      long_term_goal: emptyToNull(data.get("longTermGoal")),
      short_term_goals: cleanedShortTermGoals,
      support_content: emptyToNull(data.get("supportContent")),
      user_intention: emptyToNull(data.get("userIntention")),
      note: emptyToNull(data.get("note")),
      user_signature: signature,
      seal_note: emptyToNull(data.get("seal")),
      signed_date: signedDate,
    };

    setSaveStatus("saving");
    setMessage("保存中…");
    try {
      const saved = await createSupportPlan(payload);
      setSaveStatus("saved");
      setMessage(`保存しました（ID: ${saved.id}）`);
      form.reset();
      setShortTermGoals(createEmptyShortTermGoals());
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
            <span className="text-slate-200">個別支援計画</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">個別支援計画</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            利用者ごとの支援目標と支援内容を整理する画面
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

        <ImportPanel<SupportPlanDraft>
          screenType="support_plan"
          onApply={handleApplyDraft}
        />

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              基本情報
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field id="plan-user" label="利用者名">
                <input
                  id="plan-user"
                  name="userName"
                  type="text"
                  readOnly
                  value={user.name}
                  className={inputBase + " bg-slate-50 text-slate-700"}
                />
              </Field>
              <Field id="plan-service" label="サービス種別">
                <input
                  id="plan-service"
                  name="service"
                  type="text"
                  readOnly
                  value={user.service}
                  className={inputBase + " bg-slate-50 text-slate-700"}
                />
              </Field>
              <Field id="plan-created-at" label="計画作成日" required>
                <input
                  id="plan-created-at"
                  name="createdAt"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="plan-period-start" label="計画期間（開始日）" required>
                <input
                  id="plan-period-start"
                  name="periodStart"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="plan-period-end" label="計画期間（終了日）" required>
                <input
                  id="plan-period-end"
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
              支援目標
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field
                id="plan-long-term"
                label="長期目標"
                full
                hint="概ね1年程度の期間での到達目標を記載します。"
              >
                <textarea
                  id="plan-long-term"
                  name="longTermGoal"
                  rows={4}
                  placeholder="例: 日中活動に安定して参加し、生活リズムを整える。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>

              <div className="md:col-span-12">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span>短期目標</span>
                    <span className="text-[10px] text-slate-500">
                      （{shortTermGoals.length} / {MAX_SHORT_TERM_GOALS}）
                    </span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    概ね3〜6ヶ月の具体目標
                  </span>
                </div>
                <div className="space-y-2">
                  {shortTermGoals.map((value, index) => {
                    const inputId = `plan-short-term-${index}`;
                    return (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-1.5 text-[11px] font-semibold text-slate-600 tabular-nums">
                          {index + 1}
                        </span>
                        <input
                          id={inputId}
                          name={`shortTermGoal-${index + 1}`}
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleShortTermGoalChange(index, e.target.value)
                          }
                          placeholder={`短期目標 ${index + 1}`}
                          className={inputBase}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveShortTermGoal(index)}
                          disabled={shortTermGoals.length <= 1}
                          className="rounded-md border border-slate-300 bg-white text-xs text-slate-600 px-2 py-2 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`短期目標 ${index + 1} を削除`}
                          title="削除"
                        >
                          削除
                        </button>
                      </div>
                    );
                  })}
                </div>
                {canAddShortTermGoal && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleAddShortTermGoal}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white text-sm text-slate-700 px-3 py-1.5 hover:bg-slate-50"
                    >
                      <span aria-hidden>＋</span>
                      短期目標を追加
                    </button>
                  </div>
                )}
                <p className="mt-2 text-[11px] text-slate-500">
                  最大{MAX_SHORT_TERM_GOALS}件まで追加できます。空欄は保存時に除外されます。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              支援内容・本人意向
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
              <Field
                id="plan-support"
                label="支援内容"
                full
                hint="目標達成のための具体的な支援方法・頻度・体制を記載します。"
              >
                <textarea
                  id="plan-support"
                  name="supportContent"
                  rows={5}
                  placeholder="例: 週3回の通所支援。PC訓練・軽作業を中心に実施。送迎あり。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field
                id="plan-intention"
                label="本人意向"
                full
                hint="本人の希望・意向を本人の言葉に近い形で記載します。"
              >
                <textarea
                  id="plan-intention"
                  name="userIntention"
                  rows={4}
                  placeholder="例: 決まった時間に通所して、作業に慣れていきたい。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
              <Field id="plan-note" label="備考" full>
                <textarea
                  id="plan-note"
                  name="note"
                  rows={3}
                  placeholder="例: 家族との連絡事項、体調面の留意点 など"
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
              <Field id="plan-signature" label="本人署名" required>
                <input
                  id="plan-signature"
                  name="signature"
                  type="text"
                  autoComplete="off"
                  placeholder="利用者本人による署名"
                  required
                  className={inputBase}
                />
              </Field>
              <Field id="plan-sign-date" label="署名日" required>
                <input
                  id="plan-sign-date"
                  name="signatureDate"
                  type="date"
                  required
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field
                id="plan-seal"
                label="捺印"
                full
                hint="紙面運用時は右の枠内に押印してください。"
              >
                <div className="flex items-center gap-3">
                  <input
                    id="plan-seal"
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
