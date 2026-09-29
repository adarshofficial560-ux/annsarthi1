'use client';

import React, { useState, useRef } from 'react';
import { useFoodRescue } from '../lib/store';
import { 
  calculateDemandForecast, evaluateSurplusPredictions, 
  getOptimizedProductionPlan, simulateGeminiVisionAnalysis,
  getFoodItemIcon 
} from '../lib/algorithms';
import { FoodItemListing, FoodLifecycleStage } from '../types/schema';
import { compressImageFile } from '../lib/image-compressor';
import { 
  LayoutDashboard, Package, Utensils, RefreshCw, 
  Truck, BarChart3, Settings, Bell, Plus, CheckCircle2, 
  Leaf, HeartHandshake, Sparkles, TrendingUp, AlertTriangle, 
  Camera, ShieldAlert, ArrowRight, Info, Wrench, Layers,
  Upload, Trash2 
} from 'lucide-react';

interface KitchenPortalProps {
  onOpenAddModal: () => void;
  onNavigateNgo: () => void;
  onOpenConfirmation: (listing: FoodItemListing) => void;
}

export const KitchenPortal: React.FC<KitchenPortalProps> = ({
  onOpenAddModal,
  onNavigateNgo,
  onOpenConfirmation,
}) => {
  const { 
    listings, 
    kitchenDailyUsedKg, 
    kitchenEstimatedSurplusKg, 
    kitchenAvoidedKg,
    divertFoodToAlternativeRoute,
    advanceLifecycleStage 
  } = useFoodRescue();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_PLANNING' | 'QUALITY_SCANNER' | 'LIFECYCLE'>('OVERVIEW');
  const [forecastDay, setForecastDay] = useState('Saturday');
  const [eventScale, setEventScale] = useState(1.35);
  const [inventoryBuffer, setInventoryBuffer] = useState(45);
  const [pastWaste, setPastWaste] = useState(16);

  const demandForecast = calculateDemandForecast(forecastDay, eventScale, inventoryBuffer, pastWaste);
  const surplusPredictions = evaluateSurplusPredictions(listings);
  const productionPlan = getOptimizedProductionPlan();

  const [scanItemName, setScanItemName] = useState('Cooked Dal Khichdi & Rice');
  const [scanCategory, setScanCategory] = useState<any>('PREPARED_MEALS');
  const [uploadedScanImg, setUploadedScanImg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerResult, setScannerResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedLifecycleItem, setSelectedLifecycleItem] = useState<FoodItemListing>(listings[0]);
  const [whyExplanationItem, setWhyExplanationItem] = useState<string | null>(null);

  const handleRunScan = async (name?: string, cat?: any, base64Img?: string) => {
    setIsScanning(true);
    const targetImg = base64Img || uploadedScanImg || '';
    // If an image is being scanned without an explicit preset override, let Gemini Vision assess the visual specimen unbiasedly
    const targetTitle = name || (targetImg ? 'Visual Camera Specimen' : scanItemName);
    const targetCategory = cat || scanCategory;

    try {
      const response = await fetch('/api/food-quality-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: targetImg,
          foodTitle: targetTitle,
          itemName: targetTitle,
          category: targetCategory,
        }),
      });

      const data = await response.json().catch(() => null);
      if (data && data.report) {
        setScannerResult(data.report);
        if (data.report.isFoodItem && data.report.detectedContent) {
          setScanItemName(data.report.detectedContent);
        }
        setIsScanning(false);
        return;
      }
    } catch (err) {
      console.warn('API scanner fallback:', err);
    }

    const res = simulateGeminiVisionAnalysis(targetTitle, targetCategory);
    setScannerResult(res);
    setIsScanning(false);
  };

  const handleScanFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      try {
        const compressedBase64 = await compressImageFile(file);
        setUploadedScanImg(compressedBase64);
        await handleRunScan(undefined, undefined, compressedBase64);
      } catch (err) {
        console.warn('Compression fallback to FileReader:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setUploadedScanImg(base64);
          handleRunScan(undefined, undefined, base64);
        };
        reader.readAsDataURL(file);
      } finally {
        e.target.value = '';
      }
    }
  };

  const lifecycleStages: { stage: FoodLifecycleStage; label: string }[] = [
    { stage: 'CREATED', label: 'Created' },
    { stage: 'QUALITY_CHECKED', label: 'Quality Checked' },
    { stage: 'AVAILABLE', label: 'Available' },
    { stage: 'MATCHED', label: 'Matched' },
    { stage: 'PICKUP_ASSIGNED', label: 'Pickup Assigned' },
    { stage: 'IN_TRANSIT', label: 'In Transit' },
    { stage: 'DELIVERED', label: 'Delivered' },
    { stage: 'IMPACT_RECORDED', label: 'Impact Recorded' },
  ];

  const getStageIndex = (stage: FoodLifecycleStage) => {
    return lifecycleStages.findIndex((s) => s.stage === stage);
  };

  return (
    <div className="w-full min-h-[920px] bg-slate-50 dark:bg-[#051c14] text-slate-900 dark:text-slate-100 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-emerald-950/80 shadow-2xl flex flex-col gap-6 transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 dark:border-emerald-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Kitchen Operations Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-0.5">
            Central Kitchen Hub #4 &bull; Executive Culinary & Surplus Recovery Command
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-emerald-950/80 rounded-2xl border border-slate-300 dark:border-emerald-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('AI_PLANNING')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
              activeTab === 'AI_PLANNING'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Planning</span>
          </button>
          <button
            onClick={() => setActiveTab('QUALITY_SCANNER')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
              activeTab === 'QUALITY_SCANNER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Quality Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('LIFECYCLE')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
              activeTab === 'LIFECYCLE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-emerald-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lifecycle Journey</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-fade-in">
          {/* 3 Top KPI Cards - Scoped to Overview Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-emerald-200/80 font-medium">Today's Production</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  🍲
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black">{kitchenDailyUsedKg}</span>
                <span className="text-xs text-slate-400 dark:text-emerald-300 font-semibold ml-1">kg prepared</span>
              </div>
              <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                &uarr; 12% vs yesterday
              </div>
            </div>

            <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-emerald-200/80 font-medium">Predicted Surplus</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  ⚖️
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black">{kitchenEstimatedSurplusKg}</span>
                <span className="text-xs text-slate-400 dark:text-emerald-300 font-semibold ml-1">kg early flagged</span>
              </div>
              <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                &darr; 25% waste avoidance
              </div>
            </div>

            <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-emerald-200/80 font-medium">Food Waste Avoided</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  ✨
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black">{kitchenAvoidedKg}</span>
                <span className="text-xs text-slate-400 dark:text-emerald-300 font-semibold ml-1">kg saved</span>
              </div>
              <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                &uarr; 18% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold tracking-wide">Surplus Food for Redistribution & Recovery</h3>
                <p className="text-xs text-slate-500 dark:text-emerald-300/70">
                  Track batch freshness, assign algorithm matching, or divert unfit items to bio-processing
                </p>
              </div>
              <button
                onClick={onOpenAddModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Surplus Batch</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-[#03180F] text-slate-500 dark:text-emerald-200/70 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-lg">Item</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Safe Window</th>
                    <th className="p-3">Quality Score</th>
                    <th className="p-3">Urgency</th>
                    <th className="p-3 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                  {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20 transition">
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <span className="text-base">
                          {getFoodItemIcon(item.title, item.category)}
                        </span>
                        <div>
                          <div className="text-slate-900 dark:text-white font-bold">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.packagingType} &bull; {item.storageCondition}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-emerald-100 font-mono font-bold">
                        {item.quantityKg} kg
                      </td>
                      <td className="p-3 text-amber-600 dark:text-amber-300 font-medium">
                        {item.expiryString}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.freshnessScore >= 90
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700'
                        }`}>
                          {item.freshnessScore}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.urgency === 'CRITICAL_SOS'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {item.urgency}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'AVAILABLE' ? (
                            <>
                              <button
                                onClick={() => onOpenConfirmation(item)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
                              >
                                Match NGO
                              </button>
                              <button
                                onClick={() => divertFoodToAlternativeRoute(item.id, 'FOOD_PROCESSING')}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-[#03180F] hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-amber-900 rounded-xl font-semibold text-[11px] transition"
                              >
                                Divert Processing
                              </button>
                            </>
                          ) : item.status === 'DIVERTED' ? (
                            <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-xl font-mono text-[10px] border border-amber-300 dark:border-amber-800">
                              Diverted: {item.recoveryRoute}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl font-mono text-[10px] border border-emerald-300 dark:border-emerald-800">
                              Matched: {item.matchedNgoName}
                            </span>
                          )}
                          <button
                            onClick={() => setWhyExplanationItem(whyExplanationItem === item.id ? null : item.id)}
                            className="p-1 text-slate-400 hover:text-emerald-500"
                            title="Why am I seeing this?"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* TAB 2: AI PLANNING */}
      {activeTab === 'AI_PLANNING' && (
        <div className="space-y-6 animate-fade-in">
          {/* Module 1: Demand Forecast */}
          <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-base font-black tracking-tight">AI Demand Forecast Simulator</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-0.5">
                  Predict tomorrow’s consumption based on day-of-week, event scale, on-hand inventory & past waste
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                Confidence: {demandForecast.confidenceScorePercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-[#03180F] rounded-2xl border border-slate-200 dark:border-emerald-900/60 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Day of Week</label>
                <select
                  value={forecastDay}
                  onChange={(e) => setForecastDay(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold"
                >
                  <option value="Monday">Monday (Baseline ~120kg)</option>
                  <option value="Wednesday">Wednesday (Baseline ~125kg)</option>
                  <option value="Friday">Friday (Pre-Weekend ~160kg)</option>
                  <option value="Saturday">Saturday (Banquet Peak ~190kg)</option>
                  <option value="Sunday">Sunday (High Dine-in ~175kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Event Scale: <strong>{(eventScale * 100).toFixed(0)}%</strong>
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.8"
                  step="0.05"
                  value={eventScale}
                  onChange={(e) => setEventScale(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Shelf Inventory: <strong>{inventoryBuffer} kg</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={inventoryBuffer}
                  onChange={(e) => setInventoryBuffer(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Previous Cycle Waste: <strong>{pastWaste} kg</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={pastWaste}
                  onChange={(e) => setPastWaste(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-[#03180F] rounded-2xl border border-slate-200 dark:border-emerald-900/60">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Predicted Demand</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {demandForecast.predictedDemandKg} kg
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Projected tomorrow</span>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase font-bold">
                  Recommended Production
                </span>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {demandForecast.recommendedProductionKg} kg
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Corrected for inventory</span>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono uppercase font-bold">
                  Expected Surplus Buffer
                </span>
                <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
                  {demandForecast.expectedSurplusKg} kg (6%)
                </div>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">Controlled safety margin</span>
              </div>
            </div>
          </div>

          {/* Module 2: Surplus Warnings */}
          <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-black tracking-tight">AI Predictive Surplus Early-Warning</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {surplusPredictions.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-slate-50 dark:bg-[#03180F] border border-slate-200 dark:border-emerald-900/60 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{p.itemName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      p.riskLevel === 'CRITICAL'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      {p.riskLevel} RISK
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <strong>Predicted Surplus:</strong> {p.predictedSurplusKg} kg &bull; in ~{p.timeToSurplusHours}h
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{p.recommendedProactiveAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module 3: Production Planner */}
          <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-base font-black tracking-tight">AI Production Planner</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-[#03180F] text-slate-500 dark:text-emerald-200/70 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3 rounded-l-lg">Dish / Batch</th>
                    <th className="p-3">Current Planned</th>
                    <th className="p-3">AI Recommended</th>
                    <th className="p-3">Adjustment</th>
                    <th className="p-3">Waste Cut</th>
                    <th className="p-3 rounded-r-lg">Cost Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-900/40">
                  {productionPlan.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/20">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{item.dishName}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{item.currentPlannedKg} kg</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-300 font-mono font-bold">{item.aiRecommendedKg} kg</td>
                      <td className="p-3 text-blue-600 dark:text-blue-400 font-mono font-bold">{item.varianceKg} kg</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">-{item.expectedWasteReductionPercent}%</td>
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">₹{item.costSavingsEstimatedInr.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* TAB 3: STANDALONE AI FOOD QUALITY SCANNER */}
      {activeTab === 'QUALITY_SCANNER' && (
        <div className="bg-white dark:bg-[#071a13] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2 text-slate-900 dark:text-emerald-100">
                <Camera className="w-5 h-5 text-emerald-500" />
                <span>AI Multi-Spectral Food Quality Scanner</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-0.5">
                Upload image or use camera to analyze food cellular structure, moisture, and safe consumption window
              </p>
            </div>

            {/* Hidden File and Camera Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleScanFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleScanFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs transition hover:scale-105"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Upload Food Photo</span>
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isScanning}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-xs transition hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Open Camera</span>
              </button>
            </div>
          </div>

          {/* Uploaded Image Preview if present */}
          {uploadedScanImg && (
            <div className="p-3 bg-slate-50 dark:bg-[#03180F] border border-slate-200 dark:border-emerald-900 rounded-xl flex items-center gap-3">
              <img
                src={uploadedScanImg}
                alt="Captured Food Specimen"
                className="w-16 h-16 object-cover rounded-lg border border-emerald-500 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-emerald-200 truncate">
                  Visual Sensory Sample Loaded
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Analyzed by Gemini Multimodal Vision Pipeline
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadedScanImg(null);
                  setScannerResult(null);
                }}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition hover:scale-105"
                title="Discard sample"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-emerald-300">
                  Select Preset Sample or Dish Name
                </label>
                <input
                  type="text"
                  value={scanItemName}
                  onChange={(e) => setScanItemName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#03180F] border border-slate-300 dark:border-emerald-900 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-emerald-100 hover:border-emerald-400 transition"
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => { setUploadedScanImg(null); setScanItemName('Steamed Rice & Dal Khichdi'); handleRunScan('Steamed Rice & Dal Khichdi', 'PREPARED_MEALS'); }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-slate-700 dark:text-emerald-200 transition hover:scale-105"
                >
                  🍚 Cooked Rice & Dal
                </button>
                <button
                  onClick={() => { setUploadedScanImg(null); setScanItemName('Paneer Curry Gravy'); handleRunScan('Paneer Curry Gravy', 'DAIRY'); }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-slate-700 dark:text-emerald-200 transition hover:scale-105"
                >
                  🧀 Paneer Gravy
                </button>
                <button
                  onClick={() => { setUploadedScanImg(null); setScanItemName('Fresh Organic Apples'); handleRunScan('Fresh Organic Apples', 'FRUITS'); }}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-slate-700 dark:text-emerald-200 transition hover:scale-105"
                >
                  🍎 Fresh Fruit
                </button>
                <button
                  onClick={() => { setUploadedScanImg(null); setScanItemName('Spoiled Curdled Gravy'); handleRunScan('Spoiled Curdled Gravy', 'PREPARED_MEALS'); }}
                  className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-lg font-bold transition hover:scale-105"
                >
                  ⚠️ Spoiled Sample
                </button>
              </div>

              <button
                onClick={() => handleRunScan()}
                disabled={isScanning}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isScanning ? 'Executing Gemini Vision Triage...' : 'Execute AI Quality Scan'}</span>
              </button>
            </div>

            {scannerResult && (scannerResult.isFoodItem === false || scannerResult.freshnessStatus === 'INVALID_SPECIMEN') ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-700/80 rounded-2xl space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-black text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Non-Food Specimen Detected</span>
                </div>
                <div className="p-3 bg-white dark:bg-rose-900/40 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100 font-semibold leading-relaxed">
                  {scannerResult.recommendedAction || "The uploaded image appears to depict people, faces, or non-food objects. Please upload or scan a photo of actual edible food or kitchen rations."}
                </div>
                {scannerResult.detectedContent && (
                  <div className="text-[11px] font-mono text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-900/30 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-800/60">
                    <strong>AI Visual Classification:</strong> {scannerResult.detectedContent}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 dark:text-rose-300/70">
                  Notice: The AI Quality Scanner certifies only edible food, produce, and packaged rations for food safety and shelf-life compliance.
                </div>
              </div>
            ) : scannerResult && scannerResult.freshnessStatus === 'UNFIT' ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-500 dark:border-rose-700 rounded-2xl space-y-3 font-mono text-xs animate-fade-in">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm font-sans">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                  <span>SPOILED / CONTAMINATED FOOD SPECIMEN</span>
                </div>
                <div className="p-3 bg-white dark:bg-rose-900/50 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 font-sans font-semibold leading-relaxed">
                  {scannerResult.recommendedAction || "UNFIT for human consumption! Severe spoilage / microbial decomposition detected. Divert immediately to Bio-Processing / Aerobic Composting."}
                </div>
                {scannerResult.detectedContent && (
                  <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-900/30 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 font-mono">
                    <strong>Visual Spoilage Signs:</strong> {scannerResult.detectedContent}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 dark:text-rose-200">Freshness Score:</span>
                  <strong className="text-base text-rose-600 dark:text-rose-400 font-black">
                    {scannerResult.visualFreshnessScore}% (UNFIT)
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-rose-200">Estimated Safe Window:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-black">0 hours (EXPIRED)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-rose-200">Spoilage Risk Level:</span>
                  <strong className="text-rose-600 dark:text-rose-400 font-black">CRITICAL</strong>
                </div>
                <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded-xl text-[11px] font-sans font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Automatic Safety Interlock: Food donation blocked. Directing batch to Bio-Reactor / Composting.</span>
                </div>
              </div>
            ) : scannerResult ? (
              <div className="p-4 bg-slate-50 dark:bg-[#03180F] border border-slate-200 dark:border-emerald-900 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Freshness Score:</span>
                  <strong className={`text-base font-black ${
                    scannerResult.visualFreshnessScore >= 80 ? 'text-emerald-500' :
                    scannerResult.visualFreshnessScore >= 50 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {scannerResult.visualFreshnessScore}% ({scannerResult.freshnessStatus})
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Estimated Safe Window:</span>
                  <strong className={scannerResult.estimatedSafeWindowHours <= 3 ? 'text-rose-500 font-bold' : 'text-emerald-500'}>
                    {scannerResult.estimatedSafeWindowHours} hours remaining
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Spoilage Risk Level:</span>
                  <strong className={scannerResult.spoilageRisk === 'CRITICAL' || scannerResult.spoilageRisk === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}>
                    {scannerResult.spoilageRisk}
                  </strong>
                </div>

                {scannerResult.isUrgentSosEscalated && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-2 font-sans">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Safe window &lt; 3h! Automatic <strong>CRITICAL_SOS</strong> priority escalation applied.</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-sans">
                  <strong>Recommended Action:</strong> {scannerResult.recommendedAction}
                </div>

                {scannerResult.spectralFeatures && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-sans">
                    <div className="p-2 bg-white dark:bg-emerald-950/60 rounded-lg border border-slate-200 dark:border-emerald-800">
                      <span className="text-slate-400 dark:text-emerald-400/70 block font-mono uppercase text-[9px]">Color Stability</span>
                      <span className="font-semibold text-slate-700 dark:text-emerald-200">{scannerResult.spectralFeatures.colorStability}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-950/60 rounded-lg border border-slate-200 dark:border-emerald-800">
                      <span className="text-slate-400 dark:text-emerald-400/70 block font-mono uppercase text-[9px]">Texture Integrity</span>
                      <span className="font-semibold text-slate-700 dark:text-emerald-200">{scannerResult.spectralFeatures.textureIntegrity}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-950/60 rounded-lg border border-slate-200 dark:border-emerald-800">
                      <span className="text-slate-400 dark:text-emerald-400/70 block font-mono uppercase text-[9px]">Thermal Safe Zone</span>
                      <span className="font-semibold text-slate-700 dark:text-emerald-200">{scannerResult.spectralFeatures.thermalSafeZone}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-emerald-950/60 rounded-lg border border-slate-200 dark:border-emerald-800">
                      <span className="text-slate-400 dark:text-emerald-400/70 block font-mono uppercase text-[9px]">Moisture Balance</span>
                      <span className="font-semibold text-slate-700 dark:text-emerald-200">{scannerResult.spectralFeatures.moistureRetention}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 4: COMPLETE FOOD LIFECYCLE TIMELINE */}
      {activeTab === 'LIFECYCLE' && (
        <div className="bg-white dark:bg-[#083322] border border-slate-200 dark:border-emerald-800/60 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          <div>
            <h3 className="text-base font-black tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>End-to-End Food Lifecycle Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300/80 mt-0.5">
              Follow any food batch from generation to final verified delivery and sustainability impact
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {listings.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedLifecycleItem(item)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition hover:scale-105 ${
                  selectedLifecycleItem.id === item.id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-50 dark:bg-[#03180F] border-slate-200 dark:border-emerald-900/60 text-slate-600 dark:text-emerald-300'
                }`}
              >
                {getFoodItemIcon(item.title, item.category)} {item.title} ({item.quantityKg}kg)
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#03180F] rounded-2xl border border-slate-200 dark:border-emerald-900/60">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Active Batch: {selectedLifecycleItem.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                Stage: {selectedLifecycleItem.lifecycleStage}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
              {lifecycleStages.map((step, idx) => {
                const isPassed = getStageIndex(selectedLifecycleItem.lifecycleStage) >= idx;
                const isCurrent = selectedLifecycleItem.lifecycleStage === step.stage;

                return (
                  <div
                    key={step.stage}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
                        : isPassed
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-base mb-1">
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div className="text-[11px] leading-tight">{step.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Advance batch lifecycle state:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => advanceLifecycleStage(selectedLifecycleItem.id, 'IN_TRANSIT')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Mark In-Transit
                </button>
                <button
                  onClick={() => advanceLifecycleStage(selectedLifecycleItem.id, 'DELIVERED')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Mark Delivered & Record Impact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Why Am I Seeing This?" Popover */}
      {whyExplanationItem && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI Explanation: "Why Am I Seeing This Recommendation?"
            </span>
            <button
              onClick={() => setWhyExplanationItem(null)}
              className="text-emerald-700 dark:text-emerald-300 font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
            This food batch has an estimated safe holding window under 3.0 hours. Annsarthi’s risk engine elevated its urgency to <strong>CRITICAL_SOS</strong> and prioritized cold-chain pickup to prevent microbial spoilage while maximizing beneficiary portion value.
          </p>
        </div>
      )}
    </div>
  );
};