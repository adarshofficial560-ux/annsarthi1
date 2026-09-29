'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { FoodItemListing, NgoEntity } from '../types/schema';
import { getFoodItemIcon } from '../lib/algorithms';
import { 
  X, CheckCircle2, ShieldCheck, Truck, Clock, MapPin, 
  Users, AlertTriangle, ArrowRight, Sparkles, Thermometer 
} from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: FoodItemListing | null;
  targetNgo: NgoEntity | null;
  fitScore?: number;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  listing,
  targetNgo,
  fitScore = 95,
}) => {
  const { confirmNgoDispatch } = useFoodRescue();
  const [vehicleType, setVehicleType] = useState('EV Insulated Van #08');
  const [driverName, setDriverName] = useState('Rajesh Kumar (Fleet #08)');
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen || !listing || !targetNgo) return null;

  const etaMin = Math.round(targetNgo.distanceKm * 3.2 + 6);
  const remainingRoomKg = targetNgo.dailyIntakeCapacityKg - targetNgo.currentIntakeKg;
  const safeMarginHours = (listing.safeWindowHours - etaMin / 60).toFixed(1);

  const handleConfirm = () => {
    confirmNgoDispatch(listing.id, targetNgo.id, vehicleType, driverName, etaMin);
    setIsConfirmed(true);
    setTimeout(() => {
      setIsConfirmed(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#071a13] border border-slate-200 dark:border-emerald-800/70 text-slate-900 dark:text-emerald-50 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-slate-500 dark:text-emerald-300 transition hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-emerald-50">Resource Match Confirmation</h2>
            <p className="text-xs text-slate-500 dark:text-emerald-300/80">
              Verify cold-chain routing, beneficiary capacity & dispatch courier
            </p>
          </div>
        </div>

        {/* Success Splash */}
        {isConfirmed ? (
          <div className="my-8 text-center py-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-base font-black text-emerald-700 dark:text-emerald-300">
              Courier Dispatched & Route Locked!
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-400/80 mt-1">
              Tracking ID #{Date.now().toString().slice(-6)} &bull; Audit ledger updated
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            {/* Fit Score Banner */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  Algorithmic Compatibility Fit
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs">
                {fitScore}% Match Score
              </span>
            </div>

            {/* Recipient & Food Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Food Item */}
              <div className="p-3 bg-slate-50 dark:bg-[#0a271c] border border-slate-200 dark:border-emerald-900/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 dark:text-emerald-400/80 font-mono uppercase">Surplus Food Cargo</span>
                <div className="font-bold text-sm text-slate-800 dark:text-emerald-100 mt-0.5 flex items-center gap-1.5">
                  <span>{getFoodItemIcon(listing.title, listing.category)}</span>
                  <span>{listing.title}</span>
                </div>
                <div className="mt-1 text-slate-500 dark:text-emerald-300/80 font-mono">
                  Quantity: <strong className="text-emerald-600 dark:text-emerald-400">{listing.quantityKg} kg</strong>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1">
                  Safe Window: {listing.safeWindowHours}h ({listing.urgency})
                </div>
              </div>

              {/* Recipient NGO */}
              <div className="p-3 bg-slate-50 dark:bg-[#0a271c] border border-slate-200 dark:border-emerald-900/60 rounded-2xl">
                <span className="text-[10px] text-slate-400 dark:text-emerald-400/80 font-mono uppercase">Assigned Recipient</span>
                <div className="font-bold text-sm text-emerald-800 dark:text-emerald-200 mt-0.5">{targetNgo.name}</div>
                <div className="mt-1 text-slate-500 dark:text-emerald-300/80 font-mono">
                  Capacity: <strong className="text-slate-700 dark:text-emerald-100">{remainingRoomKg} kg room</strong>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-emerald-400 mt-1">
                  Beneficiaries: {targetNgo.activeBeneficiaries} residents
                </div>
              </div>
            </div>

            {/* Logistics Parameters (Distance, ETA, Cold Chain) */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> Distance:
                </span>
                <strong>{targetNgo.distanceKm} km</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Target Transit ETA:
                </span>
                <strong className="text-amber-600 dark:text-amber-400">~{etaMin} minutes</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-500" /> Cold-Chain Holding:
                </span>
                <span>{targetNgo.coldStorageAvailable ? '✅ Installed (≤4°C)' : '⚠️ Ambient Only'}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Arrival Safety Margin:
                </span>
                <strong className="text-emerald-600 dark:text-emerald-400">+{safeMarginHours} hours buffer</strong>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Select Dispatch Fleet & Carrier
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070B1E] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="EV Insulated Van #08">EV Insulated Van #08 &bull; Rajesh Kumar (3.4°C Chilled)</option>
                <option value="Electric 3-Wheeler #04">Electric 3-Wheeler Carrier #04 &bull; Amit Verma (Ambient Dry)</option>
                <option value="Refrigerated Carrier #02">Refrigerated Heavy Carrier #02 &bull; Vikram Singh (2.8°C Deep Chill)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <span>Confirm & Dispatch Courier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};