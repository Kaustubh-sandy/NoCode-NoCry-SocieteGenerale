'use client';

import React, { useState } from 'react';
import { CustomerRecord, Plan } from '../types';

interface CustomerTableProps {
  customers: CustomerRecord[];
  onSelectCustomer: (customer: CustomerRecord) => void;
  query?: string;
  plan?: Plan | null;
}

export default function CustomerTable({ customers, onSelectCustomer, query, plan }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof CustomerRecord>('premium_potential');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    if (amount == null) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} k`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleSort = (field: keyof CustomerRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = segmentFilter === 'ALL' || c.segment_label === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSegmentBadge = (label: string) => {
    switch (label) {
      case 'Premium Investors':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span>👑</span> <span>Premium Investors</span>
          </span>
        );
      case 'Emerging Affluent':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            <span>🚀</span> <span>Emerging Affluent</span>
          </span>
        );
      case 'Dormant Recovery':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <span>⚠️</span> <span>Dormant Recovery</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-500/20">
            <span>🏦</span> <span>Everyday Banking</span>
          </span>
        );
    }
  };

  // ── Dynamic Title & Subtitle Generator ──
  const getDynamicHeader = () => {
    const intent = plan?.intent;
    const q = (query || '').toLowerCase();
    
    if (intent === 'churn_query' || q.includes('leave') || q.includes('churn') || q.includes('dormant')) {
      return {
        title: '⚠️ At-Risk Accounts & Churn Drivers',
        subtitle: 'Sorted by highest dormancy & churn risk score. Click "Why?" to inspect inactivity drivers.',
        scoreLabel: 'Churn Risk Score'
      };
    }
    if (intent === 'prospecting_query' || q.includes('become premium') || q.includes('prospect') || q.includes('recommend')) {
      return {
        title: '🎯 High-Potential Upsell & Prospecting Candidates',
        subtitle: 'Sorted by highest premium potential score among non-premium accounts.',
        scoreLabel: 'Premium Score'
      };
    }
    if (plan?.entities?.city) {
      return {
        title: `📍 Matching Customer Profiles in ${plan.entities.city}`,
        subtitle: `Filtered feature store customer records located in ${plan.entities.city}.`,
        scoreLabel: 'Premium Score'
      };
    }
    if (plan?.entities?.minimum_net_worth) {
      return {
        title: `💰 Accounts with Net Worth ≥ ₹${plan.entities.minimum_net_worth.toLocaleString('en-IN')}`,
        subtitle: 'High-wealth individual profiles matching financial threshold criteria.',
        scoreLabel: 'Premium Score'
      };
    }
    if (plan?.entities?.segment) {
      return {
        title: `👑 ${plan.entities.segment} Tier Customer Profiles`,
        subtitle: `Filtered records assigned to ${plan.entities.segment} cluster.`,
        scoreLabel: 'Premium Score'
      };
    }
    return {
      title: query ? `🔍 Results for "${query}"` : 'Customer Profiles & Segmentation',
      subtitle: 'Real-time KMeans segment assignments & feature store scores',
      scoreLabel: 'Premium Score'
    };
  };

  const headerInfo = getDynamicHeader();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-xl">
      
      {/* Dynamic Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>{headerInfo.title}</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
              {sortedCustomers.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{headerInfo.subtitle}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search ID or City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-44 rounded-lg bg-slate-950 px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-500 border border-slate-800 focus:border-rose-500 focus:outline-none"
            />
            <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Segment Filter Pills */}
          <div className="flex items-center space-x-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
            {['ALL', 'Premium Investors', 'Emerging Affluent', 'Everyday Banking', 'Dormant Recovery'].map((seg) => (
              <button
                key={seg}
                onClick={() => setSegmentFilter(seg)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                  segmentFilter === seg
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {seg === 'ALL' ? 'All' : seg.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Customer ID</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('city')}>
                City {sortField === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('yearly_income')}>
                Income {sortField === 'yearly_income' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('net_worth_estimate')}>
                Net Worth {sortField === 'net_worth_estimate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white text-center" onClick={() => handleSort('credit_score')}>
                Credit Score {sortField === 'credit_score' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3">Segment Persona</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white text-center" onClick={() => handleSort(plan?.intent === 'churn_query' ? 'dormancy_score' : 'premium_potential')}>
                {headerInfo.scoreLabel} {sortField === 'premium_potential' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                  No matching customer profiles found. Try clearing filters or running a new query.
                </td>
              </tr>
            ) : (
              sortedCustomers.map((c) => {
                const isChurnView = plan?.intent === 'churn_query' || c.dormancy_score >= 60;
                const displayScore = isChurnView ? (c.dormancy_score || c.churn_risk || 0) : (c.premium_potential || 0);

                return (
                  <tr key={c.customer_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-semibold text-rose-300">
                      {c.customer_id}
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      {c.city} <span className="text-[10px] text-slate-500">{c.age}y</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {formatCurrency(c.yearly_income)}
                    </td>
                    <td className="py-3 px-3 font-medium text-emerald-400">
                      {formatCurrency(c.net_worth_estimate)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                        c.credit_score >= 750 ? 'bg-emerald-500/10 text-emerald-400' :
                        c.credit_score >= 650 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {Math.round(c.credit_score)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {getSegmentBadge(c.segment_label)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isChurnView ? 'bg-rose-500' :
                              displayScore >= 70 ? 'bg-emerald-500' :
                              displayScore >= 50 ? 'bg-indigo-500' : 'bg-slate-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, displayScore))}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[11px] font-semibold ${isChurnView ? 'text-rose-400' : 'text-slate-200'}`}>
                          {displayScore?.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectCustomer(c)}
                        className="inline-flex items-center space-x-1 rounded bg-rose-600/20 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition shadow"
                      >
                        <span>Why?</span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
