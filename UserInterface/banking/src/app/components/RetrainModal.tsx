'use client';

import React, { useState } from 'react';
import { TrainResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface RetrainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RetrainModal({ isOpen, onClose }: RetrainModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrainResponse | null>(null);
  const [clusters, setClusters] = useState(4);

  if (!isOpen) return null;

  const handleRetrain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusters }),
      });
      if (!res.ok) throw new Error(`Train failed: ${res.status}`);
      const data: TrainResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Retrain error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ⚡ Retrain Multi-Agent AI Models
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Re-runs feature engineering aggregations, StandardScaler normalizations, and K-Means clustering across 20,000 enriched records.
          </p>

          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <label className="font-semibold text-slate-400">Target Clusters (K):</label>
            <input
              type="number"
              min={2}
              max={8}
              value={clusters}
              onChange={e => setClusters(Number(e.target.value))}
              className="w-16 rounded bg-slate-900 px-2 py-1 font-mono font-bold text-rose-400 border border-slate-800"
            />
          </div>

          {result && (
            <div className="rounded-xl bg-emerald-950/40 p-3 border border-emerald-500/30 text-emerald-300 space-y-1 font-mono text-[11px]">
              <p className="font-bold text-emerald-400">✓ Retraining Complete!</p>
              <p>Customers Processed: {result.customers.toLocaleString()}</p>
              <p>Features Trained: {result.feature_columns.length}</p>
              <p>Clusters Fitted: {result.clusters}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">
            Close
          </button>
          <button
            onClick={handleRetrain}
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2 text-xs font-semibold text-white hover:from-rose-500 hover:to-rose-600 disabled:opacity-50"
          >
            {loading ? 'Retraining Models...' : 'Start Retraining'}
          </button>
        </div>
      </div>
    </div>
  );
}
