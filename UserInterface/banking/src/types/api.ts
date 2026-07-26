// ── Core customer types ───────────────────────────────────────────────────────

export interface Customer {
  customer_id: string;
  city?: string;
  state?: string;
  age?: number;
  segment?: string;
  segment_label?: string;
  confidence?: number;
  yearly_income?: number;
  net_worth_estimate?: number;
  credit_score?: number;
  premium_potential?: number;
  activity_score?: number;
  financial_health?: number;
  investment_readiness?: number;
  dormancy_score?: number;
  loyalty_score?: number;
  cross_sell_score?: number;
  total_products?: number;
  average_monthly_spend?: number;
  total_debt?: number;
  total_transaction_count?: number;
  total_historical_spend?: number;
  recommendations?: Recommendation[];
  explanation?: Explanation;
  [key: string]: unknown;
}

// Full profile from GET /customers/{id}
export type CustomerDetail = Customer;

export interface Recommendation {
  product: string;
  reason: string;
  priority?: number;
}

export interface Explanation {
  summary: string;
  factors?: { label: string; value: string | number }[];
}

// ── Query ─────────────────────────────────────────────────────────────────────

export interface QueryPlan {
  intent: string;
  tools: string[];
  filters?: Record<string, unknown>;
}

export interface QueryResponse {
  plan: QueryPlan;
  count: number;
  results: Customer[];
  statistics?: Record<string, unknown>;
  message?: string;
  error?: string;
}

// ── System ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  service?: string;
}

export interface StatusResponse {
  trained: boolean;
  message?: string;
  source?: string;
  trained_at?: string;
  raw_rows?: number;
  unique_customers?: number;
  clusters?: number;
  evaluation_metrics?: Record<string, number>;
}

export interface DataQualityResponse {
  [key: string]: unknown;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface SegmentStat {
  segment_label: string;
  count: number;
  percentage: number;
  avg_income: number;
  avg_net_worth: number;
  avg_credit_score: number;
  avg_premium_potential: number;
  avg_tx_count?: number;
  avg_total_spend?: number;
}

export interface SegmentsResponse {
  total_customers: number;
  segments: SegmentStat[];
}

export interface Insight {
  type: string;
  title?: string;
  message: string;
  count?: number;
  segment?: string;
  [key: string]: unknown;
}

export interface InsightsResponse {
  insights: Insight[];
}

export interface EdaStatistics {
  count?: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  skewness?: number;
  kurtosis?: number;
  outliers?: number;
  [key: string]: unknown;
}

export interface EdaSummaryResponse {
  metric: string;
  statistics: EdaStatistics;
}

export interface EdaCompareGroup {
  [key: string]: unknown;
}

export interface EdaCompareResponse {
  metric: string;
  group_by: string;
  comparison: EdaCompareGroup[];
}

// ── Customers list ────────────────────────────────────────────────────────────

export interface CustomerListResponse {
  total: number;
  offset: number;
  limit: number;
  customers: Customer[];
}
