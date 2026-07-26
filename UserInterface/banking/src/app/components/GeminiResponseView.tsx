'use client';

import React, { useState } from 'react';
import { GeminiOutput, RawOutput } from '../types';

interface GeminiResponseViewProps {
  geminiOutput: GeminiOutput | null | undefined;
  rawOutput: RawOutput | null | undefined;
  query: string;
}

export default function GeminiResponseView({ geminiOutput, rawOutput, query }: GeminiResponseViewProps) {
  const [viewMode, setViewMode] = useState<'gemini' | 'raw' | 'split'>('split');
  const [showRawJson, setShowRawJson] = useState(false);

  if (!geminiOutput && !rawOutput) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl p-6 space-y-6 animate-fade-in">
      
      {/* ── Header & View Mode Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow">
              ✨
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              AI Query Processing Hub
            </h2>
            <span className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px]">
              Dual Output Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Displaying natural language synthesis alongside raw multi-agent execution payload for query: <span className="text-rose-400 italic">"{query}"</span>
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('split')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              viewMode === 'split' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('gemini')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              viewMode === 'gemini' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ Gemini AI
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              viewMode === 'raw' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ Raw Output
          </button>
        </div>
      </div>

      {/* ── Status Banner for Gemini API Key ── */}
      {geminiOutput?.api_key_status && (
        <div className={`rounded-xl p-3 text-xs flex items-center justify-between border ${
          geminiOutput.status === 'live_gemini_api'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>{geminiOutput.status === 'live_gemini_api' ? '⚡' : '🔑'}</span>
            <span className="font-mono">{geminiOutput.api_key_status}</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono">
            {geminiOutput.status === 'live_gemini_api' ? 'Live Gemini LLM' : 'Placeholder Configured in AI/config.py'}
          </span>
        </div>
      )}

      {/* ── Display Panels ── */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* PANEL 1: GEMINI AI PROCESSED SYNTHESIS */}
        {(viewMode === 'split' || viewMode === 'gemini') && geminiOutput && (
          <div className="rounded-xl bg-slate-950/80 p-5 border border-slate-800 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold text-sm">✨ OUTPUT 1: Gemini AI Synthesized Report</span>
              </div>
              <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">
                NLP Natural Language
              </span>
            </div>

            {/* Executive Summary */}
            <div className="rounded-lg bg-slate-900/90 p-4 border border-slate-800/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">Executive Summary</span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {geminiOutput.executive_summary}
              </p>
            </div>

            {/* Key Insights */}
            {geminiOutput.key_insights && geminiOutput.key_insights.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Key Takeaways</span>
                <div className="space-y-1.5">
                  {geminiOutput.key_insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 rounded-lg bg-slate-900/50 p-2.5 border border-slate-800/40">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {geminiOutput.recommended_actions && geminiOutput.recommended_actions.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">Strategic Action Items</span>
                <div className="space-y-1.5">
                  {geminiOutput.recommended_actions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 rounded-lg bg-slate-900/50 p-2.5 border border-slate-800/40">
                      <span className="text-amber-400 font-bold font-mono">{idx + 1}.</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: RAW MULTI-AGENT EXECUTION OUTPUT */}
        {(viewMode === 'split' || viewMode === 'raw') && rawOutput && (
          <div className="rounded-xl bg-slate-950/80 p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-bold text-sm">⚙️ OUTPUT 2: Raw Multi-Agent Execution Data</span>
              </div>
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-[11px] font-mono text-rose-400 hover:text-rose-300 underline"
              >
                {showRawJson ? 'Hide Raw JSON' : 'View Raw JSON'}
              </button>
            </div>

            {/* Structured Raw Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Query Intent</span>
                <p className="text-xs font-mono font-bold text-rose-400 mt-0.5">{rawOutput.intent}</p>
              </div>
              <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Matching Records</span>
                <p className="text-xs font-mono font-bold text-white mt-0.5">{rawOutput.matching_records_count || 0}</p>
              </div>
            </div>

            {/* Invoked Tools */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Invoked Agents & Tools</span>
              <div className="flex flex-wrap gap-1.5">
                {rawOutput.tools_invoked?.map((t, idx) => (
                  <span key={idx} className="rounded bg-slate-900 px-2 py-1 text-[11px] font-mono text-slate-300 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Returned Records Sample */}
            {rawOutput.returned_records_sample && rawOutput.returned_records_sample.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Raw Records Payload (Top 3)</span>
                <div className="space-y-2">
                  {rawOutput.returned_records_sample.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/60 text-[11px] font-mono space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span className="text-rose-300 font-bold">#{rec.customer_id}</span>
                        <span>{rec.city} · {rec.segment_label}</span>
                      </div>
                      {rec.explanation && (
                        <div className="text-slate-300 italic text-[10px]">
                          "{rec.explanation}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggleable Full Raw JSON View */}
            {showRawJson && (
              <div className="mt-3 rounded-lg bg-slate-900 p-3 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto">
                <pre>{JSON.stringify(rawOutput, null, 2)}</pre>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
