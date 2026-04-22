"use client";

import { useRef, useState } from "react";
import {
  AiScreenType,
  extractFile,
  structureText,
} from "@/lib/api";

type Props<T> = {
  screenType: AiScreenType;
  onApply: (draft: T) => void;
  accept?: string;
};

type Status = "idle" | "extracting" | "structuring" | "applied" | "error";

const DEFAULT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.mp3,.wav,.m4a,application/pdf,image/png,image/jpeg,audio/mpeg,audio/wav,audio/x-m4a";

const inputBase =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400";

function prettyFileType(t: string): string {
  if (t === "pdf") return "PDF";
  if (t === "image") return "画像";
  if (t === "audio") return "音声";
  return "不明";
}

export default function ImportPanel<T extends object>({
  screenType,
  onApply,
  accept = DEFAULT_ACCEPT,
}: Props<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [draft, setDraft] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileType(null);
    setExtractedText("");
    setDraft(null);
    setStatus("idle");
    setMessage(null);
    setWarnings([]);
  };

  const handleExtract = async () => {
    if (!file) {
      setStatus("error");
      setMessage("ファイルを選択してください");
      return;
    }
    setStatus("extracting");
    setMessage("読取中...");
    setWarnings([]);
    try {
      const res = await extractFile(file);
      setFileType(res.file_type);
      setExtractedText(res.extracted_text);
      setWarnings(res.warnings ?? []);
      setDraft(null);
      setStatus("idle");
      setMessage(
        res.extracted_text
          ? "読取が完了しました。内容を確認・修正してください。"
          : "テキストを抽出できませんでした。抽出テキスト欄に直接入力してください。",
      );
    } catch (e) {
      setStatus("error");
      setMessage(
        "読取に失敗しました。通信状況またはファイル形式を確認してください。",
      );
      console.error(e);
    }
  };

  const handleStructure = async () => {
    if (!extractedText.trim()) {
      setStatus("error");
      setMessage("抽出テキストが空です。先に読取を実行するか、直接入力してください。");
      return;
    }
    setStatus("structuring");
    setMessage("整理中...");
    try {
      const res = await structureText<T>(screenType, extractedText);
      setDraft(res.structured_data);
      setWarnings((prev) => {
        const merged = [...prev];
        for (const w of res.warnings ?? []) {
          if (!merged.includes(w)) merged.push(w);
        }
        return merged;
      });
      setStatus("idle");
      setMessage("整理が完了しました。内容を確認してから反映してください。");
    } catch (e) {
      setStatus("error");
      setMessage(
        "整理に失敗しました。抽出テキストは保持されています。もう一度お試しください。",
      );
      console.error(e);
    }
  };

  const handleApply = () => {
    if (!draft) return;
    onApply(draft);
    setStatus("applied");
    setMessage(
      "自動入力を反映しました。各項目を確認・修正の上、保存してください。",
    );
  };

  const handleClear = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null);
    setFileType(null);
    setExtractedText("");
    setDraft(null);
    setStatus("idle");
    setMessage(null);
    setWarnings([]);
  };

  const statusClass =
    status === "applied"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : status === "error"
        ? "text-rose-700 bg-rose-50 border-rose-200"
        : "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <section>
      <h2 className="text-base font-semibold text-slate-700 mb-3">
        音声・PDF・画像取込
      </h2>
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          ヒアリング音声・議事録PDF・書き起こし画像などを取り込み、抽出テキストと項目ごとの下書きを自動生成します。最終的な保存は必ず内容を確認してから行ってください。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-8">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              ファイル選択
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-slate-50 file:text-slate-700 file:px-3 file:py-1.5 file:text-xs hover:file:bg-slate-100"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              対応形式: PDF / PNG / JPG / JPEG / MP3 / WAV / M4A（最大20MB）
            </p>
          </div>
          <div className="md:col-span-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleExtract}
              disabled={!file || status === "extracting"}
              className="rounded-md bg-slate-800 text-white text-sm font-medium px-3 py-2 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "extracting" ? "読取中..." : "読取実行"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-slate-300 bg-white text-sm text-slate-700 px-3 py-2 hover:bg-slate-50"
            >
              取込クリア
            </button>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`text-xs rounded-md border px-3 py-2 ${statusClass}`}
          >
            {message}
          </div>
        )}

        {warnings.length > 0 && (
          <ul className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>・{w}</li>
            ))}
          </ul>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            抽出テキスト（読取結果）
            {fileType && (
              <span className="ml-2 text-[10px] text-slate-500">
                ファイル種別: {prettyFileType(fileType)}
              </span>
            )}
          </label>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            rows={8}
            placeholder={
              "読取後にここに抽出テキストが表示されます。必要に応じて直接編集・貼り付けも可能です。"
            }
            className={inputBase + " leading-relaxed"}
          />
          <div className="flex items-center justify-end mt-2">
            <button
              type="button"
              onClick={handleStructure}
              disabled={!extractedText.trim() || status === "structuring"}
              className="rounded-md bg-slate-700 text-white text-sm font-medium px-3 py-1.5 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "structuring" ? "整理中..." : "自動整理"}
            </button>
          </div>
        </div>

        {draft && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              整理結果（下書きプレビュー）
            </label>
            <pre className="text-[11px] leading-relaxed bg-slate-50 border border-slate-200 rounded-md p-3 overflow-x-auto max-h-64 text-slate-700">
              {JSON.stringify(draft, null, 2)}
            </pre>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-500">
                反映後も各項目は手動で編集できます。保存は最終確認後に行ってください。
              </p>
              <button
                type="button"
                onClick={handleApply}
                className="rounded-md bg-emerald-700 text-white text-sm font-medium px-3 py-1.5 hover:bg-emerald-600"
              >
                自動入力を反映
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
