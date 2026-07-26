'use client';

import React from 'react';
import { CustomerRecord } from '../types';

interface CustomerDetailDrawerProps {
  customer: CustomerRecord | null;
  onClose: () => void;
}

export default function CustomerDetailDrawer({ customer, onClose }: CustomerDetailDrawerProps) {
  if (!customer) return null;

  const formatCurrency = (val: number) => `₹${val?.toLocaleString('en-IN') ?? 0}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl overflow-y-auto p-6 flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-bold text-rose-500">Explainability & Recommendation Drawer</span>
                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-rose-400 border border-rose-500/20">
                  {customer.customer_id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {customer.segment_label} Persona
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Persona & Cluster Confidence Header */}
          <div className="mt-4 rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Location & Demographics</span>
              <p className="text-sm font-semibold text-white mt-0.5">
                📍 {customer.city} {customer.state ? `, ${customer.state}` : ''} • Age {customer.age}
              </p>
            </div>
            {customer.cluster_confidence !== undefined && (
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">KMeans Confidence</span>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  {(customer.cluster_confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          {/* Financial Profile Overview Cards */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Yearly Income</span>
              <p className="text-sm font-bold text-white mt-1">{formatCurrency(customer.yearly_income)}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Net Worth</span>
              <p className="text-sm font-bold text-emerald-400 mt-1">{formatCurrency(customer.net_worth_estimate)}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Credit Score</span>
              <p className="text-sm font-bold text-rose-400 mt-1">{customer.credit_score}</p>
            </div>
          </div>

          {/* AI Product Recommendations */}
          {customer.recommendations && customer.recommendations.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
                <span>🎯</span>
                <span>AI Recommendation Engine Output</span>
              </h3>
              <div className="space-y-2">
                {customer.recommendations.map((rec, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 flex items-start space-x-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{rec.product}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{rec.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explainability Narrative */}
          {customer.explanation && (
            <div className="mt-5 rounded-xl bg-rose-950/20 border border-rose-900/40 p-4">
              <h3 className="text-xs uppercase tracking-wider font-bold text-rose-400 mb-1 flex items-center space-x-1.5">
                <span>🧠</span>
                <span>Explainability Agent Summary</span>
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">
                "{customer.explanation.summary}"
              </p>
            </div>
          )}

          {/* Feature Store Score Breakdown */}
          <div className="mt-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
              Feature Store Calculated Scores (0 - 100)
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Premium Potential', score: customer.premium_potential, color: 'bg-emerald-500' },
                { label: 'Financial Health', score: customer.financial_health, color: 'bg-blue-500' },
                { label: 'Investment Readiness', score: customer.investment_readiness, color: 'bg-purple-500' },
                { label: 'Digital Adoption', score: customer.digital_adoption_score, color: 'bg-indigo-500' },
                { label: 'Dormancy / Churn Score', score: customer.dormancy_score, color: 'bg-amber-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-200">{item.score?.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.score || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
