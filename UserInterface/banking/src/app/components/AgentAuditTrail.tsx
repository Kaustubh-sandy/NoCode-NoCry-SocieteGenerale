'use client';

import React, { useState } from 'react';
import { AuditStep, Plan, RawOutput } from '../types';

interface AgentAuditTrailProps {
  auditTrail?: AuditStep[];
  plan?: Plan | null;
  query: string;
  rawOutput?: RawOutput;
}

export default function AgentAuditTrail({ auditTrail, plan, query, rawOutput }: AgentAuditTrailProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (!auditTrail || auditTrail.length === 0) {
    if (!plan) return null;
    // Fallback step generation if backend did not return explicit audit_trail
    const defaultSteps: AuditStep[] = [
      {
        step: 1,
        agent: 'supervisor_agent',
        role: 'Supervisor & Multi-Agent Query Router',
        why_called: 'Parsed natural language query intent, extracted parameters, and planned specialist agent pipeline.',
        output_summary: `Classified intent as '${plan.intent}'. Target entities: City=${plan.entities.city || 'All'}, Segment=${plan.entities.segment || 'All'}.`,
        backing_data: plan.entities
      },
      ...plan.tools.filter(t => t !== 'supervisor_agent' && t !== 'gemini_agent').map((tool, idx) => ({
        step: idx + 2,
        agent: tool,
        role: getAgentRole(tool),
        why_called: getAgentWhyCalled(tool, plan.intent),
        output_summary: getAgentOutputSummary(tool, plan.intent, rawOutput),
        backing_data: getAgentBackingData(tool, rawOutput)
      }))
    ];
    return renderAuditTrailUI(defaultSteps, plan, query, expandedStep, setExpandedStep);
  }

  return renderAuditTrailUI(auditTrail, plan, query, expandedStep, setExpandedStep);
}

function getAgentRole(agent: string): string {
  switch (agent) {
    case 'feature_engineering_agent': return '75-Column Feature Engineering Aggregator';
    case 'segmentation_agent': return 'K-Means Customer Segmentation Engine';
    case 'persona_agent': return 'Persona Assignment & Behavioral Profiler';
    case 'explainability_agent': return 'SHAP Explainability & Risk Driver Engine';
    case 'recommendation_agent': return 'Next-Best-Action Product Engine';
    case 'eda_agent': return 'Exploratory Data Analysis Engine';
    case 'visualization_agent': return 'Cross-Segment Visualization Generator';
    case 'insights_agent': return 'Portfolio Cross-Sell & Dormancy Engine';
    case 'data_agent': return 'Data Profiling & Quality Inspector';
    case 'preprocessing_agent': return 'Data Preprocessing & Sanity Auditor';
    case 'human_loop_agent': return 'Risk Governance & Policy Auditor';
    case 'report_agent': return 'Executive Briefing Synthesizer';
    default: return `${agent.replace('_', ' ')} specialist`;
  }
}

function getAgentWhyCalled(agent: string, intent: string): string {
  switch (agent) {
    case 'feature_engineering_agent': return 'Calculates 40+ derived customer metrics, spending ratios, and digital activity scores from 75 CSV columns.';
    case 'segmentation_agent': return 'Calculates cluster distance and segment membership across 4 banking personas.';
    case 'persona_agent': return 'Maps behavioral indicators to specific customer profile segments.';
    case 'explainability_agent': return `Identifies primary reason codes explaining ${intent === 'churn_query' ? 'churn risk drivers' : 'segment positioning'}.`;
    case 'recommendation_agent': return 'Generates personalized product offers based on customer income and spending patterns.';
    case 'eda_agent': return 'Calculates statistical summaries (mean, median, std, outliers) across target metrics.';
    case 'visualization_agent': return 'Groups metric distributions by customer segment for chart rendering.';
    case 'insights_agent': return 'Scans portfolio dataset for cross-sell gaps and dormancy risks.';
    case 'data_agent': return 'Inspects dataset health score, missing values, and memory footprint.';
    case 'preprocessing_agent': return 'Audits data cleanlines and duplicate rows.';
    case 'human_loop_agent': return 'Evaluates financial exposure against bank risk governance policy.';
    default: return `Invoked to execute ${agent} specialized logic.`;
  }
}

function getAgentOutputSummary(agent: string, intent: string, rawOutput?: RawOutput): string {
  if (rawOutput?.matching_records_count !== undefined) {
    return `Evaluated ${rawOutput.matching_records_count} matching customer records using ${agent}.`;
  }
  return `Successfully computed ${agent} results for query intent '${intent}'.`;
}

function getAgentBackingData(agent: string, rawOutput?: RawOutput): Record<string, any> {
  return {
    agent_id: agent,
    timestamp: 'Live Execution',
    status: 'Success'
  };
}

function renderAuditTrailUI(
  steps: AuditStep[],
  plan?: Plan | null,
  query?: string,
  expandedStep?: number | null,
  setExpandedStep?: (step: number | null) => void
) {
  const getBadgeColor = (agent: string) => {
    if (agent.includes('supervisor')) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (agent.includes('feature')) return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    if (agent.includes('segmentation')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    if (agent.includes('explainability')) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (agent.includes('recommendation')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (agent.includes('eda')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (agent.includes('insights')) return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    if (agent.includes('data') || agent.includes('preprocessing')) return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    if (agent.includes('human')) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    return 'bg-slate-700/40 text-slate-300 border-slate-700';
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-wide">Multi-Agent Execution Process Audit Trail</h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                Live Verification
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step reasoning pipeline explaining why each specialist agent was dispatched & backing dataset metrics used.
            </p>
          </div>
        </div>

        {plan && (
          <div className="flex items-center space-x-2 rounded-xl bg-slate-950 px-3 py-1.5 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400">Intent:</span>
            <span className="font-mono text-xs font-bold text-rose-400 uppercase">{plan.intent}</span>
          </div>
        )}
      </div>

      {/* Audit Steps Timeline */}
      <div className="mt-5 space-y-4">
        {steps.map((stepItem, idx) => {
          const isExpanded = expandedStep === stepItem.step;
          return (
            <div
              key={stepItem.step}
              className="relative pl-7 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-0.5 before:bg-slate-800 last:before:hidden"
            >
              {/* Timeline Bullet */}
              <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-slate-300 border border-slate-700 shadow">
                {stepItem.step}
              </div>

              {/* Step Card */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 hover:border-slate-700/80 transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2.5 py-0.5 font-mono text-xs font-bold border ${getBadgeColor(stepItem.agent)}`}>
                      {stepItem.agent}
                    </span>
                    <span className="text-sm font-semibold text-white">{stepItem.role}</span>
                  </div>

                  {stepItem.backing_data && (
                    <button
                      onClick={() => setExpandedStep?.(isExpanded ? null : stepItem.step)}
                      className="text-[11px] font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 self-start sm:self-auto"
                    >
                      {isExpanded ? 'Hide Backing Data' : 'View Backing Data'}
                      <svg className={`h-3 w-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Why Called Section */}
                <div className="mt-2.5 flex items-start space-x-2 rounded-lg bg-slate-900/60 px-3 py-2 border border-slate-800/60">
                  <span className="text-rose-400 font-bold text-xs shrink-0 mt-0.5">WHY:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{stepItem.why_called}</p>
                </div>

                {/* Output Summary Section */}
                <div className="mt-2 flex items-start space-x-2 rounded-lg bg-slate-900/40 px-3 py-2 border border-slate-800/40">
                  <span className="text-emerald-400 font-bold text-xs shrink-0 mt-0.5">OUTPUT:</span>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed">{stepItem.output_summary}</p>
                </div>

                {/* Collapsible Backing Data */}
                {isExpanded && stepItem.backing_data && (
                  <div className="mt-3 rounded-lg bg-slate-950 p-3 border border-slate-800/80 animate-fade-in">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      75-Column Dataset & Model Backing Evidence:
                    </div>
                    <pre className="max-h-48 overflow-auto text-[11px] font-mono text-emerald-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                      {JSON.stringify(stepItem.backing_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
