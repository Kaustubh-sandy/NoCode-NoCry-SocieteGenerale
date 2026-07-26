'use client';

import React from 'react';
import { TabId } from '../types';

interface HeaderProps {
  apiStatus: 'online' | 'offline' | 'checking';
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenRetrain: () => void;
}

export default function Header({
  apiStatus,
  activeTab,
  setActiveTab,
  onOpenRetrain,
}: HeaderProps) {
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'customers', label: 'AI Query', icon: '🔍' },
    { id: 'browse', label: 'Browse All', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'architecture', label: 'Architecture Map', icon: '🧠' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 font-bold text-white shadow-lg shadow-rose-900/30">
              SG
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-tight text-base">Bank360 AI</span>
                <span className="rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-400 border border-rose-500/20">
                  Société Générale
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Multi-Agent Customer Intelligence & Personalization</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: API Status & Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Health Status Badge */}
          <div className="flex items-center space-x-2 rounded-full bg-slate-900 px-3 py-1 border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse'
                  : apiStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-spin'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-300">
              {apiStatus === 'online'
                ? 'Backend Live'
                : apiStatus === 'offline'
                ? 'Backend Offline'
                : 'Connecting...'}
            </span>
          </div>

          {/* Retrain Model Action */}
          <button
            onClick={onOpenRetrain}
            className="hidden sm:flex items-center space-x-1.5 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700/80 border border-slate-700 transition-all duration-200"
          >
            <span>⚡</span>
            <span>Retrain Models</span>
          </button>

        </div>

      </div>
    </header>
  );
}
