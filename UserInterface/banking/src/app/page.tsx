'use client';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SupervisorPlannerCard from './components/SupervisorPlannerCard';
import CustomerTable from './components/CustomerTable';
import CustomerDetailDrawer from './components/CustomerDetailDrawer';
import ArchitectureView from './components/ArchitectureView';
import RetrainModal from './components/RetrainModal';
import SegmentOverview from './components/SegmentOverview';
import { InsightsPanel } from './components/InsightsPanel';
import EDAExplorer from './components/EDAExplorer';
import CustomerBrowser from './components/CustomerBrowser';
import AgentAuditTrail from './components/AgentAuditTrail';
import { QueryResponse, CustomerRecord, TabId } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

const PRESET_QUERIES = [
  { label: '⚠️ Churn & Attrition', query: 'Which customers are about to leave and why' },
  { label: '🎯 Premium Prospects', query: 'Which customers can become premium?' },
  { label: '★ Premium Bangalore', query: 'Find premium customers in Bangalore' },
  { label: '📊 Income EDA Stats', query: 'Show income distribution statistics' },
  { label: '💡 Portfolio Insights', query: 'Show portfolio cross sell opportunities' },
  { label: '🛡️ Data Health Audit', query: 'Run data health quality check' },
  { label: '⚖️ Governance Policy', query: 'Check risk governance approval policy for net worth 50 lakh' },
];
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SupervisorPlannerCard from './components/SupervisorPlannerCard';
import CustomerTable from './components/CustomerTable';
import CustomerDetailDrawer from './components/CustomerDetailDrawer';
import ArchitectureView from './components/ArchitectureView';
import RetrainModal from './components/RetrainModal';
import SegmentOverview from './components/SegmentOverview';
import { InsightsPanel } from './components/InsightsPanel';
import EDAExplorer from './components/EDAExplorer';
import CustomerBrowser from './components/CustomerBrowser';
import AgentAuditTrail from './components/AgentAuditTrail';
import { QueryResponse, CustomerRecord, TabId } from './types';

const API_BASE_URL = 'http://127.0.0.1:8000';

const PRESET_QUERIES = [
  { label: '⚠️ Churn & Attrition', query: 'Which customers are about to leave and why' },
  { label: '🎯 Premium Prospects', query: 'Which customers can become premium?' },
  { label: '★ Premium Bangalore', query: 'Find premium customers in Bangalore' },
  { label: '📊 Income EDA Stats', query: 'Show income distribution statistics' },
  { label: '💡 Portfolio Insights', query: 'Show portfolio cross sell opportunities' },
  { label: '🛡️ Data Health Audit', query: 'Run data health quality check' },
  { label: '⚖️ Governance Policy', query: 'Check risk governance approval policy for net worth 50 lakh' },
];

export default function Home() {
  const [queryInput, setQueryInput] = useState('Find premium customers in Bangalore');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [loading, setLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState<QueryResponse | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isRetrainOpen, setIsRetrainOpen] = useState(false);

  /* ── Health Check ── */
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) { setApiStatus('online'); return true; }
      setApiStatus('offline'); return false;
    } catch { setApiStatus('offline'); return false; }
  }, []);

  /* ── Execute AI Query ── */
  const executeQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, limit: 50 }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data: QueryResponse = await res.json();
      setQueryResponse(data);
      setApiStatus('online');

      if (data.plan?.intent === 'analysis') {
        setActiveTab('analytics');
      } else {
        setActiveTab('customers');
      }
    } catch (err) {
      console.error('Query error:', err);
      setApiStatus('offline');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Initial Load ── */
  useEffect(() => {
    checkHealth().then(ok => {
      if (ok) executeQuery('Find premium customers in Bangalore');
    });
  }, [checkHealth, executeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeQuery(queryInput);
  };

  const handlePresetClick = (q: string) => {
    setQueryInput(q);
    executeQuery(q);
  };

  /* ── KPI Calculations ── */
  const results = queryResponse?.results || [];
  const totalCount = queryResponse?.count || results.length;
  const avgIncome = results.length > 0 ? results.reduce((a, c) => a + (c.yearly_income || 0), 0) / results.length : 0;
  const avgNetWorth = results.length > 0 ? results.reduce((a, c) => a + (c.net_worth_estimate || 0), 0) / results.length : 0;
  const avgCreditScore = results.length > 0 ? results.reduce((a, c) => a + (c.credit_score || 0), 0) / results.length : 0;
  const highPotentialCount = results.filter(c => (c.premium_potential || 0) >= 70).length;

  const fmt = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">

      <Header
        apiStatus={apiStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRetrain={() => setIsRetrainOpen(true)}
      />

      {/* Offline Banner */}
      {apiStatus === 'offline' && (
        <div className="bg-rose-500/8 border-b border-rose-500/15 px-4 py-3 text-center text-xs text-rose-300/90 animate-fade-in">
          <strong className="text-white">Backend Offline</strong>
          {' · '}Run <code className="bg-slate-900 px-2 py-0.5 rounded font-mono text-rose-400 text-[11px]">python start_be.py</code> in your AI folder
        </div>
      )}

      <main className="mx-auto w-full max-w-[1440px] px-5 py-6 space-y-6">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: OVERVIEW — Segment Dashboard + Insights           */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Segment Distribution Dashboard */}
            <SegmentOverview />

            {/* AI Insights Panel */}
            <InsightsPanel />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: AI QUERY — Search + Results + Table               */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in">

            {/* Search Bar */}
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-4">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  Ask Bank360 AI
                  <span className="badge bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px]">
                    Multi-Agent & Gemini LLM
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Natural language queries for customer segments, prospecting, EDA distributions, and product recommendations.
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="relative flex-1">
                  <input
                    id="ai-query-input"
                    type="text"
                    value={queryInput}
                    onChange={e => setQueryInput(e.target.value)}
                    placeholder="e.g. Find premium customers in Mumbai or Which customers are about to leave and why"
                    className="w-full rounded-xl bg-slate-950/80 px-4 py-3.5 pl-11 pr-28 text-sm text-white placeholder-slate-600 border border-slate-800/60 shadow-inner focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all"
                  />
                  <svg className="absolute left-3.5 top-4 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  id="run-query-btn"
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2 text-xs font-semibold text-white shadow-md hover:from-rose-500 hover:to-rose-600 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Routing...
                    </span>
                  ) : 'Run Query'}
                </button>
              </form>

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Presets:</span>
                {PRESET_QUERIES.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetClick(p.query)}
                    className="rounded-lg bg-slate-800/50 px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-slate-700/40 transition-all duration-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Supervisor Plan */}
            <SupervisorPlannerCard plan={queryResponse?.plan || null} query={queryInput} />

            {/* Multi-Agent Process Execution Audit Trail */}
            <AgentAuditTrail
              auditTrail={queryResponse?.audit_trail}
              plan={queryResponse?.plan}
              query={queryInput}
              rawOutput={queryResponse?.raw_output}
            />

            {/* KPI Cards */}
            {queryResponse?.results && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: 'Matching Customers', value: totalCount.toString(), color: 'text-white' },
                  { label: 'Avg Yearly Income', value: fmt(avgIncome), color: 'text-rose-400' },
                  { label: 'Avg Net Worth', value: fmt(avgNetWorth), color: 'text-emerald-400' },
                  { label: 'Avg Credit Score', value: Math.round(avgCreditScore).toString(), color: 'text-indigo-400' },
                  { label: 'High Potential (70+)', value: highPotentialCount.toString(), color: 'text-amber-400' },
                ].map((kpi, i) => (
                  <div key={i} className="metric-card">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{kpi.label}</span>
                    <p className={`text-xl font-bold font-mono mt-1.5 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Table */}
            <CustomerTable
              customers={results}
              onSelectCustomer={c => setSelectedCustomer(c)}
              query={queryInput}
              plan={queryResponse?.plan}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: BROWSE ALL — Paginated Customer Browser           */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'browse' && (
          <div className="animate-fade-in">
            <CustomerBrowser onSelectCustomer={c => setSelectedCustomer(c)} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: ANALYTICS — EDA Explorer                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <EDAExplorer analysis={queryResponse?.result || null} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TAB: ARCHITECTURE                                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'architecture' && (
          <div className="animate-fade-in">
            <ArchitectureView />
          </div>
        )}

      </main>

      {/* Drawer & Modal */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
      <RetrainModal
        isOpen={isRetrainOpen}
        onClose={() => setIsRetrainOpen(false)}
        onRetrainSuccess={() => { checkHealth(); executeQuery(queryInput); }}
      />
    </div>
  );
}
