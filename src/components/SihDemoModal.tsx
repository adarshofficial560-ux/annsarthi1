'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { 
  X, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, 
  TrendingUp, AlertTriangle, ShieldCheck, Utensils, 
  MapPin, Truck, Award, RefreshCw, BarChart3, Clock 
} from 'lucide-react';

interface SihDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMap: () => void;
  onOpenEsg: () => void;
}

export const SihDemoModal: React.FC<SihDemoModalProps> = ({
  isOpen,
  onClose,
  onOpenMap,
  onOpenEsg,
}) => {
  const { stats, listings, ngos, advanceLifecycleStage } = useFoodRescue();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: 'Step 1: AI Demand Forecasting',
      tag: 'PREDICTIVE PLANNING',
      icon: '📈',
      headline: 'Predicting Tomorrow’s Kitchen Requirements',
      details: 'AI Demand Engine evaluates 30-day consumption history + Saturday banquet factor (+35%). Predicts demand of 165 kg with 94.2% statistical confidence.',
      interactiveLabel: 'Forecast: 165 kg | Recommended Production: 148 kg (-17 kg source reduction)',
      actionText: 'Proceed to Predictive Surplus Alert',
    },
    {
      title: 'Step 2: Predictive Surplus Warning',
      tag: 'EARLY WARNING',
      icon: '⚠️',
      headline: 'Proactive Alert: 50 kg Surplus Flagged 4h Early',
      details: 'Instead of waiting for evening waste, Annsarthi identifies 50kg Basmati Rice & Dal batch having safe window under 2.5 hours. Urgency set to CRITICAL_SOS.',
      interactiveLabel: 'Item: Cooked Rice & Dal (50 kg) | Risk Level: HIGH | Early Warning: Active',
      actionText: 'Review AI Production Adjustment',
    },
    {
      title: 'Step 3: AI Production Planner',
      tag: 'SOURCE REDUCTION',
      icon: '🍳',
      headline: 'Preventing Waste at the Cooking Source',
      details: 'AI Production Planner compares Chef’s planned 65 kg vs AI recommendation of 48 kg. Reduces potential waste by 32% and saves ₹2,150 in ingredient costs.',
      interactiveLabel: 'Planned: 65 kg ➔ Recommended: 48 kg | Waste Avoided: -32%',
      actionText: 'Trigger AI Computer Vision Scan',
    },
    {
      title: 'Step 4: AI Food Quality Vision Scanner',
      tag: 'COMPUTER VISION',
      icon: '🔬',
      headline: 'Instant Multi-Spectral Freshness Assessment',
      details: 'Vision AI inspects cellular turgor, steam vapor, and color integrity. Results: 95% Freshness Score, Safe Holding Window: 2.5 hours. Priority human redistribution approved.',
      interactiveLabel: 'Freshness: 95% (Good) | Safe Window: 2.5h | Priority Escalation: CRITICAL_SOS',
      actionText: 'Trigger Intelligent NGO Matching',
    },
    {
      title: 'Step 5: Intelligent Multi-Factor NGO Matcher',
      tag: 'AI ALLOCATION',
      icon: '🤝',
      headline: 'Matching with Asha Community Shelter (96% Fit)',
      details: 'Matches food with 120-resident Asha Community Shelter located 3.2 km away. Validates cold-storage capacity, dietary compliance (Jain/Veg), and rapid courier readiness.',
      interactiveLabel: 'Asha Shelter: 3.2 km away | Capacity: 120 people | Fit Score: 96%',
      actionText: 'Lock Dispatch & Route Optimization',
    },
    {
      title: 'Step 6: AI Route Optimization & GPS Radar',
      tag: 'GREEN LOGISTICS',
      icon: '🚚',
      headline: 'Multi-Stop TSP Route Optimization',
      details: 'TSP algorithm reduces logistics distance from 18.4 km to 12.1 km (34% savings) and transit time from 45 min to 28 min. Cold-chain EV Van #08 dispatched.',
      interactiveLabel: 'Distance: 18.4 km ➔ 12.1 km (-34%) | Cold Chain: 3.4°C (Safe Zone)',
      actionText: 'Simulate Delivery & Verification',
    },
    {
      title: 'Step 7: Delivery Verification & QR Handover',
      tag: 'SECURE HANDOVER',
      icon: '🍲',
      headline: '50 kg Hot Meals Handed to Shelter Director',
      details: 'EV Van arrives at Asha Shelter in 6 minutes. Temperature verified at 3.4°C. Digital QR audit receipt signed by Sister Teresa. 125 nutritious portions served.',
      interactiveLabel: 'Status: DELIVERED | Beneficiaries Fed: 125 meals | Quality Maintained: 100%',
      actionText: 'Calculate Real-Time ESG Impact',
    },
    {
      title: 'Step 8: Real-Time Sustainability & ESG Impact',
      tag: 'CARBON AUDIT',
      icon: '🌱',
      headline: 'Live Scope 3 Carbon & Water Savings Credited',
      details: 'FAO LCA conversion instantly credits +170 kg CO₂e avoided, +92,500 Liters of water preserved, and increments certified ESG dashboard metrics in real time.',
      interactiveLabel: 'CO₂e Avoided: +0.17 t | Water Preserved: +92,500 L | Landfill Diverted: 100%',
      actionText: 'Close the Circular Feedback Loop',
    },
    {
      title: 'Step 9: Neural Feedback Closed-Loop',
      tag: 'SYSTEM COMPLETE',
      icon: '🔄',
      headline: 'Operational Outcome Fed Back to Train Tomorrow’s AI',
      details: 'Delivery duration (6 min), consumption speed, and waste reduction figures are fed back into the Demand Forecasting model. Tomorrow’s baseline weights are recalibrated.',
      interactiveLabel: 'Loop Status: CLOSED & VERIFIED | Tomorrow’s Accuracy Improved by +1.8%',
      actionText: 'Finish Evaluation Flow',
    },
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const active = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#070D21] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-3xl w-full max-w-3xl p-5 sm:p-7 shadow-2xl relative flex flex-col justify-between min-h-[580px]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Stepper Bar */}
        <div>
          <div className="flex items-center justify-between mb-4 pr-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-black">
                🏆
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <span>SIH 1-Click Interactive Evaluation Tour</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                    Step {currentStep + 1} of 9
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Judges Walkthrough: From Demand Prediction to Delivery & Neural Feedback Loop
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
            {demoSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === idx
                    ? 'w-10 bg-amber-500'
                    : idx < currentStep
                    ? 'w-6 bg-emerald-500'
                    : 'w-4 bg-slate-200 dark:bg-slate-800'
                }`}
                title={step.title}
              />
            ))}
          </div>

          {/* Step Main Card */}
          <div className="p-6 bg-slate-50 dark:bg-[#0D1530] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{active.icon}</span>
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                {active.tag}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono uppercase">
                {active.title}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {active.headline}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {active.details}
              </p>
            </div>

            {/* Interactive Live Metric Display */}
            <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Live State:
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 text-right">
                {active.interactiveLabel}
              </strong>
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800/80 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep === 5 && (
              <button
                onClick={onOpenMap}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Inspect Live Fleet Radar
              </button>
            )}

            {currentStep === 7 && (
              <button
                onClick={onOpenEsg}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Inspect Certified ESG Audit
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <span>{active.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};