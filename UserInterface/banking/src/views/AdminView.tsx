"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import { checkHealth, triggerTrain } from "@/lib/api";

type TrainStatus = "idle" | "loading" | "success" | "error";
type HealthStatus = "idle" | "loading" | "ok" | "error";

export default function AdminView() {
  const [trainStatus, setTrainStatus] = useState<TrainStatus>("idle");
  const [trainMessage, setTrainMessage] = useState<string | null>(null);

  const [healthStatus, setHealthStatus] = useState<HealthStatus>("idle");
  const [healthMessage, setHealthMessage] = useState<string | null>(null);

  const handleTrain = async () => {
    setTrainStatus("loading");
    setTrainMessage(null);
    try {
      const res = await triggerTrain();
      setTrainStatus("success");
      setTrainMessage(res.message ?? "Training completed successfully.");
    } catch (e: unknown) {
      setTrainStatus("error");
      setTrainMessage(
        e instanceof Error ? e.message : "Training failed. Is the backend running?"
      );
    }
  };

  const handleHealthCheck = async () => {
    setHealthStatus("loading");
    setHealthMessage(null);
    try {
      const res = await checkHealth();
      setHealthStatus("ok");
      setHealthMessage(`Backend status: ${res.status}`);
    } catch {
      setHealthStatus("error");
      setHealthMessage("Backend unreachable. Make sure it is running on port 8000.");
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          Backend Health
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Ping the FastAPI backend to verify it is running on{" "}
          <code className="bg-gray-100 px-1 rounded">
            http://127.0.0.1:8000
          </code>
          .
        </p>
        <button
          onClick={handleHealthCheck}
          disabled={healthStatus === "loading"}
          className="px-5 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {healthStatus === "loading" && <Spinner size={14} />}
          {healthStatus === "loading" ? "Checking…" : "Check Health"}
        </button>

        {healthMessage && (
          <div
            className={`mt-3 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
              healthStatus === "ok"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {healthStatus === "ok" ? "✅" : "❌"}
            {healthMessage}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">
          Retrain Model
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Triggers the full offline pipeline: data profile → preprocessing →
          feature engineering → KMeans clustering → persistence. This may take
          30–60 seconds.
        </p>

        <div
          className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <span>
            <strong>Demo use only.</strong> Running this will overwrite the
            saved model artifacts and feature store.
          </span>
        </div>

        <button
          onClick={handleTrain}
          disabled={trainStatus === "loading"}
          className="px-5 py-2 bg-[#E9041E] text-white text-sm font-semibold rounded-lg hover:bg-[#b80318] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {trainStatus === "loading" && <Spinner size={14} />}
          {trainStatus === "loading" ? "Training…" : "Start Training"}
        </button>

        {trainMessage && (
          <div
            className={`mt-3 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${
              trainStatus === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {trainStatus === "success" ? "✅" : "❌"}
            {trainMessage}
          </div>
        )}
      </div>

      {/* Local run instructions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          Local Setup
        </h2>
        <div className="space-y-3">
          <Step
            n={1}
            title="Set up the backend"
            code={`cd AI\n.\\setup.ps1       # first run only\n.\\start.ps1       # activate venv\npython main.py train\npython main.py serve`}
          />
          <Step
            n={2}
            title="Start the frontend"
            code={`cd UserInterface\\banking\nnpm install\nnpm run dev`}
          />
          <Step
            n={3}
            title="Open in browser"
            code="http://localhost:3000"
          />
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  code,
}: {
  n: number;
  title: string;
  code: string;
}) {
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
