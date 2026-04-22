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
