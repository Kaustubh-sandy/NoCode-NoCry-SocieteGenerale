'use client';

import React from 'react';

export default function ArchitectureView() {
  const agents = [
    { name: 'supervisor_agent', role: 'Query Intent Routing', desc: 'Analyzes natural language queries and selects optimal specialist agent tools.' },
    { name: 'feature_engineering_agent', role: '75-Column Feature Aggregation', desc: 'Extracts spending ratios, channel usage, and financial health scores.' },
    { name: 'segmentation_agent', role: 'K-Means Persona Clustering', desc: 'Clusters customers into 4 core banking personas based on distance vectors.' },
    { name: 'persona_agent', role: 'Behavioral Profiling', desc: 'Maps numerical cluster centroids to human banking persona definitions.' },
    { name: 'explainability_agent', role: 'SHAP Reason Code Engine', desc: 'Calculates mathematical feature impact scores explaining risk drivers.' },
    { name: 'recommendation_agent', role: 'Next-Best Offer Engine', desc: 'Matches customer profile with tailored product recommendations.' },
    { name: 'eda_agent', role: 'Exploratory Statistics', desc: 'Calculates mean, median, IQR, skewness, kurtosis, and outlier counts.' },
    { name: 'visualization_agent', role: 'Visual Charting Spec', desc: 'Formats cross-segment comparison specs for UI charts.' },
    { name: 'insights_agent', role: 'Portfolio Anomaly Scanner', desc: 'Detects cross-sell gaps and high dormancy clusters across portfolio.' },
    { name: 'data_agent', role: 'Data Profiling Inspector', desc: 'Monitors raw dataset health score, missing values, and memory footprint.' },
    { name: 'preprocessing_agent', role: 'Sanity Auditor', desc: 'Audits schema validity and duplicate transaction records.' },
    { name: 'human_loop_agent', role: 'Risk Governance Auditor', desc: 'Evaluates action volume against bank risk governance thresholds.' },
    { name: 'report_agent', role: 'Executive Briefing Generator', desc: 'Synthesizes prioritized portfolio health highlights.' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl space-y-6 animate-fade-in">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          🧠 Bank360 Multi-Agent System Architecture
          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            13 Specialist Agents
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete topology of autonomous specialist agents orchestrating natural language intelligence across 20,000 banking customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-rose-400">{agent.name}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">Agent #{i + 1}</span>
            </div>
            <h3 className="font-bold text-white text-sm">{agent.role}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{agent.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
