"use client";

import { useState } from "react";
import KpiCard from "@/components/KpiCard";
import SegmentBadge from "@/components/SegmentBadge";
import Spinner from "@/components/Spinner";
import { postQuery } from "@/lib/api";
import type { QueryResponse, Customer } from "@/types/api";

const EXAMPLE_QUERIES = [
  "Find premium customers in Bangalore",
  "Which customers can become premium?",
  "Show dormant customers",
  "Find customers with net worth above 5 lakh",
  "Show income distribution",
  "Recommend products for high-value customers",
];

const formatINR = (val?: number) => {
  if (val == null) return "—";
  if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)}Cr`;
  if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val}`;
};

export default function DashboardView() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const handleQuery = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedCustomer(null);
    try {
      const res = await postQuery(trimmed);
      setResult(res);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not reach the backend. Make sure the API is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(query);
  };

  const segmentCounts = result?.results
    ? result.results.reduce<Record<string, number>>((acc, c) => {
        const s = c.segment ?? "Unknown";
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
      }, {})
    : {};

  const avgPremium =
    result?.results && result.results.length > 0
      ? (
          result.results.reduce(
            (s, c) => s + (c.premium_potential ?? 0),
            0
          ) / result.results.length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Hero search */}
      <div
        className="rounded-2xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #E9041E 100%)",
        }}
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-300 mb-1">
            Bank360 AI
          </p>
          <h1 className="text-2xl font-bold mb-1">
            Customer Segmentation & Personalization
          </h1>
          <p className="text-sm text-gray-300 mb-6">
            Ask a question in natural language to explore customer segments,
            find premium prospects, and surface actionable insights.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find premium customers in Bangalore"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-white text-[#E9041E] font-semibold text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Spinner size={16} /> : null}
              {loading ? "Running…" : "Analyse"}
            </button>
          </form>

          {/* Example chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  handleQuery(q);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/25 text-gray-200 hover:bg-white/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          <svg
            className="w-5 h-5 text-[#E9041E] flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">
              Query failed
            </p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-fade-in">
          {/* Execution plan */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Execution Plan
              </h2>
              <span className="text-xs text-gray-400">
                {result.count} result{result.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                Intent: {result.plan?.intent ?? "—"}
              </span>
              {(result.plan?.tools ?? []).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-red-50 text-[#E9041E] text-xs rounded-md font-medium border border-red-100"
                >
                  {t}
                </span>
              ))}
            </div>
            {result.message && (
              <p className="mt-2 text-xs text-gray-500">{result.message}</p>
            )}
          </div>

          {/* KPI strip */}
          {result.results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KpiCard
                label="Total Found"
                value={result.count}
                icon="👥"
                accent="#E9041E"
              />
              <KpiCard
                label="Avg Premium Score"
                value={avgPremium ? `${avgPremium}%` : "—"}
                icon="⭐"
                accent="#1a1a1a"
              />
              <KpiCard
                label="Segments"
                value={Object.keys(segmentCounts).length}
                sub={Object.keys(segmentCounts).join(", ")}
                icon="🏷️"
                accent="#374151"
              />
              <KpiCard
                label="Avg Income"
                value={formatINR(
                  result.results.reduce(
                    (s, c) => s + (c.yearly_income ?? 0),
                    0
                  ) / result.results.length
                )}
                icon="💰"
                accent="#059669"
              />
            </div>
          )}

          {/* Statistics panel */}
          {result.statistics &&
            Object.keys(result.statistics).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Statistics
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(result.statistics).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 capitalize">
                        {k.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">
                        {typeof v === "number" ? v.toFixed(2) : String(v)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Customer table */}
          {result.results.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">
                  Customer Results
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Customer
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Segment
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Income
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Net Worth
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Premium %
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Confidence
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.results.slice(0, 100).map((c) => (
                      <tr
                        key={c.customer_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-xs">
                            {c.customer_id}
                          </p>
                          {c.city && (
                            <p className="text-xs text-gray-400">
                              {c.city}
                              {c.state ? `, ${c.state}` : ""}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {c.segment ? (
                            <SegmentBadge segment={c.segment} />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-800 text-xs">
                          {formatINR(c.yearly_income)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-600">
                          {formatINR(c.net_worth_estimate)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`text-xs font-semibold ${
                              (c.premium_potential ?? 0) >= 70
                                ? "text-emerald-600"
                                : (c.premium_potential ?? 0) >= 40
                                ? "text-amber-600"
                                : "text-gray-500"
                            }`}
                          >
                            {c.premium_potential != null
                              ? `${c.premium_potential.toFixed(0)}%`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500">
                          {c.confidence != null
                            ? `${(c.confidence * 100).toFixed(0)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="text-xs text-[#E9041E] font-medium hover:underline"
                          >
                            Detail →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.results.length > 100 && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                  Showing first 100 of {result.results.length} results
                </div>
              )}
            </div>
          )}

          {result.results.length === 0 && !result.statistics && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-medium text-gray-700">
                No customers matched
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try broadening your query or running training first.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer detail drawer */}
      {selectedCustomer && (
        <CustomerDetailDrawer
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

function CustomerDetailDrawer({
  customer: c,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const formatINR = (val?: number) => {
    if (val == null) return "—";
    if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)}Cr`;
    if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
    if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
    return `₹${val}`;
  };

  const scores = [
    {
      label: "Premium Potential",
      val: c.premium_potential,
      color: "#E9041E",
    },
    { label: "Financial Health", val: c.financial_health, color: "#059669" },
    {
      label: "Investment Readiness",
      val: c.investment_readiness,
      color: "#2563eb",
    },
    { label: "Activity Score", val: c.activity_score, color: "#7c3aed" },
    { label: "Dormancy Score", val: c.dormancy_score, color: "#d97706" },
    { label: "Loyalty Score", val: c.loyalty_score, color: "#0891b2" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
        role="dialog"
        aria-label="Customer Detail"
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #E9041E 100%)",
          }}
        >
          <div>
            <p className="text-xs text-red-300 font-semibold uppercase tracking-wide">
              Customer Profile
            </p>
            <p className="text-white font-bold text-lg mt-0.5">
              {c.customer_id}
            </p>
            {c.city && (
              <p className="text-gray-300 text-xs mt-0.5">
                {c.city}
                {c.state ? `, ${c.state}` : ""}
                {c.age ? ` · Age ${c.age}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Segment + financials */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {c.segment && <SegmentBadge segment={c.segment} />}
              {c.confidence != null && (
                <span className="text-xs text-gray-400">
                  Confidence {(c.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Yearly Income", val: formatINR(c.yearly_income) },
                {
                  label: "Net Worth",
                  val: formatINR(c.net_worth_estimate),
                },
                {
                  label: "Credit Score",
                  val: c.credit_score?.toFixed(0) ?? "—",
                },
                {
                  label: "Avg Monthly Spend",
                  val: formatINR(c.average_monthly_spend),
                },
                {
                  label: "Total Products",
                  val: c.total_products ?? "—",
                },
                { label: "Total Debt", val: formatINR(c.total_debt) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scores */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Score Breakdown
            </p>
            <div className="space-y-3">
              {scores.map(({ label, val, color }) =>
                val != null ? (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">{label}</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {val.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, val)}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Recommendations */}
          {c.recommendations && c.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Recommendations
              </p>
              <div className="space-y-2">
                {c.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-[#E9041E] text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {r.product}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          {c.explanation && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Why this result?
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {c.explanation.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
