"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Status = "利用中" | "体験利用" | "一時休止";
type Service = "就労継続支援B型" | "自立訓練（生活訓練）";

type User = {
  id: string;
  name: string;
  kana: string;
  service: Service;
  status: Status;
  recipientCertExpiry: string;
  staff: string;
};

const users: User[] = [
  {
    id: "U-0001",
    name: "佐藤 健一",
    kana: "サトウ ケンイチ",
    service: "就労継続支援B型",
    status: "利用中",
    recipientCertExpiry: "2027-03-31",
    staff: "田中 美咲",
  },
  {
    id: "U-0002",
    name: "鈴木 花子",
    kana: "スズキ ハナコ",
    service: "自立訓練（生活訓練）",
    status: "利用中",
    recipientCertExpiry: "2026-09-30",
    staff: "高橋 誠",
  },
  {
    id: "U-0003",
    name: "山田 太郎",
    kana: "ヤマダ タロウ",
    service: "就労継続支援B型",
    status: "体験利用",
    recipientCertExpiry: "2026-07-15",
    staff: "田中 美咲",
  },
  {
    id: "U-0004",
    name: "伊藤 由美",
    kana: "イトウ ユミ",
    service: "自立訓練（生活訓練）",
    status: "一時休止",
    recipientCertExpiry: "2026-12-31",
    staff: "中村 大輔",
  },
  {
    id: "U-0005",
    name: "渡辺 翔",
    kana: "ワタナベ ショウ",
    service: "就労継続支援B型",
    status: "利用中",
    recipientCertExpiry: "2027-01-31",
    staff: "高橋 誠",
  },
];

const statusBadge: Record<Status, string> = {
  利用中: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  体験利用: "bg-sky-50 text-sky-700 border border-sky-200",
  一時休止: "bg-amber-50 text-amber-700 border border-amber-200",
};

type Filters = {
  keyword: string;
  service: "" | Service;
  status: "" | Status;
};

const emptyFilters: Filters = { keyword: "", service: "", status: "" };

export default function UsersPage() {
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);

  const filteredUsers = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return users.filter((u) => {
      if (applied.service && u.service !== applied.service) return false;
      if (applied.status && u.status !== applied.status) return false;
      if (kw) {
        const hay = `${u.name} ${u.kana}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [applied]);

  const handleApply = () => setApplied(draft);
  const handleClear = () => {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleApply();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white hover:underline">
              ホーム
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-200">利用者一覧</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">利用者一覧</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            登録利用者の基本情報と利用状況を確認する画面
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            トップへ戻る
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 text-white text-sm font-medium px-4 py-2 opacity-70 cursor-not-allowed"
            aria-disabled
            title="準備中"
          >
            <span aria-hidden>＋</span>
            新規登録（準備中）
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-lg p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <label
                htmlFor="f-keyword"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                検索（氏名・フリガナ）
              </label>
              <input
                id="f-keyword"
                type="search"
                value={draft.keyword}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, keyword: e.target.value }))
                }
                placeholder="例: 佐藤 / サトウ"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="md:col-span-4">
              <label
                htmlFor="f-service"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                サービス種別
              </label>
              <select
                id="f-service"
                value={draft.service}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    service: e.target.value as Filters["service"],
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">すべて</option>
                <option value="就労継続支援B型">就労継続支援B型</option>
                <option value="自立訓練（生活訓練）">
                  自立訓練（生活訓練）
                </option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label
                htmlFor="f-status"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                利用状況
              </label>
              <select
                id="f-status"
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    status: e.target.value as Filters["status"],
                  }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">すべて</option>
                <option value="利用中">利用中</option>
                <option value="体験利用">体験利用</option>
                <option value="一時休止">一時休止</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-slate-300 bg-white text-sm px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              条件クリア
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-800 text-white text-sm font-medium px-3 py-1.5 hover:bg-slate-700"
            >
              絞り込み
            </button>
          </div>
        </form>

        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <span className="text-sm text-slate-600">
              該当{" "}
              <span className="font-semibold text-slate-900">
                {filteredUsers.length}
              </span>{" "}
              件
            </span>
            <span className="text-xs text-slate-400">モックデータ表示中</span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              条件に一致する利用者はいません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5 whitespace-nowrap">
                      利用者名
                    </th>
                    <th className="text-left font-medium px-4 py-2.5 whitespace-nowrap">
                      サービス
                    </th>
                    <th className="text-left font-medium px-4 py-2.5 whitespace-nowrap">
                      利用状況
                    </th>
                    <th className="text-left font-medium px-4 py-2.5 whitespace-nowrap">
                      受給者証期限
                    </th>
                    <th className="text-left font-medium px-4 py-2.5 whitespace-nowrap">
                      担当職員
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">{u.kana}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {u.service}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                            statusBadge[u.status]
                          }
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 tabular-nums">
                        {u.recipientCertExpiry}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {u.staff}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
