'use client';

import React, { useState } from 'react';
import { 
  X, RefreshCw, Sparkles, ArrowRight, ShieldCheck, 
  BarChart3, Truck, Utensils, Award, Cpu, Database 
} from 'lucide-react';

interface ClosedLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClosedLoopModal: React.FC<ClosedLoopModalProps> = ({ isOpen, onClose }) => {
  const [selectedNode, setSelectedNode] = useState<number>(0);

  if (!isOpen) return null;

  const cycleSteps = [
    {
      id: 1,
      title: '1. AI Demand Forecasting',
      badge: 'PREDICTIVE INTAKE',
      icon: '📈',
      desc: 'Ingests historical daily consumption, day-of-week trends, banquet/event calendars, and past waste to forecast tomorrow’s requirement.',
      feedbackImpact: 'Trained on actual consumption records from previous delivery cycles to eliminate over-production.',
    },
    {
      id: 2,
      title: '2. AI Production Planner',
      badge: 'SOURCE REDUCTION',
      icon: '🍳',
      desc: 'Translates forecast into optimized culinary batch preparations, reducing raw ingredient loss before cooking starts.',
      feedbackImpact: 'Dynamically dampens planned quantities based on shelf inventory credits.',
    },
    {
      id: 3,
      title: '3. Predictive Surplus Early-Warning',
      badge: 'PROACTIVE TRIAGE',
      icon: '⚖️',
      desc: 'Identifies food items likely to become surplus 4–6 hours in advance instead of waiting until closing time.',
      feedbackImpact: 'Triggers early recipient matching before cooked food degrades.',
    },
    {
      id: 4,
      title: '4. Computer Vision Quality Scanner',
      badge: 'FOOD SAFETY',
      icon: '🔬',
      desc: 'Rapid multispectral optical assessment calculating freshness score (0-100%), safe holding hours, and spoilage risk.',
      feedbackImpact: 'If safe window is under 3 hours, automatically elevates urgency to CRITICAL_SOS.',
    },
    {
      id: 5,
      title: '5. Intelligent Multi-Factor Matching',
      badge: 'OPTIMAL ALLOCATION',
      icon: '🤝',
      desc: 'Algorithms match surplus to compatible shelters based on distance, beneficiary headcount, dietary constraints, and cold storage.',
      feedbackImpact: 'Prevents shelter intake overflow and ensures strict compliance with dietary needs.',
    },
    {
      id: 6,
      title: '6. AI Route Optimization & GPS Fleet',
      badge: 'GREEN LOGISTICS',
      icon: '🚚',
      desc: 'TSP-based route optimization computes multi-stop delivery sequences, saving 34% travel distance and 17+ minutes.',
      feedbackImpact: 'Live cold-chain telemetry verifies continuous safe temperature holding throughout transit.',
    },
    {
      id: 7,
      title: '7. Direct Delivery & Circular Recovery',
      badge: 'ZERO LANDFILL',
      icon: '🍲',
      desc: 'Nutritious meals served to beneficiaries; non-edible organic food diverted to bio-processing or composting.',
      feedbackImpact: 'Generates verified QR-audit receipts closing chain of custody.',
    },
    {
      id: 8,
      title: '8. Automated Impact & ESG Telemetry',
      badge: 'CARBON CREDITS',
      icon: '🌱',
      desc: 'Calculates kilograms saved, Scope 3 CO₂e avoided, water preserved, and meals served with FAO/IPCC formulas.',
      feedbackImpact: 'Creates verifiable CSR audits and UN SDG 12.3 compliance metrics.',
    },
    {
      id: 9,
      title: '9. Neural Feedback Loop (Closed-Loop)',
      badge: 'CONTINUOUS LEARNING',
      icon: '🔄',
      desc: 'Outcome data (actual consumption, delivery times, temperature stability) is automatically fed back into the Demand Forecaster.',
      feedbackImpact: 'Every completed rescue calibrates tomorrow’s model weights, creating a self-improving zero-waste ecosystem.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#070D21] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-3xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center font-bold">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              Annsarthi Closed-Loop Ecosystem Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Feature 22 & 13: How real-world operational outcomes feed back into continuous AI learning
            </p>
          </div>
        </div>

        {/* Circular Flow Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
          {cycleSteps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => setSelectedNode(idx)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedNode === idx
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-xl">{step.icon}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {step.badge}
                </span>
              </div>
              <h4 className="font-bold text-xs mt-2 text-slate-900 dark:text-white">{step.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Deep Dive on Selected Step */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-blue-950/40 border border-emerald-800/60 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-sm text-emerald-300">
              Deep Dive: {cycleSteps[selectedNode].title}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {cycleSteps[selectedNode].desc}
          </p>
          <div className="p-3 bg-black/40 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-emerald-400 font-bold font-mono text-[11px]">
              🔄 Closed-Loop Feedback Impact:
            </span>
            <p className="text-slate-300 mt-0.5 font-mono text-[11px]">
              {cycleSteps[selectedNode].feedbackImpact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};