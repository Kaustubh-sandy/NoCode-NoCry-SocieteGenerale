"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import { postQuery } from "@/lib/api";
import type { QueryResponse } from "@/types/api";

interface DistributionBucket {
  label: string;
  count: number;
}

const INSIGHT_QUERIES = [
  {
    id: "income_dist",
    label: "Income Distribution",
    query: "Show income distribution",
    icon: "💰",
    description: "Distribution of yearly income across all customers",
  },
  {
    id: "segment_dist",
    label: "Segment Breakdown",
    query: "Show segment distribution",
    icon: "🏷️",
    description: "How customers are distributed across segments",
  },
  {
    id: "dormant",
    label: "Dormant Customers",
    query: "Show dormant customers",
    icon: "💤",
    description: "Customers at risk of churn by dormancy score",
  },
  {
    id: "premium_prospects",
    label: "Premium Prospects",
    query: "Which customers can become premium?",
    icon: "⭐",
    description: "Non-premium customers ordered by premium potential",
  },
  {
    id: "high_value",
    label: "High-Value Customers",
    query: "Find customers with net worth above 5 lakh",
    icon: "💎",
    description: "Customers with significant net worth",
  },
  {
    id: "cross_sell",
    label: "Cross-Sell Opportunities",
    query: "Show cross-sell opportunities",
    icon: "🎯",
    description: "Customers with highest cross-sell potential",
  },
];

export default function InsightsView() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runInsight = async (id: string, query: string) => {
    setActiveId(id);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await postQuery(query, 100);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setLoading(false);
    }
  };

  // Build a simple bar-chart distribution from numeric values
  const buildDistribution = (
    values: (number | undefined)[],
    buckets = 8
  ): DistributionBucket[] => {
    const nums = values.filter((v): v is number => v != null);
    if (nums.length === 0) return [];
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min || 1;
    const step = range / buckets;
    const bins: DistributionBucket[] = Array.from({ length: buckets }, (_, i) => ({
      label: `${(min + i * step / 1_00_000).toFixed(1)}L`,
      count: 0,
    }));
    nums.forEach((v) => {
      const idx = Math.min(buckets - 1, Math.floor(((v - min) / range) * buckets));
      bins[idx].count++;
    });
    return bins;
  };

  const incomeDist = result
    ? buildDistribution(result.results.map((c) => c.yearly_income))
    : [];
  const maxCount = incomeDist.reduce((m, b) => Math.max(m, b.count), 1);

  const segmentGroups = result?.results
    ? result.results.reduce<Record<string, number>>((acc, c) => {
        const s = c.segment ?? "Unknown";
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {})
    : {};
  const maxSeg = Object.values(segmentGroups).reduce(
    (m, v) => Math.max(m, v),
    1
  );

  const segColors: Record<string, string> = {
    "Premium Investors": "#f59e0b",
    "Emerging Affluent": "#3b82f6",
    "Dormant Recovery": "#ef4444",
    "Everyday Banking": "#6b7280",
  };

  return (
    <div className="space-y-5">
      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {INSIGHT_QUERIES.map((item) => (
          <button
            key={item.id}
            onClick={() => runInsight(item.id, item.query)}
            className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              activeId === item.id
                ? "border-[#E9041E] bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <p
              className={`mt-2 text-sm font-semibold ${
                activeId === item.id ? "text-[#E9041E]" : "text-gray-800"
              }`}
            >
              {item.label}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size={32} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* Plan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-gray-700">
                Analysis Plan — {result.plan?.intent}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(result.plan?.tools ?? []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-red-50 text-[#E9041E] text-xs rounded-md font-medium border border-red-100"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Statistics */}
          {result.statistics &&
            Object.keys(result.statistics).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Summary Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(result.statistics).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 capitalize">
                        {k.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        {typeof v === "number" ? v.toFixed(2) : String(v)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Income distribution chart */}
          {incomeDist.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Income Distribution
              </h3>
              <div className="flex items-end gap-1.5 h-32">
                {incomeDist.map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t transition-all duration-700"
                      style={{
                        height: `${Math.max(4, (b.count / maxCount) * 112)}px`,
                        background: "#E9041E",
                        opacity: 0.6 + 0.4 * (b.count / maxCount),
                      }}
                    />
                    <span
                      className="text-[9px] text-gray-400 rotate-45 origin-left"
                      style={{ writingMode: "horizontal-tb" }}
                    >
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Based on {result.results.length} customers
              </p>
            </div>
          )}

          {/* Segment breakdown */}
          {Object.keys(segmentGroups).length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Segment Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(segmentGroups)
                  .sort(([, a], [, b]) => b - a)
                  .map(([seg, count]) => (
                    <div key={seg}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-700">{seg}</span>
                        <span className="text-xs font-semibold text-gray-800">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(count / maxSeg) * 100}%`,
                            background: segColors[seg] ?? "#6b7280",
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Message */}
          {result.message && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              {result.message}
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm font-medium text-gray-700">
            Select an insight above to run analysis
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Results and charts will appear here
          </p>
        </div>
      )}
    </div>
  );
}
