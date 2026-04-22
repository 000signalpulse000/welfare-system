"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { findUserById } from "@/data/users";

type Phrase = {
  id: string;
  name: string;
  text: string;
};

type SavedRecord = {
  id: string;
  createdAt: string;
  body: string;
};

const STORAGE_KEY = "welfare:support-phrases/v1";
const DRAFT_KEY_PREFIX = "welfare:support-record-draft:";
const RECORDS_KEY_PREFIX = "welfare:support-records:";

const SAMPLE_PHRASES: Phrase[] = [
  { id: "p-sample-1", name: "PC訓練", text: "PC訓練" },
  { id: "p-sample-2", name: "ポスティング", text: "ポスティング" },
  { id: "p-sample-3", name: "清掃作業", text: "清掃作業" },
  { id: "p-sample-4", name: "広報誌作業", text: "広報誌作業" },
  { id: "p-sample-5", name: "洗車", text: "洗車" },
  { id: "p-sample-6", name: "送迎", text: "送迎" },
  { id: "p-sample-7", name: "面談", text: "面談" },
];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `p-${crypto.randomUUID()}`;
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SupportRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useMemo(() => findUserById(id), [id]);

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [recordText, setRecordText] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [recordsLoaded, setRecordsLoaded] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const draftKey = user ? `${DRAFT_KEY_PREFIX}${user.id}` : null;
  const recordsKey = user ? `${RECORDS_KEY_PREFIX}${user.id}` : null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Phrase[];
        if (Array.isArray(parsed)) {
          setPhrases(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch {
      // fall through to seeding
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PHRASES));
    setPhrases(SAMPLE_PHRASES);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
    } catch {
      // ignore quota errors for now
    }
  }, [phrases, loaded]);

  useEffect(() => {
    if (!draftKey) return;
    setDraftLoaded(false);
    try {
      const raw = localStorage.getItem(draftKey);
      setRecordText(raw ?? "");
    } catch {
      setRecordText("");
    }
    setDraftSavedAt(null);
    setDraftLoaded(true);
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !draftLoaded) return;
    try {
      if (recordText.length === 0) {
        localStorage.removeItem(draftKey);
      } else {
        localStorage.setItem(draftKey, recordText);
      }
      setDraftSavedAt(new Date());
    } catch {
      // ignore quota errors
    }
  }, [recordText, draftKey, draftLoaded]);

  useEffect(() => {
    if (!recordsKey) return;
    setRecordsLoaded(false);
    try {
      const raw = localStorage.getItem(recordsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedRecord[];
        if (Array.isArray(parsed)) {
          setSavedRecords(parsed);
          setRecordsLoaded(true);
          return;
        }
      }
    } catch {
      // fall through
    }
    setSavedRecords([]);
    setRecordsLoaded(true);
  }, [recordsKey]);

  useEffect(() => {
    if (!recordsKey || !recordsLoaded) return;
    try {
      if (savedRecords.length === 0) {
        localStorage.removeItem(recordsKey);
      } else {
        localStorage.setItem(recordsKey, JSON.stringify(savedRecords));
      }
    } catch {
      // ignore
    }
  }, [savedRecords, recordsKey, recordsLoaded]);

  const toggleChecked = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInsert = () => {
    if (checkedIds.size === 0) {
      setLastMessage("挿入する定型文を選択してください");
      return;
    }
    const selected = phrases.filter((p) => checkedIds.has(p.id));
    const insertion = selected.map((p) => p.text).join("\n");
    setRecordText((prev) =>
      prev.length === 0 ? insertion : `${prev}\n${insertion}`,
    );
    setCheckedIds(new Set());
    setLastMessage(`${selected.length} 件を記録に追加しました`);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = ta.value.length;
      }
    });
  };

  const handleAddPhrase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newName.trim();
    const text = newText.trim();
    if (!name || !text) {
      setLastMessage("定型文名と挿入文は必須です");
      return;
    }
    const phrase: Phrase = { id: createId(), name, text };
    setPhrases((prev) => [...prev, phrase]);
    setNewName("");
    setNewText("");
    setLastMessage(`「${phrase.name}」を追加しました`);
  };

  const handleSaveRecord = () => {
    const body = recordText.trim();
    if (body.length === 0) {
      setLastMessage("記録が空のため保存できません");
      return;
    }
    const record: SavedRecord = {
      id: createId().replace(/^p-/, "r-"),
      createdAt: new Date().toISOString(),
      body,
    };
    setSavedRecords((prev) => [record, ...prev]);
    setRecordText("");
    if (draftKey) {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
    }
    setDraftSavedAt(null);
    setLastMessage("記録を保存しました");
  };

  const handleLoadRecord = (id: string) => {
    const target = savedRecords.find((r) => r.id === id);
    if (!target) return;
    if (recordText.trim().length > 0) {
      const ok = window.confirm(
        "現在の入力内容を破棄して読み込みますか？",
      );
      if (!ok) return;
    }
    setRecordText(target.body);
    setLastMessage("保存済み記録を読み込みました");
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = ta.value.length;
      }
    });
  };

  const handleDeleteRecord = (id: string) => {
    const target = savedRecords.find((r) => r.id === id);
    if (!target) return;
    const ok = window.confirm("この保存済み記録を削除しますか？");
    if (!ok) return;
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
    setLastMessage("保存済み記録を削除しました");
  };

  const handleDeletePhrase = (id: string) => {
    const target = phrases.find((p) => p.id === id);
    if (!target) return;
    const ok = window.confirm(`「${target.name}」を削除しますか？`);
    if (!ok) return;
    setPhrases((prev) => prev.filter((p) => p.id !== id));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setLastMessage(`「${target.name}」を削除しました`);
  };

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
              <span className="text-slate-200">支援記録</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">支援記録</h1>
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
              href={`/users/${user.id.toLowerCase()}`}
              className="hover:text-white hover:underline"
            >
              {user.name}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200">支援記録</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">支援記録</h1>
          <p className="text-sm text-slate-300 mt-1">
            対象利用者: <span className="font-semibold">{user.name}</span>{" "}
            <span className="text-xs text-slate-400 tabular-nums">
              ({user.id})
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            日々の支援内容と特記事項を記録する画面
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <Link
              href={`/users/${user.id.toLowerCase()}`}
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              <span aria-hidden>←</span>
              利用者詳細へ戻る
            </Link>
            <Link
              href="/users"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              利用者一覧
            </Link>
          </div>
          {lastMessage && (
            <span
              role="status"
              className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1"
            >
              {lastMessage}
            </span>
          )}
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-700">
                記録内容
              </h2>
              <span className="text-xs text-slate-500">
                {recordText.length} 文字
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
              rows={14}
              placeholder="例: 午前中はPC訓練を実施。取り組み意欲が高く、集中して作業に取り組めていた。&#10;昼食後は清掃作業に従事。"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-slate-500">
                入力内容はこの端末に自動保存されます（利用者ごと）。
                {draftLoaded && draftSavedAt && recordText.length > 0 && (
                  <span className="ml-2 text-slate-400 tabular-nums">
                    最終保存 {draftSavedAt.toLocaleTimeString("ja-JP")}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setRecordText("");
                  if (draftKey) {
                    try {
                      localStorage.removeItem(draftKey);
                    } catch {
                      // ignore
                    }
                  }
                  setDraftSavedAt(null);
                  setLastMessage("下書きを消去しました");
                }}
                className="rounded-md border border-slate-300 bg-white text-sm px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                本文クリア
              </button>
                <button
                  type="button"
                  onClick={handleSaveRecord}
                  disabled={recordText.trim().length === 0}
                  className="rounded-md bg-slate-800 text-white text-sm font-medium px-3 py-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-700">
                定型文チェック
              </h2>
              <span className="text-xs text-slate-500">
                {checkedIds.size} / {phrases.length} 選択
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg">
              {!loaded ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  読み込み中…
                </div>
              ) : phrases.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  登録された定型文はありません。下の「定型文の追加」から登録してください。
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                  {phrases.map((p) => {
                    const checked = checkedIds.has(p.id);
                    return (
                      <li
                        key={p.id}
                        className="flex items-start justify-between gap-2 px-3 py-2"
                      >
                        <label className="flex items-start gap-2 text-sm text-slate-800 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChecked(p.id)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-400"
                          />
                          <span className="flex-1">
                            <span className="font-medium">{p.name}</span>
                            {p.text !== p.name && (
                              <span className="block text-xs text-slate-500 leading-snug">
                                {p.text}
                              </span>
                            )}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeletePhrase(p.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 hover:underline shrink-0"
                        >
                          削除
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCheckedIds(new Set())}
                disabled={checkedIds.size === 0}
                className="rounded-md border border-slate-300 bg-white text-sm px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                選択解除
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={checkedIds.size === 0}
                className="rounded-md bg-slate-800 text-white text-sm font-medium px-3 py-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                記録に反映
              </button>
            </div>
          </aside>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-700">
              保存済み記録
            </h2>
            <span className="text-xs text-slate-500">
              {recordsLoaded
                ? `${savedRecords.length} 件（この利用者のみ）`
                : "読み込み中…"}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg">
            {!recordsLoaded ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                読み込み中…
              </div>
            ) : savedRecords.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                保存済みの記録はまだありません。記録内容を入力し「保存」を押してください。
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {savedRecords.map((r) => {
                  const d = new Date(r.createdAt);
                  const dateLabel = isNaN(d.getTime())
                    ? r.createdAt
                    : `${d.toLocaleDateString("ja-JP")} ${d.toLocaleTimeString(
                        "ja-JP",
                      )}`;
                  const preview =
                    r.body.length > 60 ? `${r.body.slice(0, 60)}…` : r.body;
                  return (
                    <li
                      key={r.id}
                      className="flex items-start justify-between gap-3 px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 tabular-nums">
                          保存日時: {dateLabel}
                        </div>
                        <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap break-words line-clamp-2">
                          {preview}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadRecord(r.id)}
                          className="rounded-md border border-slate-300 bg-white text-xs px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                        >
                          読込
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(r.id)}
                          className="rounded-md border border-rose-200 bg-white text-xs px-3 py-1.5 text-rose-600 hover:bg-rose-50"
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            定型文の追加
          </h2>
          <form
            onSubmit={handleAddPhrase}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label
                  htmlFor="phrase-name"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  定型文名
                </label>
                <input
                  id="phrase-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例: PC訓練"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="md:col-span-8">
                <label
                  htmlFor="phrase-text"
                  className="block text-xs font-medium text-slate-600 mb-1"
                >
                  挿入文
                </label>
                <input
                  id="phrase-text"
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="例: PC訓練を実施"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                保存された定型文はこの端末のブラウザに保存されます（localStorage）。
              </p>
              <button
                type="submit"
                className="rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
              >
                追加して保存
              </button>
            </div>
          </form>
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
