import type {
  QueryResponse,
  HealthResponse,
  StatusResponse,
  SegmentsResponse,
  InsightsResponse,
  EdaSummaryResponse,
  EdaCompareResponse,
  CustomerListResponse,
  CustomerDetail,
  DataQualityResponse,
} from "@/types/api";

const BASE_URL = "http://127.0.0.1:8000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── System ────────────────────────────────────────────────────────────────────

export const checkHealth = () => get<HealthResponse>("/health");
export const getStatus   = () => get<StatusResponse>("/status");
export const getDataQuality = () => get<DataQualityResponse>("/data-quality");

// ── Training ──────────────────────────────────────────────────────────────────

export const triggerTrain = () =>
  post<{ message: string; customers?: number; clusters?: number }>("/train", {});

// ── Query ─────────────────────────────────────────────────────────────────────

export const postQuery = (query: string, limit = 50) =>
  post<QueryResponse>("/query", { query, limit });

// ── Analytics ─────────────────────────────────────────────────────────────────

export const getSegments = () => get<SegmentsResponse>("/segments");
export const getInsights = () => get<InsightsResponse>("/insights");

export const getEdaSummary = (metric: string) =>
  post<EdaSummaryResponse>("/eda/summary", { metric });

export const getEdaCompare = (metric: string, group_by = "segment_label") =>
  post<EdaCompareResponse>("/eda/compare", { metric, group_by });

// ── Customers ─────────────────────────────────────────────────────────────────

export const getCustomers = (limit = 100, offset = 0) =>
  get<CustomerListResponse>(`/customers?limit=${limit}&offset=${offset}`);

export const getCustomerById = (id: string) =>
  get<CustomerDetail>(`/customers/${encodeURIComponent(id)}`);
