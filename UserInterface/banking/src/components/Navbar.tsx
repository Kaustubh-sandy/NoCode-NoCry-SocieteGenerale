"use client";

import { useState } from "react";

export default function Navbar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "customers", label: "Customers" },
    { id: "insights", label: "Insights" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <nav
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
      style={{ borderBottom: "2px solid #E9041E" }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* SG Logo mark */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded flex flex-col overflow-hidden shadow-sm"
              aria-hidden="true"
            >
              <div className="flex-1 bg-[#E9041E]" />
              <div className="h-[3px] bg-white" />
              <div className="flex-1 bg-black" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight tracking-tight">
                Société Générale
              </p>
              <p className="text-xs text-[#E9041E] font-semibold leading-tight">
                Bank360 AI
              </p>
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-[#E9041E] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status pill */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span
              className="inline-block w-2 h-2 rounded-full bg-emerald-400"
              style={{ animation: "pulse-dot 2s infinite" }}
            />
            API Connected
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-2 border-t border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "text-[#E9041E] bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
