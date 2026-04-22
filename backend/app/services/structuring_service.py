"""Structuring service adapter.

v1 policy:
- Rule-based parser over Japanese hearing notes / memos.
- Detects labeled sections like "項目名: 内容" or "【項目名】内容".
- Maps matched section labels to screen-specific field names.
- Normalizes dates to YYYY-MM-DD and times to HH:MM.

Future: swap in an LLM- or model-based structurer behind this same API.
"""

from __future__ import annotations

import re
from typing import Any


SUPPORTED_SCREENS = ("monitoring", "support_plan", "service_meeting")


# --------------------------------------------------------------------------
# Parsing primitives
# --------------------------------------------------------------------------

# "ラベル: 内容" / "ラベル: 内容" (fullwidth colon)
_LABEL_RE = re.compile(r"^\s*[■◆◎・●▶▷○]?\s*([^:：\n【】]{1,24})\s*[:：]\s*(.*)$")
# "【ラベル】内容"
_BRACKET_RE = re.compile(r"^\s*【\s*(.{1,24}?)\s*】\s*(.*)$")

# Dates: 2026-04-22 / 2026/4/22 / 2026年4月22日
_DATE_RE = re.compile(
    r"(\d{4})[\s/\-\.年](\d{1,2})[\s/\-\.月](\d{1,2})(?:\s*日)?"
)
# Times: 10:30 / 10:30
_TIME_RE = re.compile(r"(\d{1,2})[:：](\d{2})")


def _normalize_label(s: str) -> str:
    # Remove whitespace and common bullet chars; lowercase.
    return re.sub(r"[\s　・]", "", s).lower()


def _parse_sections(text: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    label: str | None = None
    body: list[str] = []
    for line in text.splitlines():
        m = _BRACKET_RE.match(line) or _LABEL_RE.match(line)
        if m:
            if label is not None:
                sections.append((label, "\n".join(body).strip()))
            label = m.group(1).strip()
            rest = m.group(2).strip()
            body = [rest] if rest else []
        else:
            body.append(line)
    if label is not None:
        sections.append((label, "\n".join(body).strip()))
    return sections


def _find_date(text: str) -> str | None:
    m = _DATE_RE.search(text)
    if not m:
        return None
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    if not (1 <= mo <= 12 and 1 <= d <= 31):
        return None
    return f"{y:04d}-{mo:02d}-{d:02d}"


def _find_all_dates(text: str) -> list[str]:
    out: list[str] = []
    for m in _DATE_RE.finditer(text):
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31:
            out.append(f"{y:04d}-{mo:02d}-{d:02d}")
    return out


def _find_time(text: str) -> str | None:
    m = _TIME_RE.search(text)
    if not m:
        return None
    h, mi = int(m.group(1)), int(m.group(2))
    if not (0 <= h <= 23 and 0 <= mi <= 59):
        return None
    return f"{h:02d}:{mi:02d}"


def _find_bool_attended(text: str) -> bool | None:
    t = text.strip()
    if not t:
        return None
    if "欠席" in t or "不参加" in t:
        return False
    if "出席" in t or "参加" in t or "あり" in t:
        return True
    if "なし" in t:
        return False
    return None


def _extract_goals(text: str) -> list[str]:
    items: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        cleaned = re.sub(r"^[\-・•●○◆◎\d\.\)\s]+", "", line).strip()
        if cleaned:
            items.append(cleaned)
    return items[:6]


# --------------------------------------------------------------------------
# Field label maps (field_name -> list of label variants in Japanese)
# --------------------------------------------------------------------------

_MONITORING_LABELS: dict[str, list[str]] = {
    "monitoring_date": ["モニタリング日", "モニタリング実施日", "実施日", "日付"],
    "staff_name": ["実施職員", "担当職員", "職員名", "担当者"],
    "long_term_status": ["長期目標達成状況", "長期達成状況"],
    "short_term_status": ["短期目標達成状況", "短期達成状況"],
    "long_term_progress": ["長期目標進捗", "長期目標の進捗", "長期の進捗"],
    "short_term_progress": ["短期目標進捗", "短期目標の進捗", "短期の進捗"],
    "user_condition": ["本人の様子", "利用者の様子", "様子", "現状"],
    "issues": ["課題", "留意点", "課題・留意点"],
    "next_plan": ["今後の支援方針", "今後の方針", "次回の支援", "次回までの方針"],
    "note": ["備考", "その他"],
}

_PLAN_LABELS: dict[str, list[str]] = {
    "plan_created_date": ["計画作成日", "作成日"],
    "period_start": ["計画期間開始", "期間開始", "開始日"],
    "period_end": ["計画期間終了", "期間終了", "終了日"],
    "long_term_goal": ["長期目標", "長期の目標"],
    "short_term_goals": ["短期目標", "短期の目標"],
    "support_content": ["支援内容", "支援方法"],
    "user_intention": ["本人意向", "本人の意向", "本人希望", "希望"],
    "note": ["備考", "その他"],
}

_MEETING_LABELS: dict[str, list[str]] = {
    "meeting_title": ["会議名", "名称", "タイトル"],
    "meeting_date": ["開催日", "日付"],
    "meeting_time": ["開催時刻", "時刻", "時間"],
    "meeting_place": ["開催場所", "場所", "会場"],
    "attendees": ["参加者", "出席者", "同席者"],
    "user_attended": ["本人出席", "本人参加", "本人の出席"],
    "agenda": ["議題"],
    "status_check": ["現状確認"],
    "issues": ["課題"],
    "discussion": ["協議内容", "協議", "話し合い"],
    "decision": ["決定事項", "決定"],
    "next_policy": ["今後の支援方針", "今後の方針"],
    "next_action": ["次回までの対応", "次回対応", "対応事項", "アクション"],
    "next_scheduled_date": ["次回開催予定", "次回予定日", "次回予定", "次回"],
    "note": ["備考", "その他"],
    "user_signature": ["本人署名"],
    "user_seal": ["本人印"],
    "staff_signature": ["支援者署名", "職員署名", "担当者署名"],
    "staff_seal": ["支援者印", "職員印", "担当者印"],
}


def _build_reverse_map(labels_map: dict[str, list[str]]) -> dict[str, str]:
    rev: dict[str, str] = {}
    for field, labels in labels_map.items():
        for label in labels:
            rev[_normalize_label(label)] = field
    return rev


_MONITORING_REV = _build_reverse_map(_MONITORING_LABELS)
_PLAN_REV = _build_reverse_map(_PLAN_LABELS)
_MEETING_REV = _build_reverse_map(_MEETING_LABELS)


def _match_field(norm_label: str, rev: dict[str, str]) -> str | None:
    if not norm_label:
        return None
    if norm_label in rev:
        return rev[norm_label]
    # Prefer the longest key that matches either direction.
    candidates = [k for k in rev if k and (k in norm_label or norm_label in k)]
    if not candidates:
        return None
    best = max(candidates, key=len)
    return rev[best]


# --------------------------------------------------------------------------
# Per-screen structuring
# --------------------------------------------------------------------------

def _structure_monitoring(text: str) -> tuple[dict[str, Any], list[str]]:
    result: dict[str, Any] = {
        "monitoring_date": None,
        "staff_name": None,
        "long_term_status": None,
        "short_term_status": None,
        "long_term_progress": None,
        "short_term_progress": None,
        "user_condition": None,
        "issues": None,
        "next_plan": None,
        "note": None,
    }
    warnings: list[str] = []
    for label, content in _parse_sections(text):
        field = _match_field(_normalize_label(label), _MONITORING_REV)
        if field is None:
            continue
        if field == "monitoring_date":
            result[field] = _find_date(content) or (content.strip() or None)
        else:
            result[field] = content.strip() or None
    return result, warnings


def _structure_plan(text: str) -> tuple[dict[str, Any], list[str]]:
    result: dict[str, Any] = {
        "plan_created_date": None,
        "period_start": None,
        "period_end": None,
        "long_term_goal": None,
        "short_term_goals": [],
        "support_content": None,
        "user_intention": None,
        "note": None,
    }
    warnings: list[str] = []
    for label, content in _parse_sections(text):
        norm = _normalize_label(label)
        # Combined "期間" / "計画期間" -> try to split into start/end
        if ("期間" in norm) and ("開始" not in norm) and ("終了" not in norm):
            dates = _find_all_dates(content)
            if len(dates) >= 2:
                result["period_start"] = dates[0]
                result["period_end"] = dates[1]
            elif len(dates) == 1:
                result["period_start"] = dates[0]
            continue
        field = _match_field(norm, _PLAN_REV)
        if field is None:
            continue
        if field in ("plan_created_date", "period_start", "period_end"):
            result[field] = _find_date(content) or (content.strip() or None)
        elif field == "short_term_goals":
            result["short_term_goals"] = _extract_goals(content)
        else:
            result[field] = content.strip() or None
    return result, warnings


def _structure_meeting(text: str) -> tuple[dict[str, Any], list[str]]:
    result: dict[str, Any] = {
        "meeting_title": None,
        "meeting_date": None,
        "meeting_time": None,
        "meeting_place": None,
        "attendees": None,
        "user_attended": None,
        "agenda": None,
        "status_check": None,
        "issues": None,
        "discussion": None,
        "decision": None,
        "next_policy": None,
        "next_action": None,
        "next_scheduled_date": None,
        "note": None,
        "user_signature": None,
        "user_seal": None,
        "staff_signature": None,
        "staff_seal": None,
    }
    warnings: list[str] = []
    for label, content in _parse_sections(text):
        norm = _normalize_label(label)
        # "開催日時" -> populate both date and time
        if "開催日時" in norm or norm == "日時":
            d = _find_date(content)
            t = _find_time(content)
            if d:
                result["meeting_date"] = d
            if t:
                result["meeting_time"] = t
            continue
        field = _match_field(norm, _MEETING_REV)
        if field is None:
            continue
        if field in ("meeting_date", "next_scheduled_date"):
            result[field] = _find_date(content) or (content.strip() or None)
        elif field == "meeting_time":
            result[field] = _find_time(content) or (content.strip() or None)
        elif field == "user_attended":
            result[field] = _find_bool_attended(content)
        else:
            result[field] = content.strip() or None
    return result, warnings


def structure_text(
    *,
    screen_type: str,
    extracted_text: str,
) -> tuple[dict[str, Any], list[str]]:
    """Dispatch to per-screen structurer. Returns (structured_data, warnings)."""
    if screen_type == "monitoring":
        return _structure_monitoring(extracted_text or "")
    if screen_type == "support_plan":
        return _structure_plan(extracted_text or "")
    if screen_type == "service_meeting":
        return _structure_meeting(extracted_text or "")
    return {}, [f"未対応のscreen_type: {screen_type}"]
