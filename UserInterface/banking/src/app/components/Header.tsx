'use client';

import React, { useState, useEffect } from 'react';
import { TabId, ModelStatusResponse } from '../types';
import { DataQualityBadge } from './InsightsPanel';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface HeaderProps {
  apiStatus: 'online' | 'offline' | 'checking';
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenRetrain: () => void;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '◎' },
  { id: 'customers', label: 'AI Query', icon: '⚡' },
  { id: 'browse', label: 'Browse All', icon: '☰' },
  { id: 'analytics', label: 'Analytics', icon: '▤' },
  { id: 'architecture', label: 'Architecture', icon: '◈' },
];

export default function Header({ apiStatus, activeTab, setActiveTab, onOpenRetrain }: HeaderProps) {
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);

  useEffect(() => {
    if (apiStatus === 'online') {
      fetch(`${API_BASE_URL}/status`)
        .then(r => r.json())
        .then(data => setModelStatus(data))
        .catch(() => {});
    }
  }, [apiStatus]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 glass">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3">

        {/* ── Brand ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white shadow-lg glow-rose">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wide text-white">
                BANK<span className="text-rose-500">360</span>
              </span>
              <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                Retail Solution
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Multi-Agent AI Customer Intelligence
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-900/60 p-1 border border-slate-800/60">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Status & Actions ── */}
        <div className="flex items-center gap-3">

          {/* Model Status */}
          {modelStatus?.trained && (
            <div className="hidden xl:flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-1.5 text-[11px] border border-slate-800/60">
              <span className="text-slate-500">Model:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {modelStatus.clusters} clusters
              </span>
              {modelStatus.evaluation_metrics && (
                <span className="text-slate-500">
                  · silhouette {modelStatus.evaluation_metrics.silhouette_score.toFixed(3)}
                </span>
              )}
            </div>
          )}

          {/* Data Quality Badge */}
          {apiStatus === 'online' && <DataQualityBadge />}

          {/* API Status */}
          <div className="flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1.5 text-[11px] border border-slate-800/60">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                apiStatus === 'online' ? 'bg-emerald-400 animate-ping' :
                apiStatus === 'offline' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
              }`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                apiStatus === 'online' ? 'bg-emerald-500' :
                apiStatus === 'offline' ? 'bg-rose-600' : 'bg-amber-500'
              }`} />
            </span>
            <span className="font-mono text-slate-300">
              {apiStatus === 'online' ? 'Live' : apiStatus === 'offline' ? 'Offline' : '...'}
            </span>
          </div>

          {/* Retrain Button */}
          <button
            onClick={onOpenRetrain}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60 transition-all duration-200"
            title="Trigger offline model retraining"
          >
            <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Retrain</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ── */}
      <div className="flex lg:hidden justify-around border-t border-slate-800/40 bg-slate-950/90 px-2 py-1.5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors ${
              activeTab === tab.id ? 'text-rose-400' : 'text-slate-500'
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
