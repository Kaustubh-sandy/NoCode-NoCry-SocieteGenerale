'use client';

import React from 'react';
import { Plan } from '../types';

interface SupervisorPlannerCardProps {
  plan: Plan | null;
  query: string;
}

export default function SupervisorPlannerCard({ plan, query }: SupervisorPlannerCardProps) {
  if (!plan) return null;

  const getIntentBadge = (intent: string) => {
    switch (intent) {
      case 'churn_query':
        return <span className="rounded-md bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">⚠️ Churn Risk & Retention Agent</span>;
      case 'prospecting_query':
      case 'recommendation':
        return <span className="rounded-md bg-purple-500/15 px-2.5 py-1 text-xs font-bold text-purple-400 border border-purple-500/30">🎯 Prospecting & Recommendation Agent</span>;
      case 'eda_analysis':
      case 'analysis':
        return <span className="rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">📊 EDA & Distribution Agent</span>;
      case 'portfolio_insights':
        return <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">💡 Portfolio Insights Agent</span>;
      case 'data_quality_query':
        return <span className="rounded-md bg-cyan-500/15 px-2.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">🛡️ Data Health & Profiling Agent</span>;
      case 'risk_governance':
        return <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">⚖️ Risk Governance & Compliance Agent</span>;
      case 'explain':
        return <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">🧠 SHAP Explainability Agent</span>;
      default:
        return <span className="rounded-md bg-slate-500/15 px-2.5 py-1 text-xs font-bold text-slate-300 border border-slate-500/30">🔍 Segment Search Agent</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 p-4 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Supervisor Decision Header */}
        <div className="flex items-start space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-rose-400 border border-slate-700/60 shadow">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Supervisor Agent Execution Plan</span>
              {getIntentBadge(plan.intent)}
            </div>
            <p className="mt-1 text-xs font-mono text-slate-300">
              Query: <span className="text-white italic">"{query}"</span>
            </p>
          </div>
        </div>

        {/* Right: Extracted Entities & Invoked Specialist Agents */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          
          {/* Extracted City Tag */}
          {plan.entities.city && (
            <div className="flex items-center space-x-1 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700">
              <span className="text-slate-400">City:</span>
              <span className="font-semibold text-white">{plan.entities.city}</span>
            </div>
          )}

          {/* Extracted Segment Tag */}
          {plan.entities.segment && (
            <div className="flex items-center space-x-1 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700">
              <span className="text-slate-400">Segment Filter:</span>
              <span className="font-semibold text-rose-400">{plan.entities.segment}</span>
            </div>
          )}

          {/* Minimum Net Worth Tag */}
          {plan.entities.minimum_net_worth && (
            <div className="flex items-center space-x-1 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 border border-slate-700">
              <span className="text-slate-400">Net Worth:</span>
              <span className="font-semibold text-emerald-400">≥ ₹{plan.entities.minimum_net_worth.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Invoked Specialist Agents */}
          <div className="flex items-center space-x-1 rounded-lg bg-slate-950 px-2.5 py-1 text-xs text-slate-400 border border-slate-800">
            <span className="font-mono text-[11px]">Invoked Agents:</span>
            <div className="flex flex-wrap gap-1">
              {plan.tools.map((tool, idx) => (
                <span key={idx} className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-200 border border-slate-700/50">
                  {tool}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
