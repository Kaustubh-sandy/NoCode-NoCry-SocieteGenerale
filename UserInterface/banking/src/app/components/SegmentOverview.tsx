'use client';

import React, { useState, useEffect } from 'react';
import { SegmentsResponse, SegmentInfo } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function SegmentOverview() {
  const [data, setData] = useState<SegmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/segments`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Segments fetch error:', err);
        setError('Unable to load segment distribution. Ensure backend API is online.');
        setLoading(false);
      });
  }, []);

  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const getSegmentColor = (label: string) => {
    if (label.includes('Premium')) return { dot: 'bg-emerald-400', bar: 'bg-emerald-500', border: 'border-emerald-500/30', bg: 'from-emerald-950/30' };
    if (label.includes('Emerging')) return { dot: 'bg-indigo-400', bar: 'bg-indigo-500', border: 'border-indigo-500/30', bg: 'from-indigo-950/30' };
    if (label.includes('Dormant')) return { dot: 'bg-amber-400', bar: 'bg-amber-500', border: 'border-amber-500/30', bg: 'from-amber-950/30' };
    return { dot: 'bg-slate-400', bar: 'bg-slate-500', border: 'border-slate-700/50', bg: 'from-slate-900/40' };
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-slate-800" />
        <div className="h-10 w-full rounded bg-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-xl bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300 text-xs">
        ⚠️ {error || 'No segment data available.'}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            Banking Customer Segment Distribution
            <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
              K-Means AI Persona Clustering
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Customer Warehouse Population: <span className="font-mono text-white font-bold">{data.total_customers.toLocaleString()}</span> Accounts
          </p>
        </div>
      </div>

      {/* Horizontal Segment Percentage Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-400">
          <span>Cluster Distribution (%)</span>
          <span>100% Total</span>
        </div>
        <div className="flex h-5 w-full overflow-hidden rounded-xl bg-slate-950 p-1 border border-slate-800">
          {data.segments.map((seg, idx) => {
            const colors = getSegmentColor(seg.segment_label);
            return (
              <div
                key={idx}
                className={`h-full ${colors.bar} transition-all duration-300 first:rounded-l-lg last:rounded-r-lg hover:opacity-90`}
                style={{ width: `${seg.percentage}%` }}
                title={`${seg.segment_label}: ${seg.percentage}% (${seg.count} customers)`}
              />
            );
          })}
        </div>
      </div>

      {/* 4 Segment Persona Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.segments.map((seg, idx) => {
          const colors = getSegmentColor(seg.segment_label);
          return (
            <div
              key={idx}
              className={`rounded-xl border ${colors.border} bg-gradient-to-b ${colors.bg} to-slate-950 p-4 space-y-3 shadow-lg hover:border-slate-700 transition-all duration-200`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                  <h3 className="font-bold text-white text-sm tracking-wide">{seg.segment_label}</h3>
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">{seg.percentage}%</span>
              </div>

              {/* Count */}
              <div className="text-xl font-bold font-mono text-white">
                {seg.count.toLocaleString()} <span className="text-xs font-normal text-slate-500">customers</span>
              </div>

              {/* Sub-Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Avg Income</span>
                  <span className="font-mono font-semibold text-rose-400">{fmt(seg.avg_income)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Avg Net Worth</span>
                  <span className="font-mono font-semibold text-emerald-400">{fmt(seg.avg_net_worth)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Avg Credit Score</span>
                  <span className="font-mono font-semibold text-indigo-400">{seg.avg_credit_score}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Avg Monthly Spend</span>
                  <span className="font-mono font-semibold text-amber-400">{fmt(seg.avg_total_spend)}</span>
                </div>
              </div>

              {/* Premium Potential Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Premium Potential Score</span>
                  <span className="font-mono text-white">{seg.avg_premium_potential}/100</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(seg.avg_premium_potential, 100)}%` }} />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
