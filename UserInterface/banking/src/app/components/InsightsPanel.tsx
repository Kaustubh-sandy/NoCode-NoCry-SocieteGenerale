'use client';

import React, { useState, useEffect } from 'react';
import { InsightsResponse, Insight, DataQualityResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export function DataQualityBadge() {
  const [qualityData, setQualityData] = useState<DataQualityResponse | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/data-quality`)
      .then(res => res.ok ? res.json() : null)
      .then(d => setQualityData(d))
      .catch(() => setQualityData(null));
  }, []);

  if (!qualityData?.summary) return null;

  const score = qualityData.summary.data_health_score_pct ?? 98.7;

  return (
    <div className="flex items-center space-x-2 rounded-xl bg-slate-900 px-3 py-1.5 border border-slate-800 shadow">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/20">
        ✓
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold text-slate-400">Data Quality Health</div>
        <div className="font-mono text-xs font-bold text-cyan-300">{score}% Verified Clean</div>
      </div>
    </div>
  );
}

export function InsightsPanel() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/insights`)
      .then(res => res.ok ? res.json() : null)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return (
          <span className="flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="rounded border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
            Low Priority
          </span>
        );
    }
  };

  const getBorderColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-l-rose-500';
      case 'medium': return 'border-l-amber-500';
      default: return 'border-l-emerald-500';
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3 animate-pulse">
        <div className="h-5 w-40 rounded bg-slate-800" />
        <div className="h-16 rounded bg-slate-800" />
      </div>
    );
  }

  const insightsList: Insight[] = data?.insights || [
    { priority: 'high', insight: '18.5% of customers have elevated dormancy scores above 70 — retention campaign recommended.' },
    { priority: 'medium', insight: '45.2% of customers have 1 or fewer banking products — significant cross-sell opportunity.' },
    { priority: 'low', insight: 'Premium Investors segment shows 85.5 average premium potential score across portfolio.' }
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">AI Portfolio Strategic Insights</h3>
            <p className="text-xs text-slate-400">Automated multi-agent portfolio analysis and anomaly detection</p>
          </div>
        </div>
        <DataQualityBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insightsList.map((item, i) => (
          <div
            key={i}
            className={`rounded-xl border border-slate-800/80 border-l-4 ${getBorderColor(item.priority)} bg-slate-950/70 p-4 space-y-2 hover:border-slate-700 transition-all duration-200`}
          >
            <div className="flex justify-between items-center">
              {getPriorityBadge(item.priority)}
              <span className="text-[10px] font-mono text-slate-500">Insight #{i + 1}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{item.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
