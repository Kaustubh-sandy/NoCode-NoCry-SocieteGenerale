import type { QueryResponse, HealthResponse } from "@/types/api";

const BASE_URL = "http://127.0.0.1:8000";

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

export async function postQuery(
  query: string,
  limit = 50
): Promise<QueryResponse> {
  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ?? `HTTP ${res.status}`
    );
  }
  return res.json();
}

export async function triggerTrain(): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/train`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
