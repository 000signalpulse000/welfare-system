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
