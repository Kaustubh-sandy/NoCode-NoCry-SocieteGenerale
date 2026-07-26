'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { AnalysisResult } from '../types';

interface EDAExplorerProps {
  analysis?: AnalysisResult | null;
}

interface SummaryStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  '25%': number;
  '50%': number;
  '75%': number;
  max: number;
  iqr?: number;
  skewness?: number;
  kurtosis?: number;
  outlier_count?: number;
}

interface ComparisonData {
  [key: string]: {
    count: number;
    mean: number;
    median: number;
    std: number;
    min: number;
    max: number;
  };
}

const METRICS = [
  { value: 'yearly_income', label: 'Yearly Income', isMonetary: true },
  { value: 'net_worth_estimate', label: 'Net Worth Estimate', isMonetary: true },
  { value: 'credit_score', label: 'Credit Score', isMonetary: false },
  { value: 'premium_potential', label: 'Premium Potential', isMonetary: false },
  { value: 'activity_score', label: 'Activity Score', isMonetary: false },
  { value: 'financial_health', label: 'Financial Health', isMonetary: false },
  { value: 'investment_readiness', label: 'Investment Readiness', isMonetary: false },
  { value: 'digital_adoption_score', label: 'Digital Adoption Score', isMonetary: false },
  { value: 'dormancy_score', label: 'Dormancy Score', isMonetary: false },
  { value: 'savings_balance', label: 'Savings Balance', isMonetary: true },
  { value: 'average_monthly_spend', label: 'Average Monthly Spend', isMonetary: true },
];

const GROUP_BYS = [
  { value: 'segment_label', label: 'Segment Label' },
  { value: 'city', label: 'City' },
];

// Indian currency formatter
const formatIndianCurrency = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toFixed(0)}`;
};

const formatNumber = (value: number, isMonetary: boolean) => {
  if (value === undefined || value === null || isNaN(value)) return '-';
  if (isMonetary) return formatIndianCurrency(value);
  
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(2)}k`;
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
};

export default function EDAExplorer({ analysis }: EDAExplorerProps) {
  const initialMetric = analysis?.column || 'yearly_income';
  const [metric, setMetric] = useState(initialMetric);
  const [groupBy, setGroupBy] = useState('segment_label');
  
  const [summary, setSummary] = useState<SummaryStats | null>(analysis?.statistics || null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState<string | null>(null);

  const isMonetary = useMemo(() => {
    const found = METRICS.find(m => m.value === metric);
    return found ? found.isMonetary : false;
  }, [metric]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, compareRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/eda/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metric, group_by: groupBy }),
          }),
          fetch('http://127.0.0.1:8000/eda/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metric, group_by: groupBy }),
          })
        ]);

        if (!summaryRes.ok) throw new Error('Failed to fetch summary data');
        if (!compareRes.ok) throw new Error('Failed to fetch comparison data');

        const summaryData = await summaryRes.json();
        const compareData = await compareRes.json();

        setSummary(summaryData.statistics);
        setComparison(compareData.comparison);
      } catch (err: any) {
        setError(err.message || 'An error occurred during fetch');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [metric, groupBy]);

  const maxCompareMean = useMemo(() => {
    if (!comparison) return 0;
    return Math.max(...Object.values(comparison).map(c => c.mean));
  }, [comparison]);

  const getSegmentColor = (segmentName: string) => {
    const name = segmentName.toLowerCase();
    if (name.includes('premium')) return 'bg-emerald-500 shadow-emerald-500/20';
    if (name.includes('emerging')) return 'bg-indigo-500 shadow-indigo-500/20';
    if (name.includes('everyday')) return 'bg-slate-500 shadow-slate-500/20';
    if (name.includes('dormant')) return 'bg-amber-500 shadow-amber-500/20';
    return 'bg-rose-500 shadow-rose-500/20';
  };

  const renderStatCard = (label: string, value: number | undefined) => (
    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{label}</span>
      <span className="text-slate-100 font-mono text-lg">{value !== undefined ? formatNumber(value, label !== 'Count' && label !== 'Outliers' && isMonetary) : '-'}</span>
    </div>
  );

  return (
    <div className="bg-[#0b0f19] min-h-screen text-slate-200 p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-1">Exploratory Data Analysis</h2>
          <p className="text-slate-400 text-sm">Analyze and compare metrics across segments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metric</label>
            <select 
              value={metric} 
              onChange={(e) => setMetric(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            >
              {METRICS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group By</label>
            <select 
              value={groupBy} 
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            >
              {GROUP_BYS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse text-sm">Analyzing data...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : (
        <div className="space-y-8">
          {summary && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Summary Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {renderStatCard('Count', summary.count)}
                {renderStatCard('Mean', summary.mean)}
                {renderStatCard('Median', summary['50%'])}
                {renderStatCard('Std Dev', summary.std)}
                {renderStatCard('Min', summary.min)}
                {renderStatCard('Max', summary.max)}
                {renderStatCard('IQR', summary.iqr)}
                {renderStatCard('Skewness', summary.skewness)}
                {renderStatCard('Kurtosis', summary.kurtosis)}
                {renderStatCard('Outliers', summary.outlier_count)}
              </div>
            </div>
          )}

          {comparison && Object.keys(comparison).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Comparison by {groupBy.replace('_', ' ')}</h3>
              <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
                <div className="space-y-6">
                  {Object.entries(comparison).map(([groupName, stats]) => {
                    const widthPercent = maxCompareMean > 0 ? (stats.mean / maxCompareMean) * 100 : 0;
                    return (
                      <div key={groupName} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-semibold text-slate-200">{groupName}</span>
                          <span className="text-xs font-mono text-slate-400">
                            Mean: <span className="text-slate-200">{formatNumber(stats.mean, isMonetary)}</span>
                          </span>
                        </div>
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${getSegmentColor(groupName)}`}
                            style={{ width: `${Math.max(widthPercent, 1)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Min: {formatNumber(stats.min, isMonetary)}</span>
                          <span>Count: {stats.count}</span>
                          <span>Max: {formatNumber(stats.max, isMonetary)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
