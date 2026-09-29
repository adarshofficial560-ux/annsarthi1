'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { getFoodItemIcon } from '../lib/algorithms';
import { 
  LayoutDashboard, Users, Building2, Utensils, RefreshCw, 
  Truck, BarChart3, Leaf, Settings, Bell, Plus, FileText, 
  CheckCircle2, AlertTriangle, AlertCircle, ShieldCheck, 
  Sparkles, TrendingUp, Navigation, Activity, ArrowRight, Info, Wrench
} from 'lucide-react';

interface AdminPortalProps {
  onOpenAddModal: () => void;
  onOpenEsgModal: () => void;
  onOpenSmsModal: () => void;
  onOpenMapModal: () => void;
  onOpenIotModal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onOpenAddModal,
  onOpenEsgModal,
  onOpenSmsModal,
  onOpenMapModal,
  onOpenIotModal,
}) => {
  const { 
    stats, 
    listings, 
    pickups, 
    iotSensors, 
    actionQueue, 
    auditLogs, 
    resolveActionQueueItem,
    currentUser 
  } = useFoodRescue();

  const [whyItem, setWhyItem] = useState<string | null>(null);

  // Compute live command center metrics
  const foodAtRiskKg = listings
    .filter(l => l.urgency === 'CRITICAL_SOS' || l.safeWindowHours <= 3)
    .reduce((acc, curr) => acc + curr.quantityKg, 0);

  const predictedSurplusKg = 145; // Aggregated ecosystem forecast
  const activeRedistributions = pickups.filter(p => p.status === 'IN_TRANSIT').length;
  const pendingPickups = pickups.filter(p => p.status === 'CONFIRMED' || p.status === 'SCHEDULED').length;

  return (
    <div className="w-full min-h-[920px] bg-slate-50 dark:bg-[#070e1e] text-slate-900 dark:text-blue-50 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-blue-950/80 shadow-2xl flex flex-col gap-6 transition-colors">
      {/* Top Header & Authority Identity Badge (Updates 1 & 5) */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 dark:border-blue-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI Food Operations Command Center
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-blue-300/80 mt-0.5">
            <span>Logged in as:</span>
            <strong className="text-slate-800 dark:text-blue-100">{currentUser.displayName}</strong>
            <span>&bull;</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{currentUser.organization}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Rourkela Central Oversight</span>
          </span>
        </div>
      </div>

      {/* 7 AI Command Center Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-sm hover:scale-[1.02] transition-all">
          <span className="text-[11px] text-slate-500 dark:text-blue-300 font-medium">Food Waste Prevented</span>
          <div className="mt-2 text-xl font-black text-blue-600 dark:text-blue-300">
            {stats.totalFoodSavedKg.toLocaleString()} <span className="text-xs font-normal text-slate-400 dark:text-blue-400/80">kg</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">&uarr; 18% vs last mo</div>
        </div>

        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-sm hover:scale-[1.02] transition-all">
          <span className="text-[11px] text-slate-500 dark:text-blue-300 font-medium">Food At Risk</span>
          <div className="mt-2 text-xl font-black text-rose-500 dark:text-rose-400">
            {foodAtRiskKg} <span className="text-xs font-normal text-slate-400 dark:text-blue-400/80">kg</span>
          </div>
          <div className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold mt-0.5">Expiring &lt; 3 hours</div>
        </div>

        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-sm hover:scale-[1.02] transition-all">
          <span className="text-[11px] text-slate-500 dark:text-blue-300 font-medium">Predicted Surplus</span>
          <div className="mt-2 text-xl font-black text-blue-600 dark:text-blue-300">
            {predictedSurplusKg} <span className="text-xs font-normal text-slate-400 dark:text-blue-400/80">kg</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Weekend projection</div>
        </div>

        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-sm hover:scale-[1.02] transition-all">
          <span className="text-[11px] text-slate-500 dark:text-blue-300 font-medium">Active Transit</span>
          <div className="mt-2 text-xl font-black text-blue-600 dark:text-blue-300">
            {activeRedistributions} <span className="text-xs font-normal text-slate-400 dark:text-blue-400/80">fleets</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Cold-chain tracked</div>
        </div>

        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-sm hover:scale-[1.02] transition-all">
          <span className="text-[11px] text-slate-500 dark:text-blue-300 font-medium">Pending Pickups</span>
          <div className="mt-2 text-xl font-black text-blue-600 dark:text-blue-300">
            {pendingPickups} <span className="text-xs font-normal text-slate-400 dark:text-blue-400/80">batches</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Scheduled dispatch</div>
        </div>

        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-3.5 shadow-sm hover:scale-[1.02] transition-all">
          <span className="text-[11px] text-slate-500 dark:text-blue-300 font-medium">CO₂e Avoided</span>
          <div className="mt-2 text-xl font-black text-blue-600 dark:text-blue-300">
            {stats.co2SavedTons.toFixed(1)} <span className="text-xs font-normal text-slate-400 dark:text-blue-400/80">t</span>
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Scope 3 Certified</div>
        </div>
      </div>

      {/* AI Action & Incident Queue (Update 4 & Bug 17) */}
      <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-blue-100">Authority AI Action & Incident Queue</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-blue-400/80">
            {actionQueue.length} Active Operational Interventions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actionQueue.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 text-xs hover:scale-[1.01] transition-all ${
                item.urgency === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900'
                  : 'bg-slate-50 dark:bg-[#091124] border-slate-200 dark:border-blue-900/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 dark:text-blue-400/80">{item.source}</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold ${
                    item.urgency === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {item.urgency}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-blue-100 mt-1 leading-snug">{item.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-blue-200/80 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-blue-900/50">
                <div className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold">
                  <strong>Recommended:</strong> {item.suggestedAction}
                </div>
                <button
                  onClick={() => resolveActionQueueItem(item.id)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[11px] transition shadow-sm hover:scale-105"
                >
                  Authorize Intervention
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Audit/Activity Log (Update 8) + Recent Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-blue-100">Network-Wide Food Listings</h3>
            <button onClick={onOpenAddModal} className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">
              + New Batch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#091124] text-slate-500 dark:text-blue-300/80 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Food Item</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Source Hub</th>
                  <th className="p-3">Safe Window</th>
                  <th className="p-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-blue-900/20 transition">
                    <td className="p-3 font-semibold text-slate-900 dark:text-blue-100 flex items-center gap-2">
                      <span className="text-base">{getFoodItemIcon(item.title, item.category)}</span>
                      {item.title}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 dark:text-blue-200">{item.quantityKg} kg</td>
                    <td className="p-3 text-slate-500 dark:text-blue-300/80">{item.sourceHub}</td>
                    <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">{item.expiryString}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'AVAILABLE'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          : 'bg-blue-50 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Authority Activity & Audit Log (Update 8) */}
        <div className="bg-white dark:bg-[#0d1833] border border-slate-200 dark:border-blue-900/50 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-blue-100">Authority Audit Log</h3>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">SHA-256 Verified</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-blue-300/80 mb-3">
              Immutable chronological record of surplus creation, AI triage, dispatch & ESG impacts
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#091124] border border-slate-200 dark:border-blue-900/40 text-xs space-y-1 hover:border-blue-700 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-blue-400/80">
                    <span className="font-bold text-slate-700 dark:text-blue-300">{log.action}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-blue-100 leading-snug">
                    {log.details}
                  </p>
                  <div className="text-[9px] font-mono text-slate-400 dark:text-blue-400/60 truncate">
                    Actor: {log.actor} &bull; {log.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-blue-900/50 flex items-center justify-between text-xs">
            <button
              onClick={onOpenEsgModal}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-slate-700 dark:text-blue-200 rounded-xl font-bold transition flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Generate Official ESG Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};