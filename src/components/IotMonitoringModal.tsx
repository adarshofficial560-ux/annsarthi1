'use client';

import React from 'react';
import { useFoodRescue } from '../lib/store';
import { 
  X, Activity, Thermometer, Droplets, ShieldCheck, 
  AlertTriangle, Battery, BellRing, RefreshCw, Sparkles 
} from 'lucide-react';

interface IotMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IotMonitoringModal: React.FC<IotMonitoringModalProps> = ({ isOpen, onClose }) => {
  const { iotSensors, simulateSensorAnomaly } = useFoodRescue();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#090E24] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-3xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  IoT Cold-Chain & Storage Sensor Telemetry
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold">
                  MQTT &bull; Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continuous temperature, humidity, and door seal compliance across facilities & EV fleets
              </p>
            </div>
          </div>

          {/* Interactive Anomaly Simulator Button */}
          <button
            onClick={simulateSensorAnomaly}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-2"
            title="Simulate +6.8°C thermal excursion in Walk-In Chiller to test real-time breach detection"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Simulate Sensor Anomaly</span>
          </button>
        </div>

        {/* 4 Sensor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {iotSensors.map((sensor) => {
            const isBreach = sensor.temperatureCelsius > sensor.targetMaxTemp || sensor.doorStatus === 'OPEN';

            return (
              <div
                key={sensor.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isBreach
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-lg shadow-rose-500/10'
                    : 'bg-slate-50 dark:bg-[#101935] border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                      {sensor.location}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{sensor.unitName}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      isBreach
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {isBreach ? 'BREACH ALERT' : 'SAFE'}
                  </span>
                </div>

                {/* Primary Metric Displays */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  {/* Temp */}
                  <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-500" /> Temperature
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {sensor.temperatureCelsius}°C
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Target: {sensor.targetMinTemp}°C to {sensor.targetMaxTemp}°C
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mb-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" /> Humidity
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">
                      {sensor.humidityPercent}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">RH Standard Safe</div>
                  </div>
                </div>

                {/* Sensor Secondary Details */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Door: <strong>{sensor.doorStatus}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    <span>Battery: {sensor.batteryPercent}%</span>
                  </div>
                  <span>Ping: {sensor.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 24-Hour Telemetry Temperature Graph (Simulated SVG) */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-[#101935] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Cold-Chain Temperature Stability History (Past 24 Hours)
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
              Critical Upper Limit: 4.0°C &bull; Target Baseline: 3.4°C
            </span>
          </div>

          <div className="h-28 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100">
              <line x1="0" y1="25" x2="500" y2="25" stroke="#ef4444" strokeDasharray="3 3" strokeWidth="1.5" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#10b981" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />

              <text x="5" y="22" fill="#ef4444" fontSize="9" fontWeight="bold">4.0°C Threshold</text>
              <text x="5" y="47" fill="#10b981" fontSize="9">3.4°C Target</text>

              {/* Temperature Trend Line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="20,52 60,50 100,53 140,49 180,51 220,50 260,54 300,52 340,51 380,49 420,52 460,50 490,48"
              />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
};