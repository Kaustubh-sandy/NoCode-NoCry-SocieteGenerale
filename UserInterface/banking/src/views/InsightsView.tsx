"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import { getSegments, getInsights, getEdaSummary, getEdaCompare } from "@/lib/api";
import type {
  SegmentsResponse,
  InsightsResponse,
  EdaSummaryResponse,
  EdaCompareResponse,
} from "@/types/api";

const SG_RED = "#E9041E";

const SEG_COLORS: Record<string, string> = {
  "Premium Investors":  "#f59e0b",
  "Emerging Affluent":  "#3b82f6",
  "Dormant Recovery":   "#ef4444",
  "Everyday Banking":   "#6b7280",
};

const EDA_METRICS = [
  { value: "yearly_income",       label: "Yearly Income" },
  { value: "net_worth_estimate",  label: "Net Worth" },
  { value: "credit_score",        label: "Credit Score" },
  { value: "premium_potential",   label: "Premium Potential" },
  { value: "dormancy_score",      label: "Dormancy Score" },
  { value: "activity_score",      label: "Activity Score" },
  { value: "investment_readiness",label: "Investment Readiness" },
  { value: "cross_sell_score",    label: "Cross-Sell Score" },
  { value: "loyalty_score",       label: "Loyalty Score" },
];

const formatINR = (v: number) => {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
  if (v >= 1_00_000)    return `₹${(v / 1_00_000).toFixed(1)}L`;
  if (v >= 1_000)       return `₹${(v / 1_000).toFixed(0)}K`;
  return `₹${v.toFixed(0)}`;
};

const isIncomeMetric = (m: string) =>
  ["yearly_income", "net_worth_estimate", "average_monthly_spend"].includes(m);

type ActiveView = "segments" | "portfolio" | "eda";

export default function InsightsView() {
  const [activeView, setActiveView] = useState<ActiveView>("segments");

  return (
    <div className="space-y-5">
      {/* Tab strip */}
      <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-fit">
        {(
          [
            { id: "segments",  label: "Segment Overview" },
            { id: "portfolio", label: "Portfolio Insights" },
            { id: "eda",       label: "EDA Explorer" },
          ] as { id: ActiveView; label: string }[]
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeView === id
                ? "bg-[#E9041E] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === "segments"  && <SegmentOverview />}
      {activeView === "portfolio" && <PortfolioInsights />}
      {activeView === "eda"       && <EdaExplorer />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Segment Overview — calls GET /segments
// ─────────────────────────────────────────────────────────────────────────────

function SegmentOverview() {
  const [data, setData]     = useState<SegmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getSegments());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load segments");
    } finally {
      setLoading(false);
    }
  };

  const maxCount = data?.segments
    ? Math.max(...data.segments.map((s) => s.count))
    : 1;

  return (
    <div className="space-y-5">
      {!data && !loading && (
        <EmptyState
          emoji="🏷️"
          title="Segment Distribution"
          desc="Load the segment breakdown for all 4,941 customers from the feature store."
          action="Load Segments"
          onAction={load}
        />
      )}

      {loading && <LoadingCenter />}
      {error   && <ErrorBanner message={error} onRetry={load} />}

      {data && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Customers" value={data.total_customers.toLocaleString()} />
            {data.segments.map((s) => (
              <StatCard
                key={s.segment_label}
                label={s.segment_label}
                value={`${s.count.toLocaleString()}`}
                sub={`${s.percentage}%`}
                color={SEG_COLORS[s.segment_label]}
              />
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">
              Customer Count by Segment
            </h3>
            <div className="space-y-4">
              {data.segments
                .sort((a, b) => b.count - a.count)
                .map((s) => (
                  <div key={s.segment_label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">
                        {s.segment_label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {s.count.toLocaleString()} &nbsp;·&nbsp; {s.percentage}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(s.count / maxCount) * 100}%`,
                          background: SEG_COLORS[s.segment_label] ?? SG_RED,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                Segment Averages
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {[
                      "Segment",
                      "Customers",
                      "Avg Income",
                      "Avg Net Worth",
                      "Avg Credit",
                      "Avg Premium %",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.segments.map((s) => (
                    <tr key={s.segment_label} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: `${SEG_COLORS[s.segment_label] ?? SG_RED}18`,
                            color: SEG_COLORS[s.segment_label] ?? SG_RED,
                            border: `1px solid ${SEG_COLORS[s.segment_label] ?? SG_RED}40`,
                          }}
                        >
                          {s.segment_label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                        {s.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {formatINR(s.avg_income)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {formatINR(s.avg_net_worth)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {s.avg_credit_score.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={`font-semibold ${
                            s.avg_premium_potential >= 70
                              ? "text-emerald-600"
                              : s.avg_premium_potential >= 40
                              ? "text-amber-600"
                              : "text-gray-500"
                          }`}
                        >
                          {s.avg_premium_potential.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Insights — calls GET /insights
// ─────────────────────────────────────────────────────────────────────────────

const INSIGHT_ICON: Record<string, string> = {
  cross_sell:  "🎯",
  dormancy:    "💤",
  high_value:  "💎",
  premium:     "⭐",
  default:     "💡",
};

const INSIGHT_COLOR: Record<string, string> = {
  cross_sell:  "bg-blue-50 border-blue-100 text-blue-800",
  dormancy:    "bg-red-50 border-red-100 text-red-800",
  high_value:  "bg-amber-50 border-amber-100 text-amber-800",
  premium:     "bg-emerald-50 border-emerald-100 text-emerald-800",
  default:     "bg-gray-50 border-gray-200 text-gray-800",
};

function PortfolioInsights() {
  const [data,    setData]    = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getInsights());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {!data && !loading && (
        <EmptyState
          emoji="💡"
          title="Portfolio Insights"
          desc="AI-generated cross-sell, dormancy, and high-value customer insights across the entire portfolio."
          action="Generate Insights"
          onAction={load}
        />
      )}

      {loading && <LoadingCenter />}
      {error   && <ErrorBanner message={error} onRetry={load} />}

      {data && !loading && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">
              {data.insights.length} insight{data.insights.length !== 1 ? "s" : ""} generated
            </p>
            <button
              onClick={load}
              className="text-xs text-[#E9041E] hover:underline font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {data.insights.map((ins, i) => {
              const t    = ins.type ?? "default";
              const icon = INSIGHT_ICON[t] ?? INSIGHT_ICON.default;
              const cls  = INSIGHT_COLOR[t] ?? INSIGHT_COLOR.default;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 flex items-start gap-3 ${cls}`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    {ins.title && (
                      <p className="text-sm font-semibold mb-0.5">{ins.title}</p>
                    )}
                    <p className="text-sm">{ins.message}</p>
                    {ins.count != null && (
                      <p className="text-xs mt-1 opacity-70">
                        {ins.count.toLocaleString()} customers affected
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDA Explorer — calls POST /eda/summary and POST /eda/compare
// ─────────────────────────────────────────────────────────────────────────────

function EdaExplorer() {
  const [metric,   setMetric]   = useState("yearly_income");
  const [summary,  setSummary]  = useState<EdaSummaryResponse | null>(null);
  const [compare,  setCompare]  = useState<EdaCompareResponse | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    setCompare(null);
    try {
      const [s, c] = await Promise.all([
        getEdaSummary(metric),
        getEdaCompare(metric, "segment_label"),
      ]);
      setSummary(s);
      setCompare(c);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "EDA query failed");
    } finally {
      setLoading(false);
    }
  };

  const statEntries = summary
    ? Object.entries(summary.statistics).filter(([, v]) => v != null)
    : [];

  const metricLabel =
    EDA_METRICS.find((m) => m.value === metric)?.label ?? metric;
  const isINR = isIncomeMetric(metric);

  const compRows = compare?.comparison ?? [];
  const groupKey = compare?.group_by ?? "segment_label";

  // Find max mean for the compare bar chart
  const maxMean = compRows.reduce((m, row) => {
    const v = row["mean"] as number | undefined;
    return v != null ? Math.max(m, v) : m;
  }, 1);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Exploratory Data Analysis
        </h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E9041E]/30"
            >
              {EDA_METRICS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <Spinner size={14} />}
            {loading ? "Analysing…" : "Run Analysis"}
          </button>
        </div>
      </div>

      {error   && <ErrorBanner message={error} />}
      {loading && <LoadingCenter />}

      {summary && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* Summary stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              {metricLabel} — Descriptive Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statEntries.map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 capitalize">
                    {k.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {typeof v === "number"
                      ? isINR && ["mean", "min", "max", "std"].includes(k)
                        ? formatINR(v)
                        : v.toFixed(2)
                      : String(v)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Segment comparison bar chart */}
          {compRows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-5">
                {metricLabel} — Mean by {groupKey.replace(/_/g, " ")}
              </h3>
              <div className="space-y-4">
                {compRows.map((row, i) => {
                  const label = String(row[groupKey] ?? `Group ${i + 1}`);
                  const mean  = (row["mean"] as number | undefined) ?? 0;
                  const color = SEG_COLORS[label] ?? SG_RED;
                  return (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-700">
                          {label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {isINR ? formatINR(mean) : mean.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(mean / maxMean) * 100}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comparison detail table */}
          {compRows.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">
                  Full Comparison Table
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {compRows[0]
                        ? Object.keys(compRows[0]).map((k) => (
                            <th
                              key={k}
                              className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                              {k.replace(/_/g, " ")}
                            </th>
                          ))
                        : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {compRows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        {Object.entries(row).map(([k, v]) => (
                          <td key={k} className="px-4 py-3 text-xs text-gray-700">
                            {typeof v === "number"
                              ? isINR && k !== groupKey
                                ? formatINR(v)
                                : v.toFixed(2)
                              : String(v ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared micro-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div
        className="w-2 h-2 rounded-full mb-2"
        style={{ background: color ?? SG_RED }}
      />
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  desc,
  action,
  onAction,
}: {
  emoji: string;
  title: string;
  desc: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-5 max-w-sm mx-auto">{desc}</p>
      <button
        onClick={onAction}
        className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] transition-colors"
      >
        {action}
      </button>
    </div>
  );
}

function LoadingCenter() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner size={32} />
      <p className="text-xs text-gray-400">Querying backend…</p>
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <span className="text-[#E9041E] text-lg flex-shrink-0">⚠️</span>
      <div>
        <p className="text-sm font-semibold text-red-700">Error</p>
        <p className="text-sm text-red-600 mt-0.5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs text-[#E9041E] font-medium hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
