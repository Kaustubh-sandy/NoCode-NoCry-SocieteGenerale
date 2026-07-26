'use client';

import React, { useEffect, useState } from 'react';

// Types
interface Segment {
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

interface SegmentResponse {
  total_customers: number;
  segments: Segment[];
}

export default function SegmentOverview() {
  const [data, setData] = useState<SegmentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:8000/segments');
        if (!res.ok) {
          throw new Error('Failed to fetch segment data');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  // Indian currency formatter
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(2)} k`;
    return `₹${value.toFixed(0)}`;
  };

  // Theme color mapping
  const getSegmentColor = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('premium')) return 'bg-emerald-500';
    if (lower.includes('emerging') || lower.includes('affluent')) return 'bg-indigo-400';
    if (lower.includes('everyday') || lower.includes('banking')) return 'bg-slate-400';
    if (lower.includes('dormant') || lower.includes('recovery')) return 'bg-amber-400';
    return 'bg-rose-500'; // fallback
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Top Bar Skeleton */}
        <div className="h-24 w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md"></div>
        {/* Chart Skeleton */}
        <div className="h-32 w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md"></div>
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 backdrop-blur-md">
        <div className="font-semibold mb-1">Failed to load segments</div>
        <div className="text-sm opacity-80">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full space-y-6 text-slate-200">
      
      {/* Top Bar: Total Customers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Total Customer Base
          </h2>
          <div className="text-4xl font-light text-white tracking-tight">
            {data.total_customers.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-slate-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span>Live Data Sync</span>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Portfolio Distribution
        </h3>
        
        {/* Stacked Bar */}
        <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-950 shadow-inner">
          {data.segments.map((s) => (
            <div
              key={s.segment_label}
              style={{ width: `${s.percentage}%` }}
              className={`h-full ${getSegmentColor(s.segment_label)} transition-all duration-1000 ease-out hover:opacity-80`}
              title={`${s.segment_label}: ${s.percentage.toFixed(1)}%`}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
          {data.segments.map((s) => (
            <div key={s.segment_label} className="flex items-center text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full mr-2 shadow-sm ${getSegmentColor(s.segment_label)}`}></span>
              <span className="font-medium">{s.segment_label}</span>
              <span className="ml-1.5 text-slate-500 font-mono">{s.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.segments.map((s) => (
          <div
            key={s.segment_label}
            className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
            {/* Subtle top gradient accent */}
            <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${getSegmentColor(s.segment_label)}`} />
            
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getSegmentColor(s.segment_label)} shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${getSegmentColor(s.segment_label).split('-')[1]}-500/50`}></div>
                <h4 className="font-semibold text-slate-100 tracking-wide text-sm">{s.segment_label}</h4>
              </div>
              <div className="text-right">
                <div className="text-xl font-medium text-white">{s.count.toLocaleString('en-IN')}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">{s.percentage.toFixed(1)}% Base</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-4 mb-6 flex-1">
              <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-400">Avg Income</span>
                <span className="font-mono text-sm text-slate-200">{formatCurrency(s.avg_income)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-400">Net Worth</span>
                <span className="font-mono text-sm text-slate-200">{formatCurrency(s.avg_net_worth)}</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-800/50 pb-2">
                <span className="text-xs text-slate-400">Credit Score</span>
                <span className={`font-mono text-sm ${s.avg_credit_score >= 750 ? 'text-emerald-400' : s.avg_credit_score >= 650 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {Math.round(s.avg_credit_score)}
                </span>
              </div>
            </div>

            {/* Premium Potential Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-[11px] mb-2">
                <span className="text-slate-400 uppercase tracking-wider font-semibold">Premium Potential</span>
                <span className="text-slate-200 font-mono">{s.avg_premium_potential.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full ${getSegmentColor(s.segment_label)} opacity-75 group-hover:opacity-100 transition-all duration-500`}
                  style={{ width: `${s.avg_premium_potential}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
