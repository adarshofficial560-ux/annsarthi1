'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { getFoodItemIcon } from '../lib/algorithms';
import { 
  LayoutDashboard, ShoppingBag, Send, Truck, Users, 
  BarChart3, Settings, Bell, Leaf, Heart, Home, Soup, CheckCircle, Clock, MapPin, Sparkles, Navigation 
} from 'lucide-react';

interface NgoPortalProps {
  onOpenLiveRadar: () => void;
}

export const NgoPortal: React.FC<NgoPortalProps> = ({ onOpenLiveRadar }) => {
  const { listings, pickups, requestFood, currentUser } = useFoodRescue();
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handleRequest = (listingId: string) => {
    requestFood(listingId, 'Asha Community Shelter');
    setRequestedId(listingId);
    setTimeout(() => setRequestedId(null), 3500);
  };

  return (
    <div className="w-full min-h-[920px] bg-slate-50 dark:bg-[#120D2C] text-slate-900 dark:text-slate-100 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-purple-900/60 shadow-2xl flex flex-col gap-6 transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 dark:border-purple-900/50 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              NGO & Food Bank Shelter Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-purple-300/80 mt-0.5">
            Asha Community Shelter &bull; Active Beneficiaries: 120 Residents &bull; Cold Storage: Verified Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLiveRadar}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Track Incoming Fleet</span>
          </button>
        </div>
      </div>

      {/* 3 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1542] border border-slate-200 dark:border-purple-800/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-purple-200/80 font-medium">Food Received Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              📦
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black">120</span>
            <span className="text-xs text-slate-400 dark:text-purple-300 font-semibold ml-1">kg safe food</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            &uarr; 25% vs last week
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1542] border border-slate-200 dark:border-purple-800/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-purple-200/80 font-medium">People Benefited</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              👥
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black">480</span>
            <span className="text-xs text-slate-400 dark:text-purple-300 font-semibold ml-1">meals served</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            &uarr; 30% vs last week
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1542] border border-slate-200 dark:border-purple-800/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-purple-200/80 font-medium">CO₂ Saved</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              ☁️
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black">0.8</span>
            <span className="text-xs text-slate-400 dark:text-purple-300 font-semibold ml-1">tons</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            &uarr; 20% vs last week
          </div>
        </div>
      </div>
      {/* 2-Column Grid: Available Food Feed + Incoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Available Food Feed */}
        <div className="bg-white dark:bg-[#1C1542] border border-slate-200 dark:border-purple-800/50 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-wide">Available Surplus for Shelter Claiming</h3>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-mono font-bold">
                {listings.filter(l => l.status === 'AVAILABLE').length} Batches Active
              </span>
            </div>

            <div className="space-y-3">
              {listings.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 dark:bg-[#120D2C] rounded-xl border border-slate-200 dark:border-purple-900/60 hover:border-purple-400 transition gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-lg">
                      {getFoodItemIcon(item.title, item.category)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-purple-300/80">
                        {item.quantityKg} kg &bull; {item.expiryString} &bull; {item.sourceHub}
                      </div>
                    </div>
                  </div>

                  <div>
                    {item.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => handleRequest(item.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition hover:scale-105"
                      >
                        Claim for Shelter
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono rounded-lg border border-emerald-300 dark:border-emerald-800">
                        Assigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Incoming Pickups & Deliveries */}
        <div className="bg-white dark:bg-[#1C1542] border border-slate-200 dark:border-purple-800/50 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-wide">Incoming Deliveries & Couriers</h3>
              <button onClick={onOpenLiveRadar} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">
                Live GPS Radar
              </button>
            </div>

            <div className="space-y-3">
              {pickups.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-slate-50 dark:bg-[#120D2C] rounded-xl border border-slate-200 dark:border-purple-900/60 space-y-1.5 text-xs hover:border-purple-500/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-cyan-500" />
                      {p.vehicleType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 text-[10px] font-mono font-bold">
                      ETA ~{p.etaMinutes}m
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Driver: {p.driverName} &bull; Cold-Chain: <strong>{p.tempCelsius}°C</strong> (Safe Zone)
                  </div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300">
                    Cargo: {p.quantityKg} kg from {p.hubName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-purple-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-purple-300/80 font-mono text-[11px]">✓ Verified Food Safety Protocols</span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 rounded-xl font-bold text-xs">
              Shelter Intakes Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};