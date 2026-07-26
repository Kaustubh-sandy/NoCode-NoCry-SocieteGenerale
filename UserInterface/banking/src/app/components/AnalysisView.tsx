'use client';

import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisViewProps {
  analysis: AnalysisResult | null;
}

export default function AnalysisView({ analysis }: AnalysisViewProps) {
  if (!analysis) return null;

  const { column, statistics } = analysis;

  const formatVal = (val: number) => {
    if (column.includes('income') || column.includes('worth') || column.includes('balance')) {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)} k`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return val?.toString();
  };

  // Generate quartile simulation bars for histogram representation
  const quartileBars = [
    { label: 'Min', val: statistics.min, heightPercent: 20 },
    { label: '25th %', val: statistics['25%'], heightPercent: 45 },
    { label: 'Median (50%)', val: statistics['50%'], heightPercent: 75 },
    { label: '75th %', val: statistics['75%'], heightPercent: 90 },
    { label: 'Max', val: statistics.max, heightPercent: 100 },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-blue-400 border border-blue-500/20 uppercase">
              EDA & Distribution Agent
            </span>
            <span className="text-xs text-slate-400 font-mono">Column: {column}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 capitalize">
            Descriptive Statistics & Distribution Analysis
          </h2>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Count</span>
          <p className="text-lg font-bold text-white font-mono mt-1">{statistics.count?.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Mean Average</span>
          <p className="text-lg font-bold text-rose-400 font-mono mt-1">{formatVal(statistics.mean)}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Median (50%)</span>
          <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{formatVal(statistics['50%'])}</p>
        </div>
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Std Deviation</span>
          <p className="text-lg font-bold text-indigo-400 font-mono mt-1">{formatVal(statistics.std)}</p>
        </div>
      </div>

      {/* SVG Distribution Histogram Bars */}
      <div className="mt-6 rounded-xl bg-slate-950 p-5 border border-slate-800">
        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
          Distribution Quartiles Histogram ({column})
        </h3>
        <div className="flex items-end justify-between h-48 px-6 pt-6 pb-2">
          {quartileBars.map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-2 flex-1 max-w-[80px]">
              <span className="text-[10px] font-mono text-slate-300 font-bold">{formatVal(bar.val)}</span>
              <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden flex items-end h-32 border-x border-t border-slate-800">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 via-indigo-500 to-rose-500 rounded-t-lg transition-all duration-700"
                  style={{ height: `${bar.heightPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
