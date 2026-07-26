export interface Customer {
  customer_id: string;
  city?: string;
  state?: string;
  age?: number;
  segment?: string;
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
  recommendations?: Recommendation[];
  explanation?: Explanation;
}

export interface Recommendation {
  product: string;
  reason: string;
  priority?: number;
}

export interface Explanation {
  summary: string;
  factors: { label: string; value: string | number }[];
}

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

export interface HealthResponse {
  status: string;
}
