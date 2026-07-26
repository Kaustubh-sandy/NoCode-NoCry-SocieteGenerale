"use client";

import { useState } from "react";
import SegmentBadge from "@/components/SegmentBadge";
import Spinner from "@/components/Spinner";
import { getCustomers, getCustomerById, postQuery } from "@/lib/api";
import type { Customer, CustomerListResponse } from "@/types/api";

const formatINR = (val?: number) => {
  if (val == null) return "—";
  if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)}Cr`;
  if (val >= 1_00_000)    return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000)       return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val}`;
};

const SEGMENT_OPTIONS = [
  "All Segments", "Premium Investors", "Emerging Affluent",
  "Dormant Recovery", "Everyday Banking",
];
const CITY_OPTIONS = [
  "All Cities", "Bangalore", "Mumbai", "Delhi",
  "Pune", "Hyderabad", "Chennai", "Kolkata", "Indore",
];
const PAGE_SIZE = 100;

type Mode = "browse" | "search";

export default function CustomersView() {
  const [mode, setMode] = useState<Mode>("browse");

  // Browse state (GET /customers)
  const [browseData, setBrowseData] = useState<CustomerListResponse | null>(null);
  const [offset, setOffset]         = useState(0);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError,   setBrowseError]   = useState<string | null>(null);

  // Search state (POST /query)
  const [segment, setSegment] = useState("All Segments");
  const [city,    setCity]    = useState("All Cities");
  const [queryResults, setQueryResults] = useState<Customer[]>([]);
  const [queryCount,   setQueryCount]   = useState<number | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError,   setSearchError]   = useState<string | null>(null);

  // Shared sort state
  const [sortKey, setSortKey] = useState("premium_potential");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Customer detail drawer
  const [selected, setSelected]   = useState<Customer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Browse ──────────────────────────────────────────────────────────────

  const loadPage = async (newOffset = 0) => {
    setBrowseLoading(true);
    setBrowseError(null);
    try {
      const data = await getCustomers(PAGE_SIZE, newOffset);
      setBrowseData(data);
      setOffset(newOffset);
    } catch (e: unknown) {
      setBrowseError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setBrowseLoading(false);
    }
  };

  // ── Search ──────────────────────────────────────────────────────────────

  const runSearch = async () => {
    const parts: string[] = [];
    if (segment !== "All Segments") parts.push(segment.split(" ")[0]);
    if (city    !== "All Cities")   parts.push(`in ${city}`);
    if (parts.length === 0)         parts.push("Show all customers");
    const q = parts.join(" ").trim();

    setSearchLoading(true);
    setSearchError(null);
    setQueryResults([]);
    setQueryCount(null);
    try {
      const res = await postQuery(q, 200);
      setQueryResults(res.results);
      setQueryCount(res.count);
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Sorting ─────────────────────────────────────────────────────────────

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sortRows = (rows: Customer[]) =>
    [...rows].sort((a, b) => {
      const va = (a[sortKey] as number) ?? 0;
      const vb = (b[sortKey] as number) ?? 0;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  // ── Detail drawer ────────────────────────────────────────────────────────

  const openDetail = async (c: Customer) => {
    setSelected(c);
    setDetailLoading(true);
    try {
      const full = await getCustomerById(c.customer_id);
      setSelected(full);
    } catch {
      // keep the partial data we already have
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Current rows to display ──────────────────────────────────────────────

  const rows =
    mode === "search"
      ? sortRows(queryResults)
      : sortRows(browseData?.customers ?? []);

  const SortIcon = ({ col }: { col: string }) =>
    sortKey === col
      ? <span className="ml-1 text-[#E9041E]">{sortDir === "asc" ? "↑" : "↓"}</span>
      : <span className="ml-1 text-gray-300">↕</span>;

  const loading = mode === "browse" ? browseLoading : searchLoading;
  const error   = mode === "browse" ? browseError   : searchError;

  return (
    <div className="space-y-5">
      {/* Mode toggle + controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
          {(["browse", "search"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${
                mode === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "browse" ? "Browse All" : "Filter Search"}
            </button>
          ))}
        </div>

        {mode === "browse" ? (
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">
              Load paginated customers directly from the feature store.
            </p>
            <button
              onClick={() => loadPage(0)}
              disabled={browseLoading}
              className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {browseLoading && <Spinner size={14} />}
              {browseLoading ? "Loading…" : browseData ? "Reload" : "Load Customers"}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E9041E]/30"
              >
                {SEGMENT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#E9041E]/30"
              >
                {CITY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={runSearch}
              disabled={searchLoading}
              className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {searchLoading && <Spinner size={14} />}
              {searchLoading ? "Searching…" : "Apply Filters"}
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      )}

      {/* Table */}
      {rows.length > 0 && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {mode === "browse"
                ? `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, browseData?.total ?? 0)} of ${(browseData?.total ?? 0).toLocaleString()} customers`
                : `${queryCount?.toLocaleString() ?? rows.length} customers matched`}
            </p>
            <span className="text-xs text-gray-400">
              Sort: {sortKey.replace(/_/g, " ")} {sortDir === "asc" ? "↑" : "↓"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    { label: "Customer ID",  key: "customer_id" },
                    { label: "City",         key: "city" },
                    { label: "Segment",      key: "segment_label" },
                    { label: "Income",       key: "yearly_income" },
                    { label: "Net Worth",    key: "net_worth_estimate" },
                    { label: "Credit Score", key: "credit_score" },
                    { label: "Premium %",    key: "premium_potential" },
                    { label: "Dormancy",     key: "dormancy_score" },
                  ].map(({ label, key }) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none"
                    >
                      {label}<SortIcon col={key} />
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((c) => {
                  const seg = c.segment_label ?? c.segment;
                  return (
                    <tr key={c.customer_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 text-xs">
                        {c.customer_id}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.city ?? "—"}</td>
                      <td className="px-4 py-3">
                        {seg ? <SegmentBadge segment={seg} /> : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                        {formatINR(c.yearly_income)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {formatINR(c.net_worth_estimate)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {(c.credit_score as number | undefined)?.toFixed(0) ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`font-semibold ${
                          (c.premium_potential ?? 0) >= 70 ? "text-emerald-600"
                          : (c.premium_potential ?? 0) >= 40 ? "text-amber-600"
                          : "text-gray-500"
                        }`}>
                          {c.premium_potential != null
                            ? `${(c.premium_potential as number).toFixed(0)}%`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className={`font-semibold ${
                          (c.dormancy_score ?? 0) >= 60 ? "text-red-600" : "text-gray-500"
                        }`}>
                          {c.dormancy_score != null
                            ? (c.dormancy_score as number).toFixed(0)
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openDetail(c)}
                          className="text-xs text-[#E9041E] font-medium hover:underline"
                        >
                          Detail →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination for browse mode */}
          {mode === "browse" && browseData && browseData.total > PAGE_SIZE && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => loadPage(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0 || browseLoading}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-400">
                Page {Math.floor(offset / PAGE_SIZE) + 1} of{" "}
                {Math.ceil(browseData.total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => loadPage(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= browseData.total || browseLoading}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty states */}
      {!loading && rows.length === 0 && (mode === "browse" ? !browseData : queryCount === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm text-gray-600">No customers matched</p>
        </div>
      )}
      {!loading && rows.length === 0 && mode === "browse" && !browseData && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">🏦</p>
          <p className="text-sm font-medium text-gray-700">Click "Load Customers" to browse the feature store</p>
        </div>
      )}
      {!loading && rows.length === 0 && mode === "search" && queryCount === null && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-3xl mb-3">🔎</p>
          <p className="text-sm font-medium text-gray-700">Set filters and click Apply Filters</p>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <CustomerDetailDrawer
          customer={selected}
          loading={detailLoading}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer detail drawer (full profile from GET /customers/{id})
// ─────────────────────────────────────────────────────────────────────────────

function CustomerDetailDrawer({
  customer: c,
  loading,
  onClose,
}: {
  customer: Customer;
  loading: boolean;
  onClose: () => void;
}) {
  const seg = c.segment_label ?? c.segment;

  const scores = [
    { label: "Premium Potential",   val: c.premium_potential,    color: "#E9041E" },
    { label: "Financial Health",     val: c.financial_health,     color: "#059669" },
    { label: "Investment Readiness", val: c.investment_readiness, color: "#2563eb" },
    { label: "Activity Score",       val: c.activity_score,       color: "#7c3aed" },
    { label: "Dormancy Score",       val: c.dormancy_score,       color: "#d97706" },
    { label: "Loyalty Score",        val: c.loyalty_score,        color: "#0891b2" },
    { label: "Cross-Sell Score",     val: c.cross_sell_score,     color: "#0d9488" },
  ];

  const financials = [
    { label: "Yearly Income",       val: formatINR2(c.yearly_income) },
    { label: "Net Worth",           val: formatINR2(c.net_worth_estimate) },
    { label: "Credit Score",        val: (c.credit_score as number | undefined)?.toFixed(0) ?? "—" },
    { label: "Avg Monthly Spend",   val: formatINR2(c.average_monthly_spend) },
    { label: "Total Debt",          val: formatINR2(c.total_debt) },
    { label: "Total Products",      val: c.total_products != null ? String(c.total_products) : "—" },
    { label: "Tx Count",            val: c.total_transaction_count != null ? String(c.total_transaction_count) : "—" },
    { label: "Total Spend",         val: formatINR2(c.total_historical_spend as number | undefined) },
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
          className="px-6 py-5 flex items-center justify-between sticky top-0 z-10"
          style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #E9041E 100%)" }}
        >
          <div>
            <p className="text-xs text-red-300 font-semibold uppercase tracking-wide">
              Customer Profile
            </p>
            <p className="text-white font-bold text-lg mt-0.5">{c.customer_id}</p>
            <p className="text-gray-300 text-xs mt-0.5">
              {c.city}{c.state ? `, ${c.state}` : ""}
              {c.age ? ` · Age ${c.age}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size={28} />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Segment */}
            <div className="flex items-center gap-2">
              {seg && <SegmentBadge segment={seg} />}
              {c.confidence != null && (
                <span className="text-xs text-gray-400">
                  Confidence {((c.confidence as number) * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Financials grid */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Financial Profile
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {financials.map(({ label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 leading-tight">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score bars */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                AI Scores
              </p>
              <div className="space-y-2.5">
                {scores.map(({ label, val, color }) =>
                  val != null ? (
                    <div key={label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">{label}</span>
                        <span className="text-xs font-semibold text-gray-800">
                          {(val as number).toFixed(0)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, val as number)}%`, background: color }}
                        />
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {/* Recommendations */}
            {c.recommendations && (c.recommendations as []).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Recommendations
                </p>
                <div className="space-y-2">
                  {(c.recommendations as { product: string; reason: string }[]).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-[#E9041E] text-white rounded-full text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.product}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>
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
                  {(c.explanation as { summary: string }).summary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatINR2(val?: number) {
  if (val == null) return "—";
  if (val >= 1_00_00_000) return `₹${(val / 1_00_00_000).toFixed(1)}Cr`;
  if (val >= 1_00_000)    return `₹${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1_000)       return `₹${(val / 1_000).toFixed(0)}K`;
  return `₹${val}`;
}
