'use client';

import React, { useState, useEffect } from 'react';
import { AnalysisResult, EDASummaryResponse, EDACompareResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface EDAExplorerProps {
  analysis?: AnalysisResult | null;
}

const METRIC_OPTIONS = [
  { label: 'Yearly Income', value: 'yearly_income' },
  { label: 'Net Worth Estimate', value: 'net_worth_estimate' },
  { label: 'Credit Score', value: 'credit_score' },
  { label: 'Premium Potential', value: 'premium_potential' },
  { label: 'Activity Score', value: 'activity_score' },
  { label: 'Financial Health', value: 'financial_health' },
  { label: 'Investment Readiness', value: 'investment_readiness' },
  { label: 'Digital Adoption Score', value: 'digital_adoption_score' },
  { label: 'Dormancy Score', value: 'dormancy_score' },
  { label: 'Savings Balance', value: 'savings_balance' },
  { label: 'Average Monthly Spend', value: 'average_monthly_spend' },
];

export default function EDAExplorer({ analysis }: EDAExplorerProps) {
  const [selectedMetric, setSelectedMetric] = useState('yearly_income');
  const [summary, setSummary] = useState<EDASummaryResponse | null>(null);
  const [compareData, setCompareData] = useState<EDACompareResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/eda/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: selectedMetric, group_by: 'segment_label' }),
      }).then(r => r.ok ? r.json() : null),

      fetch(`${API_BASE_URL}/eda/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: selectedMetric, group_by: 'segment_label' }),
      }).then(r => r.ok ? r.json() : null),
    ])
      .then(([sumRes, compRes]) => {
        if (sumRes) setSummary(sumRes);
        if (compRes) setCompareData(compRes);
      })
      .catch(err => console.error('EDA fetch error:', err))
      .finally(() => setLoading(false));
  }, [selectedMetric]);

  const stats = summary?.statistics || analysis?.statistics;

  const fmt = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const getSegmentColor = (segName: string) => {
    if (segName.includes('Premium')) return 'bg-emerald-500';
    if (segName.includes('Emerging')) return 'bg-indigo-500';
    if (segName.includes('Dormant')) return 'bg-amber-500';
    return 'bg-slate-500';
  };

  const comparisonMap = compareData?.comparison || {};
  const maxMean = Math.max(...Object.values(comparisonMap).map(v => v.mean || 0), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-6">
      {/* Header & Metric Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            📊 Exploratory Data Analysis & Metric Profiler
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Statistical distributions & cross-segment comparisons across 20,000 customers</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-400">Select Metric:</label>
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
            className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-rose-400 border border-slate-800 focus:border-rose-500 focus:outline-none"
          >
            {METRIC_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-950/60 animate-pulse flex items-center justify-center text-xs text-slate-500">
          Calculating EDA Distribution Statistics...
        </div>
      ) : (
        <>
          {/* Summary Statistics Grid */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { label: 'Sample Count', value: stats.count.toLocaleString() },
                { label: 'Mean Average', value: fmt(stats.mean) },
                { label: 'Median (50%)', value: fmt(stats['50%']) },
                { label: 'Std Deviation', value: fmt(stats.std) },
                { label: 'Min Value', value: fmt(stats.min) },
                { label: 'Max Value', value: fmt(stats.max) },
                { label: 'Interquartile (IQR)', value: fmt(stats.iqr) },
                { label: 'Skewness', value: stats.skewness?.toFixed(2) || '0.00' },
                { label: 'Kurtosis', value: stats.kurtosis?.toFixed(2) || '0.00' },
                { label: 'Outlier Count', value: stats.outlier_count?.toString() || '0' },
              ].map((item, idx) => (
                <div key={idx} className="metric-card">
                  <span className="text-[10px] uppercase font-bold text-slate-500">{item.label}</span>
                  <p className="text-base font-bold font-mono text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Group-by Segment Comparison Chart */}
          <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Segment Comparison: {selectedMetric.replace('_', ' ').toUpperCase()}</span>
              <span className="text-[10px] font-mono text-slate-500">Mean Values</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(comparisonMap).map(([segName, segStats]) => {
                const percentage = Math.min(((segStats.mean || 0) / maxMean) * 100, 100);
                const colorClass = getSegmentColor(segName);
                return (
                  <div key={segName} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white">{segName} ({segStats.count} accounts)</span>
                      <span className="font-mono text-emerald-400">{fmt(segStats.mean)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
