'use client';

import React, { useState } from 'react';
import { TrainResponse } from '../types';

interface RetrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrainSuccess: () => void;
}

export default function RetrainModal({ isOpen, onClose, onRetrainSuccess }: RetrainModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunTraining = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Training failed with status ${res.status}`);
      const data: TrainResponse = await res.json();
      setResult(data);
      onRetrainSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              ⚡
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Retrain Offline Model Pipeline</h3>
              <p className="text-xs text-slate-400">Trigger Flow 1: Data Profiling, Feature Store & KMeans</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Content Body */}
        {!result && !loading && (
          <p className="text-xs text-slate-300 leading-relaxed">
            Clicking <strong className="text-white">Run Retraining</strong> will execute the offline training pipeline (`python model_train.py`) via the backend API. It will profile the raw dataset, update feature store files, and refit the K-Means clustering model.
          </p>
        )}

        {loading && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
            <p className="text-xs font-mono text-slate-300 animate-pulse">
              Running Data Profiling → Feature Store → KMeans Clustering...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300 font-mono">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span>✅</span> <span>Model Retrained Successfully!</span>
            </div>
            <div className="text-slate-300 space-y-1 pt-1">
              <div>Source File: <span className="text-white">{result.source}</span></div>
              <div>Raw Records: <span className="text-white">{result.raw_rows}</span></div>
              <div>Unique Customers: <span className="text-white">{result.customers}</span></div>
              <div>Clusters Fitted: <span className="text-white">{result.clusters}</span></div>
              <div>Trained At: <span className="text-slate-400">{new Date(result.trained_at).toLocaleString()}</span></div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
          {!result && (
            <button
              onClick={handleRunTraining}
              disabled={loading}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition shadow"
            >
              {loading ? 'Retraining...' : 'Run Retraining Now'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
