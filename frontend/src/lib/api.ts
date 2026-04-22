const DEFAULT_BASE = "http://localhost:8001";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || DEFAULT_BASE;

export type BackendSupportRecord = {
  id: number;
  user_id: string;
  record_date: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export async function listSupportRecords(
  userId: string,
): Promise<BackendSupportRecord[]> {
  const res = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/records`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`list failed: ${res.status}`);
  }
  return res.json();
}

export async function createSupportRecord(input: {
  user_id: string;
  record_date: string;
  body: string;
}): Promise<BackendSupportRecord> {
  const res = await fetch(`${API_BASE_URL}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`save failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteSupportRecord(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/records/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(`delete failed: ${res.status}`);
  }
}

export type BackendIntakeRecord = {
  id: number;
  name: string;
  kana: string | null;
  birth_date: string | null;
  phone: string | null;
  address: string | null;
  desired_service: string;
  consultation_route: string | null;
  consultation_memo: string | null;
  created_at: string;
  updated_at: string;
};

export type IntakeRecordInput = {
  name: string;
  kana?: string | null;
  birth_date?: string | null;
  phone?: string | null;
  address?: string | null;
  desired_service: string;
  consultation_route?: string | null;
  consultation_memo?: string | null;
};

export async function createIntakeRecord(
  input: IntakeRecordInput,
): Promise<BackendIntakeRecord> {
  const res = await fetch(`${API_BASE_URL}/intakes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`save failed: ${res.status}`);
  }
  return res.json();
}

export type BackendSupportPlan = {
  id: number;
  user_id: string;
  service_type: string;
  plan_created_date: string;
  period_start: string;
  period_end: string;
  long_term_goal: string | null;
  short_term_goals: string[];
  support_content: string | null;
  user_intention: string | null;
  note: string | null;
  user_signature: string;
  seal_note: string | null;
  signed_date: string;
  created_at: string;
  updated_at: string;
};

export type SupportPlanInput = {
  user_id: string;
  service_type: string;
  plan_created_date: string;
  period_start: string;
  period_end: string;
  long_term_goal?: string | null;
  short_term_goals: string[];
  support_content?: string | null;
  user_intention?: string | null;
  note?: string | null;
  user_signature: string;
  seal_note?: string | null;
  signed_date: string;
};

export async function createSupportPlan(
  input: SupportPlanInput,
): Promise<BackendSupportPlan> {
  const res = await fetch(`${API_BASE_URL}/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`save failed: ${res.status}`);
  }
  return res.json();
}

export type BackendMonitoring = {
  id: number;
  user_id: string;
  service_type: string;
  monitoring_date: string;
  staff_name: string | null;
  period_start: string;
  period_end: string;
  long_term_status: string | null;
  short_term_status: string | null;
  long_term_progress: string | null;
  short_term_progress: string | null;
  user_condition: string | null;
  issues: string | null;
  next_plan: string | null;
  note: string | null;
  user_signature: string;
  seal_note: string | null;
  signed_date: string;
  created_at: string;
  updated_at: string;
};

export type MonitoringInput = {
  user_id: string;
  service_type: string;
  monitoring_date: string;
  staff_name?: string | null;
  period_start: string;
  period_end: string;
  long_term_status?: string | null;
  short_term_status?: string | null;
  long_term_progress?: string | null;
  short_term_progress?: string | null;
  user_condition?: string | null;
  issues?: string | null;
  next_plan?: string | null;
  note?: string | null;
  user_signature: string;
  seal_note?: string | null;
  signed_date: string;
};

export async function createMonitoring(
  input: MonitoringInput,
): Promise<BackendMonitoring> {
  const res = await fetch(`${API_BASE_URL}/monitorings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`save failed: ${res.status}`);
  }
  return res.json();
}

export type BackendServiceMeeting = {
  id: number;
  user_id: string;
  service_type: string;
  meeting_title: string | null;
  meeting_date: string;
  meeting_time: string | null;
  meeting_place: string;
  attendees: string | null;
  user_attended: boolean | null;
  agenda: string | null;
  status_check: string | null;
  issues: string | null;
  discussion: string | null;
  decision: string | null;
  next_policy: string | null;
  next_action: string | null;
  next_scheduled_date: string | null;
  note: string | null;
  user_signature: string | null;
  user_seal: string | null;
  staff_signature: string | null;
  staff_seal: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceMeetingInput = {
  user_id: string;
  service_type: string;
  meeting_title?: string | null;
  meeting_date: string;
  meeting_time?: string | null;
  meeting_place: string;
  attendees?: string | null;
  user_attended?: boolean | null;
  agenda?: string | null;
  status_check?: string | null;
  issues?: string | null;
  discussion?: string | null;
  decision?: string | null;
  next_policy?: string | null;
  next_action?: string | null;
  next_scheduled_date?: string | null;
  note?: string | null;
  user_signature?: string | null;
  user_seal?: string | null;
  staff_signature?: string | null;
  staff_seal?: string | null;
};

export async function createServiceMeeting(
  input: ServiceMeetingInput,
): Promise<BackendServiceMeeting> {
  const res = await fetch(`${API_BASE_URL}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`save failed: ${res.status}`);
  }
  return res.json();
}

export async function listServiceMeetings(
  userId: string,
): Promise<BackendServiceMeeting[]> {
  const res = await fetch(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/meetings`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`list failed: ${res.status}`);
  }
  return res.json();
}

export async function getServiceMeeting(
  meetingId: number,
): Promise<BackendServiceMeeting | null> {
  const res = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`get failed: ${res.status}`);
  }
  return res.json();
}

async function fetchLatest<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as T | null;
    return data;
  } catch {
    return null;
  }
}

export function getLatestSupportRecord(
  userId: string,
): Promise<BackendSupportRecord | null> {
  return fetchLatest<BackendSupportRecord>(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/records/latest`,
  );
}

export function getLatestIntakeByName(
  name: string,
): Promise<BackendIntakeRecord | null> {
  return fetchLatest<BackendIntakeRecord>(
    `${API_BASE_URL}/intakes/latest?name=${encodeURIComponent(name)}`,
  );
}

export function getLatestSupportPlan(
  userId: string,
): Promise<BackendSupportPlan | null> {
  return fetchLatest<BackendSupportPlan>(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/plans/latest`,
  );
}

export function getLatestMonitoring(
  userId: string,
): Promise<BackendMonitoring | null> {
  return fetchLatest<BackendMonitoring>(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/monitorings/latest`,
  );
}

export function getLatestServiceMeeting(
  userId: string,
): Promise<BackendServiceMeeting | null> {
  return fetchLatest<BackendServiceMeeting>(
    `${API_BASE_URL}/users/${encodeURIComponent(userId)}/meetings/latest`,
  );
}

// ---------------------------------------------------------------------------
// AI import foundation (shared extract + structure)
// ---------------------------------------------------------------------------

export type AiScreenType = "monitoring" | "support_plan" | "service_meeting";

export type AiExtractResponse = {
  success: boolean;
  file_type: string;
  file_name: string;
  extracted_text: string;
  warnings: string[];
};

export type AiStructureResponse<T = Record<string, unknown>> = {
  success: boolean;
  screen_type: AiScreenType;
  structured_data: T;
  warnings: string[];
};

export async function extractFile(file: File): Promise<AiExtractResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/ai/extract`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`extract failed: ${res.status} ${detail}`.trim());
  }
  return res.json();
}

export async function structureText<T = Record<string, unknown>>(
  screenType: AiScreenType,
  extractedText: string,
): Promise<AiStructureResponse<T>> {
  const res = await fetch(`${API_BASE_URL}/ai/structure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      screen_type: screenType,
      extracted_text: extractedText,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`structure failed: ${res.status} ${detail}`.trim());
  }
  return res.json();
}

// Per-screen structured draft shapes. Fields are optional because
// rule-based structuring may not find every section.

export type MonitoringDraft = {
  monitoring_date?: string | null;
  staff_name?: string | null;
  long_term_status?: string | null;
  short_term_status?: string | null;
  long_term_progress?: string | null;
  short_term_progress?: string | null;
  user_condition?: string | null;
  issues?: string | null;
  next_plan?: string | null;
  note?: string | null;
};

export type SupportPlanDraft = {
  plan_created_date?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  long_term_goal?: string | null;
  short_term_goals?: string[];
  support_content?: string | null;
  user_intention?: string | null;
  note?: string | null;
};

export type ServiceMeetingDraft = {
  meeting_title?: string | null;
  meeting_date?: string | null;
  meeting_time?: string | null;
  meeting_place?: string | null;
  attendees?: string | null;
  user_attended?: boolean | null;
  agenda?: string | null;
  status_check?: string | null;
  issues?: string | null;
  discussion?: string | null;
  decision?: string | null;
  next_policy?: string | null;
  next_action?: string | null;
  next_scheduled_date?: string | null;
  note?: string | null;
  user_signature?: string | null;
  user_seal?: string | null;
  staff_signature?: string | null;
  staff_seal?: string | null;
};
