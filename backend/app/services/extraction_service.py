"""Extraction service adapter.

v1 policy:
- PDF: real text extraction via pypdf.
- Image (png/jpg/jpeg): fallback. Returns empty text + warning so the
  user can paste the text manually. Future: swap in real OCR here.
- Audio (mp3/wav/m4a): fallback. Returns empty text + warning so the
  user can paste the transcript manually. Future: swap in real ASR here.

The public entry point is `extract_from_upload`. Replace the internal
`_extract_*` helpers when real implementations become available; the
router and schemas never need to change.
"""

from __future__ import annotations

import io
from dataclasses import dataclass, field


AUDIO_EXTS = {"mp3", "wav", "m4a"}
IMAGE_EXTS = {"png", "jpg", "jpeg"}
PDF_EXTS = {"pdf"}


@dataclass
class ExtractionResult:
    success: bool
    file_type: str  # "audio" | "pdf" | "image" | "unknown"
    file_name: str
    extracted_text: str
    warnings: list[str] = field(default_factory=list)


def _detect_kind(file_name: str) -> tuple[str, str]:
    """Return (kind, ext). kind in {audio,pdf,image,unknown}."""
    name = (file_name or "").lower()
    dot = name.rfind(".")
    ext = name[dot + 1 :] if dot >= 0 else ""
    if ext in PDF_EXTS:
        return "pdf", ext
    if ext in IMAGE_EXTS:
        return "image", ext
    if ext in AUDIO_EXTS:
        return "audio", ext
    return "unknown", ext


def _extract_pdf(data: bytes) -> tuple[str, list[str]]:
    warnings: list[str] = []
    try:
        from pypdf import PdfReader
    except Exception as e:  # pragma: no cover
        return "", [f"PDF解析ライブラリの読み込みに失敗しました: {e}"]

    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as e:
        return "", [f"PDFの読み込みに失敗しました: {e}"]

    parts: list[str] = []
    for i, page in enumerate(reader.pages):
        try:
            txt = page.extract_text() or ""
        except Exception as e:
            warnings.append(f"{i + 1}ページ目の抽出に失敗しました: {e}")
            txt = ""
        if txt.strip():
            parts.append(txt)
    text = "\n\n".join(parts).strip()
    if not text:
        warnings.append(
            "PDFからテキストを抽出できませんでした（画像PDFの可能性があります）。"
        )
    return text, warnings


def _extract_image_fallback(_data: bytes) -> tuple[str, list[str]]:
    # v1: no OCR. Surface a clear message and keep extracted_text empty.
    return "", [
        "画像OCRはv1では未対応です。抽出テキスト欄に内容を貼り付けてください。",
    ]


def _extract_audio_fallback(_data: bytes) -> tuple[str, list[str]]:
    # v1: no ASR. Surface a clear message and keep extracted_text empty.
    return "", [
        "音声の自動文字起こしはv1では未対応です。抽出テキスト欄に文字起こし結果を貼り付けてください。",
    ]


def extract_from_upload(
    *,
    file_name: str,
    content: bytes,
) -> ExtractionResult:
    kind, _ext = _detect_kind(file_name)
    if kind == "pdf":
        text, warns = _extract_pdf(content)
        return ExtractionResult(
            success=True,
            file_type="pdf",
            file_name=file_name,
            extracted_text=text,
            warnings=warns,
        )
    if kind == "image":
        text, warns = _extract_image_fallback(content)
        return ExtractionResult(
            success=True,
            file_type="image",
            file_name=file_name,
            extracted_text=text,
            warnings=warns,
        )
    if kind == "audio":
        text, warns = _extract_audio_fallback(content)
        return ExtractionResult(
            success=True,
            file_type="audio",
            file_name=file_name,
            extracted_text=text,
            warnings=warns,
        )
    return ExtractionResult(
        success=False,
        file_type="unknown",
        file_name=file_name,
        extracted_text="",
        warnings=[
            "対応していないファイル形式です（対応: pdf, png, jpg, jpeg, mp3, wav, m4a）。",
        ],
    )
