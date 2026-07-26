'use client';

import React, { useState, useEffect } from 'react';

// --- SVG Icons ---
const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ActivityIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const AlertCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Interfaces ---

interface Insight {
  priority: 'high' | 'medium' | 'low';
  insight: string;
}

interface InsightsResponse {
  insights: Insight[];
}

interface DataQualityResponse {
  summary: {
    data_health_score_pct: number;
    total_transaction_records: number;
  };
}

// --- Data Quality Badge Component ---

export const DataQualityBadge = () => {
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuality = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/data-quality');
        if (!response.ok) throw new Error('Failed to fetch data quality');
        const data: DataQualityResponse = await response.json();
        setHealthScore(data.summary.data_health_score_pct);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchQuality();
  }, []);

  if (error) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold backdrop-blur-sm shadow-sm transition-all hover:bg-slate-800">
      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
      <span className="text-slate-300 tracking-wide uppercase">
        {loading ? (
          <span className="inline-block w-8 h-3 bg-slate-700 animate-pulse rounded align-middle" />
        ) : (
          `${healthScore?.toFixed(1)}%`
        )}
        <span className="ml-1 text-slate-500 font-medium">Data Health</span>
      </span>
    </div>
  );
};

// --- Insights Panel Component ---

export const InsightsPanel = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/insights');
        if (!response.ok) throw new Error('Failed to fetch insights');
        const data: InsightsResponse = await response.json();
        setInsights(data.insights || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          cardBorder: 'border-l-rose-500',
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: <AlertTriangleIcon className="w-5 h-5 text-rose-500" />,
          dot: 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]'
        };
      case 'medium':
        return {
          cardBorder: 'border-l-amber-500',
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <InfoIcon className="w-5 h-5 text-amber-500" />,
          dot: 'bg-amber-500'
        };
      case 'low':
        return {
          cardBorder: 'border-l-emerald-500',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
          dot: 'bg-emerald-500'
        };
      default:
        return {
          cardBorder: 'border-l-slate-500',
          badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: <ActivityIcon className="w-5 h-5 text-slate-500" />,
          dot: 'bg-slate-500'
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 rounded-xl bg-[#0b0f19] p-6 border border-slate-800/60 shadow-xl relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <SparklesIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-wide uppercase flex items-center gap-2">
            AI Portfolio Insights
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 z-10">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            <AlertCircleIcon className="w-8 h-8 text-rose-500 mb-3 opacity-80" />
            <p className="text-slate-300 font-medium">Unable to load insights</p>
            <p className="text-slate-500 text-sm mt-1">Please try refreshing the page or check connection.</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-900/50 rounded-lg border border-slate-800 border-dashed">
            <ActivityIcon className="w-8 h-8 text-indigo-400 mb-3 opacity-80" />
            <p className="text-slate-300 font-medium">No insights available</p>
            <p className="text-slate-500 text-sm mt-1">AI model has not generated any new insights for this portfolio.</p>
          </div>
        ) : (
          insights.map((item, idx) => {
            const styles = getPriorityStyles(item.priority);
            return (
              <div 
                key={idx} 
                className={`group relative flex items-start gap-4 p-5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 border-l-4 ${styles.cardBorder} hover:bg-slate-800/80 transition-all duration-300 shadow-sm hover:shadow-md`}
              >
                <div className="mt-0.5 flex-shrink-0 p-2 rounded-full bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform duration-300">
                  {styles.icon}
                </div>
                
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles.badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {item.priority} Priority
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {item.insight}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
