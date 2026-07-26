'use client';

import React, { useState, useEffect } from 'react';
import { CustomerRecord } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface CustomerBrowserProps {
  onSelectCustomer: (customer: CustomerRecord) => void;
}

export default function CustomerBrowser({ onSelectCustomer }: CustomerBrowserProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/customers?limit=${limit}&offset=${offset}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setCustomers(data.customers || []);
          setTotal(data.total || 0);
        }
      })
      .catch(err => console.error('Browser fetch error:', err))
      .finally(() => setLoading(false));
  }, [offset, limit]);

  const filtered = customers.filter(c => {
    const matchesSearch = c.customer_id.toLowerCase().includes(search.toLowerCase()) ||
                          c.city.toLowerCase().includes(search.toLowerCase());
    const matchesSegment = segmentFilter === 'ALL' || c.segment_label === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">👥 Customer Warehouse Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">Paginated browser accessing all 20,000 customer records</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'Premium Investors', 'Emerging Affluent', 'Everyday Banking', 'Dormant Recovery'].map(seg => (
            <button
              key={seg}
              onClick={() => setSegmentFilter(seg)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                segmentFilter === seg
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by customer ID or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl bg-slate-950 px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 border border-slate-800 focus:border-rose-500 focus:outline-none"
        />
        <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="h-64 rounded-xl bg-slate-950/60 animate-pulse flex items-center justify-center text-xs text-slate-500">
          Loading Customer Records...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer ID</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Segment</th>
                <th className="px-4 py-3 font-semibold text-right">Yearly Income</th>
                <th className="px-4 py-3 font-semibold text-right">Net Worth</th>
                <th className="px-4 py-3 font-semibold text-center">Credit Score</th>
                <th className="px-4 py-3 font-semibold text-center">Activity Score</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map(c => (
                <tr
                  key={c.customer_id}
                  onClick={() => onSelectCustomer(c)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-4 py-3 font-mono font-bold text-white">#{c.customer_id}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200 border border-slate-700">
                      {c.segment_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-white">{fmt(c.yearly_income)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">{fmt(c.net_worth_estimate)}</td>
                  <td className="px-4 py-3 text-center font-mono text-indigo-400">{c.credit_score}</td>
                  <td className="px-4 py-3 text-center font-mono text-purple-400">{c.activity_score}/100</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectCustomer(c);
                      }}
                      className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-slate-700"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
        <span className="text-slate-400">
          Showing <strong className="text-white font-mono">{offset + 1}</strong> - <strong className="text-white font-mono">{Math.min(offset + limit, total)}</strong> of <strong className="text-white font-mono">{total.toLocaleString()}</strong> records
        </span>

        <div className="flex items-center space-x-2">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 disabled:opacity-40 hover:bg-slate-700 border border-slate-700"
          >
            ← Previous
          </button>

          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 disabled:opacity-40 hover:bg-slate-700 border border-slate-700"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
