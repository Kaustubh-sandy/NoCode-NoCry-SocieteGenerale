"use client";

import { useState } from "react";
import SegmentBadge from "@/components/SegmentBadge";
import Spinner from "@/components/Spinner";
import { postQuery } from "@/lib/api";
import type { QueryResponse } from "@/types/api";

const formatINR = (val?: number) => {
  if (val == null) return "—";
  if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)}Cr`;
  if (val >= 1_00_000) return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val}`;
};

const SEGMENT_OPTIONS = [
  "All Segments",
  "Premium Investors",
  "Emerging Affluent",
  "Dormant Recovery",
  "Everyday Banking",
];

const CITY_OPTIONS = [
  "All Cities",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Indore",
];

export default function CustomersView() {
  const [segment, setSegment] = useState("All Segments");
  const [city, setCity] = useState("All Cities");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("premium_potential");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const runFilter = async () => {
    const parts: string[] = [];
    if (segment !== "All Segments") parts.push(segment.split(" ")[0]);
    if (city !== "All Cities") parts.push(`in ${city}`);
    if (parts.length === 0) parts.push("Show all customers");
    const q = parts.join(" ").trim();

    setLoading(true);
    setError(null);
    try {
      const res = await postQuery(q, 200);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Query failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = result?.results
    ? [...result.results].sort((a, b) => {
        const va = ((a as unknown as Record<string, unknown>)[sortKey] as number) ?? 0;
        const vb = ((b as unknown as Record<string, unknown>)[sortKey] as number) ?? 0;
        return sortDir === "asc" ? va - vb : vb - va;
      })
    : [];

  const SortIcon = ({ col }: { col: string }) =>
    sortKey === col ? (
      <span className="ml-1 text-[#E9041E]">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    ) : (
      <span className="ml-1 text-gray-300">↕</span>
    );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Filter Customers
        </h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Segment
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E9041E]/30"
            >
              {SEGMENT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E9041E]/30"
            >
              {CITY_OPTIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={runFilter}
            disabled={loading}
            className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <Spinner size={14} />}
            {loading ? "Loading…" : "Apply Filters"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {result?.count} customer{result?.count !== 1 ? "s" : ""}
            </h2>
            <span className="text-xs text-gray-400">
              Sorted by {sortKey.replace(/_/g, " ")}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    { label: "Customer ID", key: "customer_id" },
                    { label: "City", key: "city" },
                    { label: "Segment", key: "segment" },
                    { label: "Income", key: "yearly_income" },
                    { label: "Net Worth", key: "net_worth_estimate" },
                    { label: "Credit Score", key: "credit_score" },
                    { label: "Premium %", key: "premium_potential" },
                    { label: "Dormancy", key: "dormancy_score" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none"
                      onClick={() => toggleSort(key)}
                    >
                      {label}
                      <SortIcon col={key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.slice(0, 150).map((c) => (
                  <tr
                    key={c.customer_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 text-xs">
                      {c.customer_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.city ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.segment ? (
                        <SegmentBadge segment={c.segment} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                      {formatINR(c.yearly_income)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {formatINR(c.net_worth_estimate)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {c.credit_score?.toFixed(0) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`font-semibold ${
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
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`font-semibold ${
                          (c.dormancy_score ?? 0) >= 60
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {c.dormancy_score?.toFixed(0) ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length > 150 && (
            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-400">
              Showing 150 of {sorted.length} results
            </div>
          )}
        </div>
      )}

      {!loading && !error && result?.count === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm text-gray-600">No customers matched</p>
        </div>
      )}

      {!result && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">🏦</p>
          <p className="text-sm font-medium text-gray-700">
            Select filters and click Apply
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Results will appear here
          </p>
        </div>
      )}
    </div>
  );
}
