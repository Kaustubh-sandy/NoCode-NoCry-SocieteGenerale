'use client';

import React from 'react';
import { CustomerRecord } from '../types';

interface CustomerDetailDrawerProps {
  customer: CustomerRecord | null;
  onClose: () => void;
}

export default function CustomerDetailDrawer({ customer, onClose }: CustomerDetailDrawerProps) {
  if (!customer) return null;

  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl border-l border-slate-800 bg-slate-900 text-slate-200 shadow-2xl p-6 overflow-y-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white font-mono">Customer #{customer.customer_id}</h2>
                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
                  {customer.segment_label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Location: {customer.city} · Age: {customer.age}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              ✕
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <span className="text-[11px] uppercase font-bold text-slate-500">Yearly Income</span>
              <p className="text-lg font-bold text-rose-400 font-mono mt-1">{fmt(customer.yearly_income)}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <span className="text-[11px] uppercase font-bold text-slate-500">Net Worth Estimate</span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{fmt(customer.net_worth_estimate)}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <span className="text-[11px] uppercase font-bold text-slate-500">Credit Score</span>
              <p className="text-lg font-bold text-indigo-400 font-mono mt-1">{customer.credit_score}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <span className="text-[11px] uppercase font-bold text-slate-500">Total Debt</span>
              <p className="text-lg font-bold text-amber-400 font-mono mt-1">{fmt(customer.total_debt)}</p>
            </div>
          </div>

          {/* AI Persona Scores */}
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🎯</span> AI Feature & Persona Scores
            </h3>
            
            {[
              { label: 'Activity Score', val: customer.activity_score, color: 'bg-blue-500' },
              { label: 'Digital Adoption Score', val: customer.digital_adoption_score, color: 'bg-indigo-500' },
              { label: 'Financial Health', val: customer.financial_health, color: 'bg-emerald-500' },
              { label: 'Investment Readiness', val: customer.investment_readiness, color: 'bg-teal-500' },
              { label: 'Premium Potential', val: customer.premium_potential, color: 'bg-purple-500' },
              { label: 'Dormancy / Churn Score', val: customer.dormancy_score, color: 'bg-rose-500' },
            ].map((score, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{score.label}</span>
                  <span className="font-mono text-white">{score.val}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${score.color}`} style={{ width: `${Math.min(score.val, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Product Recommendations */}
          {customer.recommendations && customer.recommendations.length > 0 && (
            <div className="rounded-xl bg-indigo-950/30 p-4 border border-indigo-500/20 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <span>🎁</span> Next-Best Product Offers
              </h3>
              {customer.recommendations.map((rec, i) => (
                <div key={i} className="rounded-lg bg-slate-900 p-3 border border-slate-800">
                  <span className="font-semibold text-white text-sm">{rec.product}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}

          {/* SHAP Explainability Reason Codes */}
          {customer.explanation && (
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>🧠</span> SHAP Explainability & Reason Codes
              </h3>
              <p className="text-xs text-slate-300 italic">{customer.explanation.summary}</p>
              {customer.explanation.reason_codes && customer.explanation.reason_codes.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {customer.explanation.reason_codes.map(([code, weight], idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs rounded bg-slate-900 px-2.5 py-1.5 border border-slate-800">
                      <span className="text-slate-300">{code}</span>
                      <span className="font-mono text-emerald-400 font-semibold">+{weight.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
