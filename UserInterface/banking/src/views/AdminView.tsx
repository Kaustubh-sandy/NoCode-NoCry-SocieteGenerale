"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import { checkHealth, getStatus, getDataQuality, triggerTrain } from "@/lib/api";
import type { StatusResponse, DataQualityResponse } from "@/types/api";

type AsyncState = "idle" | "loading" | "ok" | "error";

export default function AdminView() {
  const [trainState,   setTrainState]   = useState<AsyncState>("idle");
  const [trainMsg,     setTrainMsg]     = useState<string | null>(null);
  const [trainMeta,    setTrainMeta]    = useState<{ customers?: number; clusters?: number } | null>(null);

  const [healthState,  setHealthState]  = useState<AsyncState>("idle");
  const [healthMsg,    setHealthMsg]    = useState<string | null>(null);

  const [statusState,  setStatusState]  = useState<AsyncState>("idle");
  const [statusData,   setStatusData]   = useState<StatusResponse | null>(null);

  const [qualityState, setQualityState] = useState<AsyncState>("idle");
  const [qualityData,  setQualityData]  = useState<DataQualityResponse | null>(null);

  const handleTrain = async () => {
    setTrainState("loading");
    setTrainMsg(null);
    setTrainMeta(null);
    try {
      const res = await triggerTrain();
      setTrainState("ok");
      setTrainMsg(res.message ?? "Training completed successfully.");
      setTrainMeta({ customers: res.customers, clusters: res.clusters });
    } catch (e: unknown) {
      setTrainState("error");
      setTrainMsg(e instanceof Error ? e.message : "Training failed. Is the backend running?");
    }
  };

  const handleHealth = async () => {
    setHealthState("loading");
    setHealthMsg(null);
    try {
      const res = await checkHealth();
      setHealthState("ok");
      setHealthMsg(`${res.service ?? "Bank360 AI API"} — status: ${res.status}`);
    } catch {
      setHealthState("error");
      setHealthMsg("Backend unreachable. Make sure it is running on port 8000.");
    }
  };

  const handleStatus = async () => {
    setStatusState("loading");
    setStatusData(null);
    try {
      const res = await getStatus();
      setStatusState("ok");
      setStatusData(res);
    } catch (e: unknown) {
      setStatusState("error");
      setStatusData({ trained: false, message: e instanceof Error ? e.message : "Failed" } as StatusResponse);
    }
  };

  const handleQuality = async () => {
    setQualityState("loading");
    setQualityData(null);
    try {
      const res = await getDataQuality();
      setQualityState("ok");
      setQualityData(res);
    } catch (e: unknown) {
      setQualityState("error");
      setQualityData({ error: e instanceof Error ? e.message : "Failed" });
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Health */}
      <AdminCard
        title="Backend Health"
        desc={<>Ping <code className="bg-gray-100 px-1 rounded">http://127.0.0.1:8000/health</code> to verify the API is reachable.</>}
      >
        <button
          onClick={handleHealth}
          disabled={healthState === "loading"}
          className="btn-secondary flex items-center gap-2"
        >
          {healthState === "loading" && <Spinner size={14} />}
          {healthState === "loading" ? "Checking…" : "Check Health"}
        </button>
        {healthMsg && (
          <StatusPill ok={healthState === "ok"} message={healthMsg} />
        )}
      </AdminCard>

      {/* Model Status */}
      <AdminCard
        title="Model Status"
        desc="Reads training metadata and evaluation metrics from the last run."
      >
        <button
          onClick={handleStatus}
          disabled={statusState === "loading"}
          className="btn-secondary flex items-center gap-2"
        >
          {statusState === "loading" && <Spinner size={14} />}
          {statusState === "loading" ? "Loading…" : "Get Status"}
        </button>

        {statusData && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <div className={`flex items-center gap-2 text-sm font-medium ${statusData.trained ? "text-emerald-700" : "text-red-600"}`}>
              {statusData.trained ? "✅ Model trained" : "❌ Not trained"}
              {statusData.message && !statusData.trained && (
                <span className="text-xs text-gray-400 font-normal">— {statusData.message}</span>
              )}
            </div>
            {statusData.trained && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Trained At",     val: statusData.trained_at?.replace("T", " ").slice(0, 19) ?? "—" },
                  { label: "Raw Rows",       val: statusData.raw_rows?.toLocaleString() ?? "—" },
                  { label: "Customers",      val: statusData.unique_customers?.toLocaleString() ?? "—" },
                  { label: "Clusters",       val: statusData.clusters ?? "—" },
                  { label: "Source",         val: statusData.source ?? "—" },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{val}</p>
                  </div>
                ))}
              </div>
            )}
            {statusData.evaluation_metrics &&
              Object.keys(statusData.evaluation_metrics).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Evaluation Metrics
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(statusData.evaluation_metrics).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 capitalize">{k.replace(/_/g, " ")}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                          {typeof v === "number" ? v.toFixed(4) : String(v)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </AdminCard>

      {/* Data Quality */}
      <AdminCard
        title="Data Quality Report"
        desc="Profiling report generated during the last training run."
      >
        <button
          onClick={handleQuality}
          disabled={qualityState === "loading"}
          className="btn-secondary flex items-center gap-2"
        >
          {qualityState === "loading" && <Spinner size={14} />}
          {qualityState === "loading" ? "Loading…" : "View Report"}
        </button>

        {qualityState === "error" && (
          <StatusPill ok={false} message={(qualityData as { error?: string })?.error ?? "Failed"} />
        )}

        {qualityState === "ok" && qualityData && (
          <div className="mt-3 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(qualityData)
                .filter(([, v]) => typeof v !== "object")
                .map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 capitalize">{k.replace(/_/g, " ")}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {typeof v === "number" ? (v as number).toLocaleString() : String(v)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </AdminCard>

      {/* Retrain */}
      <AdminCard
        title="Retrain Model"
        desc="Triggers the full offline pipeline: data profile → preprocessing → feature engineering → KMeans clustering → persistence. Takes 30–60 seconds."
      >
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span><strong>Demo use only.</strong> This overwrites saved model artifacts and the feature store.</span>
        </div>
        <button
          onClick={handleTrain}
          disabled={trainState === "loading"}
          className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {trainState === "loading" && <Spinner size={14} />}
          {trainState === "loading" ? "Training…" : "Start Training"}
        </button>

        {trainMsg && (
          <StatusPill ok={trainState === "ok"} message={trainMsg}>
            {trainMeta && (trainMeta.customers || trainMeta.clusters) && (
              <span className="text-xs opacity-70 mt-1 block">
                {trainMeta.customers != null && `${trainMeta.customers.toLocaleString()} customers`}
                {trainMeta.clusters  != null && ` · ${trainMeta.clusters} clusters`}
              </span>
            )}
          </StatusPill>
        )}
      </AdminCard>

      {/* Local setup */}
      <AdminCard title="Local Setup Guide" desc="">
        <div className="space-y-3">
          <Step n={1} title="Set up the backend" code={`cd AI\n.\\setup.ps1       # first run only\n.\\start.ps1       # activate venv\npython main.py train\npython main.py serve`} />
          <Step n={2} title="Start the frontend"  code={`cd UserInterface\\banking\nnpm install\nnpm run dev`} />
          <Step n={3} title="Open in browser"     code="http://localhost:3000" />
        </div>
      </AdminCard>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function AdminCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-1">{title}</h2>
      {desc && <p className="text-xs text-gray-400 mb-4">{desc}</p>}
      {children}
    </div>
  );
}

function StatusPill({
  ok,
  message,
  children,
}: {
  ok: boolean;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`mt-3 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${
        ok
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      <span>{ok ? "✅" : "❌"}</span>
      <div>
        {message}
        {children}
      </div>
    </div>
  );
}

function Step({ n, title, code }: { n: number; title: string; code: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E9041E] text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
        <pre className="bg-gray-900 text-gray-100 text-xs px-3 py-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    </div>
  );
}
