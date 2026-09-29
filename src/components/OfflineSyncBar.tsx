'use client';

import React from 'react';
import { useFoodRescue } from '../lib/store';
import { WifiOff, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const OfflineSyncBar: React.FC = () => {
  const { isOffline, toggleOffline, offlineQueueCount, syncOfflineQueue } = useFoodRescue();

  if (!isOffline && offlineQueueCount === 0) return null;

  return (
    <div className="w-full bg-amber-500/90 dark:bg-amber-950/90 border border-amber-400 dark:border-amber-800 text-slate-900 dark:text-amber-200 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-fade-in backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-amber-400 dark:bg-amber-800/80 flex items-center justify-center font-bold text-amber-950 dark:text-amber-100">
          <WifiOff className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold">
            {isOffline ? 'Field Offline Mode Active' : 'Connectivity Restored'}
          </span>
          <span className="hidden sm:inline text-amber-900 dark:text-amber-300 ml-2">
            ({offlineQueueCount} local record{offlineQueueCount === 1 ? '' : 's'} waiting to synchronize)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={syncOfflineQueue}
          disabled={offlineQueueCount === 0}
          className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
            offlineQueueCount > 0
              ? 'bg-amber-950 text-white hover:bg-black shadow-md'
              : 'opacity-50 cursor-not-allowed bg-amber-200 dark:bg-amber-900 text-amber-800'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Now ({offlineQueueCount})</span>
        </button>

        {isOffline && (
          <button
            onClick={toggleOffline}
            className="px-2.5 py-1.5 rounded-xl bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 font-bold transition text-[11px]"
          >
            Go Online
          </button>
        )}
      </div>
    </div>
  );
};