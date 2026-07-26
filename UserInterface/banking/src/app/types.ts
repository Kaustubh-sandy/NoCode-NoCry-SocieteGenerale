/* ─── Plan & Query Types ─── */

export interface PlanEntities {
  city: string | null;
  segment: string | null;
  minimum_net_worth: number | null;
  target_metric?: string | null;
  is_churn_query?: boolean;
}

export interface Plan {
  intent: 'segment_query' | 'recommendation' | 'analysis' | 'explain' | 'churn_query' | 'prospecting_query' | 'eda_analysis' | 'portfolio_insights' | 'data_quality_query' | 'risk_governance' | string;
  entities: PlanEntities;
  tools: string[];
  approval_required: boolean;
}

/* ─── Customer & Feature Types ─── */

export interface Recommendation {
  product: string;
  reason: string;
}

export interface Explanation {
  outcome: string;
  reason_codes: [string, number][];
  summary: string;
}

export interface CustomerRecord {
  customer_id: string;
  city: string;
  state?: string;
  age: number;
  yearly_income: number;
  savings_balance: number;
  current_balance: number;
  investment_balance: number;
  total_debt: number;
  credit_score: number;
  total_products: number;
  average_monthly_spend?: number;
  transaction_frequency?: number;
  net_worth_estimate: number;
  debt_ratio?: number;
  activity_score: number;
  digital_adoption_score: number;
  financial_health: number;
  investment_readiness: number;
  premium_potential: number;
  dormancy_score: number;
  churn_risk?: number;
  loyalty_score: number;
  cross_sell_score: number;
  segment_label: 'Premium Investors' | 'Emerging Affluent' | 'Everyday Banking' | 'Dormant Recovery' | string;
  segment_distance?: number;
  cluster_confidence?: number;
  recommendations?: Recommendation[];
  explanation?: Explanation;
}

/* ─── Analysis / EDA Types ─── */

export interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  '25%': number;
  '50%': number;
  '75%': number;
  max: number;
  iqr?: number;
  skewness?: number;
  kurtosis?: number;
  outlier_count?: number;
}

export interface AnalysisResult {
  type: string;
  column: string;
  statistics: Statistics;
  by_segment?: Record<string, Record<string, number>>;
}

/* ─── Audit Trail & Output Types ─── */

export interface AuditStep {
  step: number;
  agent: string;
  role: string;
  why_called: string;
  output_summary: string;
  backing_data?: Record<string, any>;
}

export interface RawOutput {
  intent: string;
  entities: Record<string, any>;
  tools_invoked: string[];
  matching_records_count?: number;
  returned_records_sample?: any[];
  target_metric?: string;
  statistics?: any;
  segment_breakdown?: any;
}

export interface QueryResponse {
  plan: Plan;
  count?: number;
  results?: CustomerRecord[];
  result?: AnalysisResult;
  raw_output?: RawOutput;
  audit_trail?: AuditStep[];
}

/* ─── Training Types ─── */

export interface TrainResponse {
  source: string;
  trained_at: string;
  raw_rows: number;
  customers: number;
  transformations: Record<string, string>;
  feature_columns: string[];
  clusters: number;
}

/* ─── Segment Types ─── */

export interface SegmentInfo {
  segment_label: string;
  count: number;
  percentage: number;
  avg_income: number;
  avg_net_worth: number;
  avg_credit_score: number;
  avg_premium_potential: number;
  avg_tx_count: number;
  avg_total_spend: number;
}

export interface SegmentsResponse {
  total_customers: number;
  segments: SegmentInfo[];
}

/* ─── Insights Types ─── */

export interface Insight {
  priority: 'high' | 'medium' | 'low';
  insight: string;
}

export interface InsightsResponse {
  insights: Insight[];
}

/* ─── Data Quality Types ─── */

export interface DataQualityResponse {
  summary: {
    total_transaction_records: number;
    total_columns: number;
    unique_clients_count: number;
    avg_transactions_per_client: number;
    memory_usage_mb: number;
    data_health_score_pct: number;
    exact_duplicate_rows: number;
  };
}

/* ─── Model Status Types ─── */

export interface ModelStatusResponse {
  trained: boolean;
  source?: string;
  trained_at?: string;
  raw_rows?: number;
  unique_customers?: number;
  clusters?: number;
  message?: string;
  evaluation_metrics?: {
    silhouette_score: number;
    calinski_harabasz_index: number;
    davies_bouldin_index: number;
    wcss_inertia: number;
    r2_explained_variance_ratio_pct: number;
  };
}

export interface EDASummaryResponse {
  metric: string;
  statistics: Statistics;
}

export interface EDACompareResponse {
  metric: string;
  group_by: string;
  comparison: Record<string, { count: number; mean: number; median?: number; std?: number; min?: number; max?: number }>;
}

export type TabId = 'overview' | 'customers' | 'browse' | 'analytics' | 'architecture';
