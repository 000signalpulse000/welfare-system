"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createIntakeRecord, IntakeRecordInput } from "@/lib/api";

const consultationRoutes = [
  "本人",
  "家族",
  "相談支援事業所",
  "医療機関",
  "その他",
] as const;

type SaveStatus = "idle" | "saving" | "saved" | "failed";

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

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : null;
}

export default function IntakePage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get("name") as string | null)?.trim() ?? "";
    const desiredService = (data.get("desired_service") as string | null) ?? "";

    if (name.length === 0) {
      setSaveStatus("failed");
      setMessage("氏名は必須です");
      return;
    }
    if (desiredService.length === 0) {
      setSaveStatus("failed");
      setMessage("利用希望サービスを選択してください");
      return;
    }

    const payload: IntakeRecordInput = {
      name,
      kana: emptyToNull(data.get("kana")),
      birth_date: emptyToNull(data.get("birth_date")),
      phone: emptyToNull(data.get("phone")),
      address: emptyToNull(data.get("address")),
      desired_service: desiredService,
      consultation_route: emptyToNull(data.get("consultation_route")),
      consultation_memo: emptyToNull(data.get("consultation_memo")),
    };

    setSaveStatus("saving");
    setMessage("保存中…");
    try {
      const saved = await createIntakeRecord(payload);
      setSaveStatus("saved");
      setMessage(`保存しました（ID: ${saved.id}）`);
      form.reset();
    } catch {
      setSaveStatus("failed");
      setMessage("保存に失敗しました。通信状況を確認してください。");
    }
  };

  const handleReset = () => {
    formRef.current?.reset();
    setSaveStatus("idle");
    setMessage(null);
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            トップへ戻る
          </Link>
          {message && (
            <span
              role="status"
              className={`text-xs rounded-full border px-3 py-1 ${statusClass}`}
            >
              {message}
            </span>
          )}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onReset={handleReset}
          className="space-y-6"
        >
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
                  required
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
                  name="birth_date"
                  type="date"
                  className={inputBase + " tabular-nums"}
                />
              </Field>
              <Field id="intake-tel" label="電話番号">
                <input
                  id="intake-tel"
                  name="phone"
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
                  name="desired_service"
                  defaultValue=""
                  className={inputBase}
                  required
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
                  name="consultation_route"
                  defaultValue=""
                  className={inputBase}
                >
                  <option value="">（未選択）</option>
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
                  name="consultation_memo"
                  rows={8}
                  placeholder="例: 現在は在宅生活が中心。日中活動の場を希望。送迎可能な事業所を探している。"
                  className={inputBase + " leading-relaxed"}
                />
              </Field>
            </div>
          </section>

          <div className="flex items-center justify-between flex-wrap gap-2 bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">
              保存するとサーバー（PostgreSQL）に登録されます。
            </p>
            <div className="flex items-center gap-2">
              <button
                type="reset"
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
