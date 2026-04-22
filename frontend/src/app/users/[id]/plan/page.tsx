"use client";

import Link from "next/link";
import { use, useState } from "react";
import { findUserById } from "@/data/users";

const MAX_SHORT_TERM_GOALS = 6;
const INITIAL_SHORT_TERM_GOALS = 3;

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
          <span className="text-xs text-slate-500">v1（保存機能は準備中）</span>
        </div>

        <form className="space-y-6">
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
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="plan-period-start" label="計画期間（開始日）" required>
                <input
                  id="plan-period-start"
                  name="periodStart"
                  type="date"
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="plan-period-end" label="計画期間（終了日）" required>
                <input
                  id="plan-period-end"
                  name="periodEnd"
                  type="date"
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
                  最大{MAX_SHORT_TERM_GOALS}件まで追加できます。
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

          <div className="flex items-center justify-between flex-wrap gap-2 bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              入力内容の保存機能は v2 で対応予定です。現時点では画面確認用です。
            </p>
            <div className="flex items-center gap-2">
              <button
                type="reset"
                onClick={() => setShortTermGoals(createEmptyShortTermGoals())}
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
