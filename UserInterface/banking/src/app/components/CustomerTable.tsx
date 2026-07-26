'use client';

import React, { useState } from 'react';
import { CustomerRecord, Plan } from '../types';

interface CustomerTableProps {
  customers: CustomerRecord[];
  onSelectCustomer: (customer: CustomerRecord) => void;
  query?: string;
  plan?: Plan | null;
}

export default function CustomerTable({
  customers,
  onSelectCustomer,
  query = '',
  plan,
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const isChurn = plan?.intent === 'churn_query' || query.toLowerCase().includes('leave') || query.toLowerCase().includes('churn');
  const isProspecting = plan?.intent === 'prospecting_query' || query.toLowerCase().includes('become premium') || query.toLowerCase().includes('prospect');

  const getTitle = () => {
    if (isChurn) return '⚠️ At-Risk Accounts & Churn Drivers';
    if (isProspecting) return '🎯 High-Potential Premium Upgrade Candidates';
    if (plan?.entities?.city) return `📍 Customer Profiles in ${plan.entities.city}`;
    if (plan?.entities?.segment) return `💼 ${plan.entities.segment} Segment Accounts`;
    return '👥 Filtered Customer Segment Results';
  };

  const getSubtitle = () => {
    if (isChurn) return 'Accounts flagged with elevated dormancy and risk indicators needing retention intervention';
    if (isProspecting) return 'Non-premium customers exhibiting high income, investment readiness, and premium potential';
    return 'Real-time multi-agent customer dataset results';
  };

  const filtered = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.customer_id.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term) ||
      c.segment_label.toLowerCase().includes(term)
    );
  });

  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getScoreColor = (val: number) => {
    if (val >= 75) return 'text-emerald-400 font-bold';
    if (val >= 50) return 'text-amber-400 font-bold';
    return 'text-rose-400 font-bold';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">{getTitle()}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{getSubtitle()}</p>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search within results..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-xl bg-slate-950 px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 border border-slate-800 focus:border-rose-500/50 focus:outline-none"
          />
          <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer ID</th>
              <th className="px-4 py-3 font-semibold">City</th>
              <th className="px-4 py-3 font-semibold">Segment</th>
              <th className="px-4 py-3 font-semibold text-right">Yearly Income</th>
              <th className="px-4 py-3 font-semibold text-right">Net Worth</th>
              <th className="px-4 py-3 font-semibold text-center">Credit Score</th>
              <th className="px-4 py-3 font-semibold text-center">{isChurn ? 'Churn Risk' : 'Premium Potential'}</th>
              <th className="px-4 py-3 font-semibold">Next Best Offer</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filtered.map(customer => {
              const mainScore = isChurn
                ? (customer.churn_risk ?? customer.dormancy_score ?? 50)
                : (customer.premium_potential ?? 50);

              const offer = customer.recommendations?.[0]?.product || 'Standard Service';

              return (
                <tr
                  key={customer.customer_id}
                  onClick={() => onSelectCustomer(customer)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-4 py-3.5 font-mono font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    #{customer.customer_id}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{customer.city}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-200 border border-slate-700">
                      {customer.segment_label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-white">{fmt(customer.yearly_income)}</td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-400">{fmt(customer.net_worth_estimate)}</td>
                  <td className="px-4 py-3.5 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded ${customer.credit_score >= 750 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {customer.credit_score}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono">
                    <span className={getScoreColor(mainScore)}>{mainScore}/100</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300 border border-indigo-500/20">
                      {offer}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectCustomer(customer);
                      }}
                      className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-slate-700 border border-slate-700"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
