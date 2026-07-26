"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import DashboardView from "@/views/DashboardView";
import CustomersView from "@/views/CustomersView";
import InsightsView from "@/views/InsightsView";
import AdminView from "@/views/AdminView";

type Tab = "dashboard" | "customers" | "insights" | "admin";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t as Tab)}
      />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "customers" && <CustomersView />}
        {activeTab === "insights" && <InsightsView />}
        {activeTab === "admin" && <AdminView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>
            © 2026 Société Générale · Bank360 AI — Customer Segmentation &
            Personalization
          </span>
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded flex flex-col overflow-hidden"
              aria-hidden="true"
            >
              <div className="flex-1 bg-[#E9041E]" />
              <div className="h-[2px] bg-white" />
              <div className="flex-1 bg-black" />
            </div>
            <span className="font-semibold text-gray-500">SG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
