'use client';

import React from 'react';
import { useFoodRescue } from '../lib/store';
import { detectMaterialLossAnomaly } from '../lib/algorithms';
import { 
  Factory, Gauge, AlertTriangle, Zap, CheckCircle2, Wrench, 
  TrendingDown, TrendingUp, RefreshCw, Sparkles, Cpu, Layers, Leaf 
} from 'lucide-react';

interface ProcessingPortalProps {
  onOpenEsgModal?: () => void;
}

export const ProcessingPortal: React.FC<ProcessingPortalProps> = ({ onOpenEsgModal }) => {
  const { processingStats } = useFoodRescue();

  const lossAnalysis = detectMaterialLossAnomaly(
    processingStats.actualLossPercent,
    processingStats.expectedLossPercent
  );

  return (
    <div className="w-full min-h-[850px] bg-slate-50 dark:bg-[#0f0c22] text-slate-900 dark:text-violet-50 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-violet-950/80 shadow-2xl flex flex-col gap-6 transition-colors">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 dark:border-violet-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏭</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Food Processing & Bio-Recovery Unit
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-violet-300/80 mt-0.5">
            Circular value addition, raw material loss triage, predictive maintenance & energy monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenEsgModal && (
            <button
              onClick={onOpenEsgModal}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 hover:scale-105 shadow-violet-600/30"
            >
              <Leaf className="w-4 h-4" />
              <span>View CSR & ESG Impact</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Throughput */}
        <div className="bg-white dark:bg-[#18133b] border border-slate-200 dark:border-violet-900/50 rounded-2xl p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-violet-300 font-medium">Production Output</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              📦
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-violet-100">{processingStats.productionThroughputKg.toLocaleString()}</span>
            <span className="text-xs text-slate-400 dark:text-violet-300 font-semibold ml-1">kg</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300 flex items-center gap-1">
            <span>&uarr; 14% vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Raw Material */}
        <div className="bg-white dark:bg-[#18133b] border border-slate-200 dark:border-violet-900/50 rounded-2xl p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-violet-300 font-medium">Raw Material Input</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              ⚖️
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-violet-100">{processingStats.rawMaterialUsedKg.toLocaleString()}</span>
            <span className="text-xs text-slate-400 dark:text-violet-300 font-semibold ml-1">kg</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300 flex items-center gap-1">
            <span>100% Landfill Diverted</span>
          </div>
        </div>

        {/* Card 3: Material Loss */}
        <div className="bg-white dark:bg-[#18133b] border border-slate-200 dark:border-violet-900/50 rounded-2xl p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-violet-300 font-medium">Material Loss</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              ⚠️
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {processingStats.actualLossPercent}%
            </span>
            <span className="text-xs text-slate-400 dark:text-violet-300/80 font-semibold ml-1">
              (exp {processingStats.expectedLossPercent}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-rose-500 flex items-center gap-1">
            <span>+{lossAnalysis.variancePercent}% anomaly detected</span>
          </div>
        </div>

        {/* Card 4: Energy Usage */}
        <div className="bg-white dark:bg-[#18133b] border border-slate-200 dark:border-violet-900/50 rounded-2xl p-4 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-violet-300 font-medium">Energy Consumption</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              ⚡
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-violet-100">{processingStats.energyConsumptionKwh}</span>
            <span className="text-xs text-slate-400 dark:text-violet-300 font-semibold ml-1">kWh</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300 flex items-center gap-1">
            <span>Peak tariff optimization active</span>
          </div>
        </div>
      </div>

      {/* Raw Material Loss AI Anomaly Banner (Bug 14) */}
      {lossAnalysis.isAnomaly && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <span>AI Raw Material Loss Anomaly Detected (+{lossAnalysis.variancePercent}% Above Expected)</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                    ACTION REQUIRED
                  </span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                  <strong>Root Cause:</strong> {lossAnalysis.possibleCause}
                </p>
                <div className="mt-2 text-xs font-semibold text-rose-900 dark:text-rose-100 bg-white/60 dark:bg-[#0c091d] p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span><strong>AI Corrective Action:</strong> {lossAnalysis.recommendedAction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Machine Downtime & Predictive Maintenance (Bug 15) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18133b] border border-slate-200 dark:border-violet-900/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-violet-100">Machine Status & Predictive Maintenance</h3>
              <p className="text-xs text-slate-500 dark:text-violet-300/80">
                Vibration frequency signatures and automated stoppage logs
              </p>
            </div>
            <span className="text-xs font-mono text-violet-600 dark:text-violet-400 font-bold">
              3 Machines Telemetry Active
            </span>
          </div>

          <div className="space-y-3">
            {processingStats.activeMachines.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 dark:bg-[#0c091d] border border-slate-200 dark:border-violet-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs hover:border-violet-600/50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-violet-100">{m.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                        m.status === 'RUNNING'
                          ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-violet-300/80 mt-0.5">
                    {m.type} &bull; Downtime last 24h: <strong>{m.downtimeMinutesLast24h} min</strong>
                  </div>
                  <div className="mt-1 text-[11px] text-violet-700 dark:text-violet-300">
                    {m.recommendedMaintenance}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-violet-400 font-mono">Vibration Anomaly Score</div>
                  <div className="text-base font-black font-mono">
                    <span className={m.vibrationAnomalyScore > 50 ? 'text-rose-500' : 'text-violet-400'}>
                      {m.vibrationAnomalyScore} / 100
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Consumption Monitor & AI Optimization (Bug 16) */}
        <div className="bg-white dark:bg-[#18133b] border border-slate-200 dark:border-violet-900/50 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-violet-100">Energy Optimization Engine</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-violet-300/80 leading-relaxed mb-4">
              AI monitors load curves against peak time-of-day tariffs to reduce circular recovery carbon and operational costs.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-[#0c091d] rounded-xl border border-slate-200 dark:border-violet-900/50 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-violet-400">Current Grid Load:</span>
                <strong className="text-violet-600 dark:text-violet-300">342 kWh (Peak Tariff)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-violet-400">Projected Savings:</span>
                <strong className="text-violet-500 dark:text-violet-300">18.5% cost reduction</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-violet-400">Recommended Window:</span>
                <strong className="text-violet-700 dark:text-violet-200">Shift to 14:00 - 17:00</strong>
              </div>
            </div>

            <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl text-xs text-violet-800 dark:text-violet-300">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-violet-400" />
              <strong>Recommendation:</strong> Schedule batch fruit dehydration cycles during off-peak hours to save ~₹4,200/week in grid tariffs.
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-violet-900/50 text-[10px] text-slate-400 dark:text-violet-400/80 font-mono">
            Directly connected to Solar-Hybrid Grid Inverters
          </div>
        </div>
      </div>
    </div>
  );
};