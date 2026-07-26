'use client';

import React from 'react';

export default function ArchitectureView() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>🧠 Bank360 AI Architecture & Multi-Agent Flow</span>
          <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-400 font-mono border border-rose-500/20">
            Retail Solution
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Query-aware multi-agent architecture separating offline model training from online real-time natural language query routing.
        </p>
      </div>

      {/* Two Flows Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Flow 1 Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="rounded bg-rose-500/10 px-2.5 py-1 text-xs font-mono font-bold text-rose-400 border border-rose-500/20">
              FLOW 1
            </span>
            <span className="text-xs text-slate-500">Offline / Admin Pipeline</span>
          </div>
          <h3 className="text-lg font-bold text-white">Model Training Pipeline</h3>
          <p className="text-xs text-slate-400">
            Executed once when source data is updated. Collapses multi-transaction profiles into 1 customer feature vector and trains K-Means clustering.
          </p>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-rose-400">1. Data Agent</span>
              <span className="text-slate-500">→ Ingests & profiles dataset</span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-rose-400">2. Preprocessing</span>
              <span className="text-slate-500">→ Cleans nulls & dates</span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-rose-400">3. Feature Store</span>
              <span className="text-slate-500">→ Computes 23 customer metrics</span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-rose-400">4. Segmentation</span>
              <span className="text-slate-500">→ Trains 4 K-Means personas</span>
            </div>
          </div>
        </div>

        {/* Flow 2 Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/20">
              FLOW 2
            </span>
            <span className="text-xs text-slate-500">Online / Runtime Pipeline</span>
          </div>
          <h3 className="text-lg font-bold text-white">Usecase Serving & Query Router</h3>
          <p className="text-xs text-slate-400">
            Executed dynamically for each user query. Supervisor Agent interprets natural language and routes execution to specialist agents.
          </p>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-emerald-400">1. Supervisor Agent</span>
              <span className="text-slate-500">→ Extracts intent & entities</span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-emerald-400">2. Query Router</span>
              <span className="text-slate-500">→ Filters feature store rows</span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-emerald-400">3. Recommendation</span>
              <span className="text-slate-500">→ Generates product offers</span>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-950 p-2.5 border border-slate-800">
              <span className="text-emerald-400">4. Explainability</span>
              <span className="text-slate-500">→ Outputs decision reasons</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
