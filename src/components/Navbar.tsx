'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { UserRole } from '../types/schema';
import { 
  Sun, Moon, Wifi, WifiOff, Menu, X, LogOut, ChevronDown, 
  Navigation, FileText, Activity, Plus, ShieldCheck, Sparkles
} from 'lucide-react';

interface NavbarProps {
  activePortal: UserRole;
  onSelectPortal: (portal: UserRole) => void;
  onOpenAddModal: () => void;
  onOpenSmsModal: () => void;
  onOpenMapModal: () => void;
  onOpenEsgModal: () => void;
  onOpenIotModal: () => void;
  onOpenSihDemoModal: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePortal,
  onSelectPortal,
  onOpenAddModal,
  onOpenSmsModal,
  onOpenMapModal,
  onOpenEsgModal,
  onOpenIotModal,
  onOpenSihDemoModal,
  onOpenLoginModal,
}) => {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isAuthenticated, 
    currentUser, 
    logout, 
    isOffline, 
    toggleOffline,
  } = useFoodRescue();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const portals: { role: UserRole; label: string; icon: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Authority Command Center', icon: '🛡️', desc: 'National food monitoring & ecosystem oversight' },
    { role: 'KITCHEN', label: 'Kitchen Operations Portal', icon: '🍳', desc: 'Demand forecasting, surplus & quality scanner' },
    { role: 'NGO', label: 'NGO & Food Bank Portal', icon: '🤝', desc: 'Intake matching, request feeds & shelter allocations' },
    { role: 'PROCESSING_UNIT', label: 'Food Processing Unit', icon: '🏭', desc: 'Circular recovery, loss triage & machine metrics' },
  ];

  const currentPortalConfig = portals.find(p => p.role === activePortal) || portals[0];

  return (
    <header className="w-full flex flex-col gap-2.5">
      {/* Welcome & System Notification Ticker */}
      {!welcomeDismissed && (
        <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2 rounded-2xl flex items-center justify-between text-xs shadow-md animate-fade-in">
          <div className="flex items-center gap-2 font-medium overflow-hidden">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px] bg-black/20 px-2 py-0.5 rounded-full">
              LIVE NETWORK
            </span>
            <p className="truncate">
              🎉 Welcome to <strong>Annsarthi</strong> — India's AI-Powered Closed-Loop Food Operations & Zero-Waste Ecosystem. Connected to 48 Active Kitchens & 120+ Recipient Shelters.
            </p>
          </div>
          <button 
            onClick={() => setWelcomeDismissed(true)} 
            className="text-white/80 hover:text-white font-bold ml-2 p-1 text-xs shrink-0 hover:scale-110 transition"
            title="Dismiss Welcome Message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Global Navigation Bar */}
      <div className="w-full bg-white dark:bg-[#071a13]/95 backdrop-blur-xl border border-slate-200 dark:border-emerald-900/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl transition-colors">
        {/* Brand Logo with New User Uploaded Image */}
        <div className="flex items-center gap-3">
          <img 
            src="/annsarthi-logo.png" 
            alt="Annsarthi Logo" 
            className="w-10 h-10 object-contain rounded-2xl hover:scale-105 transition-transform" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-emerald-50 tracking-tight">
                Annsarthi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 hidden sm:block">
              Closed-Loop Food Operations & Zero-Waste Ecosystem
            </p>
          </div>
        </div>

        {/* Desktop Portal Switcher Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 border border-slate-200 dark:border-emerald-800 text-xs font-semibold text-slate-800 dark:text-emerald-100 transition shadow-sm hover:scale-[1.02]"
          >
            <span className="text-base">{currentPortalConfig.icon}</span>
            <div className="text-left">
              <div className="font-bold text-xs">{currentPortalConfig.label}</div>
              <div className="text-[10px] text-slate-400 dark:text-emerald-400/70">Switch active dashboard</div>
            </div>
            <ChevronDown className={`w-4 h-4 ml-1 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#0a261c] border border-slate-200 dark:border-emerald-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-fade-in">
              <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-emerald-400/80 border-b border-slate-100 dark:border-emerald-900/60 font-bold">
                Select Annsarthi Portal
              </div>
              <div className="space-y-1 mt-1">
                {portals.map((p) => (
                  <button
                    key={p.role}
                    onClick={() => {
                      onSelectPortal(p.role);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition hover:scale-[1.01] ${
                      activePortal === p.role
                        ? 'bg-emerald-50 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                        : 'hover:bg-slate-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-emerald-300'
                    }`}
                  >
                    <span className="text-xl mt-0.5">{p.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-emerald-400/80 leading-tight mt-0.5">
                        {p.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Action Bar */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <button
            onClick={onOpenSihDemoModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform hover:scale-105"
            title="Launch 9-Step Interactive SIH Evaluation Flow"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>SIH Demo Tour</span>
          </button>

          <button
            onClick={onOpenMapModal}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/80 hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 font-semibold flex items-center gap-1.5 transition hover:scale-105"
            title="Rourkela Geospatial Fleet Radar & Couriers"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-500" />
            <span>Fleet Radar</span>
          </button>

          <button
            onClick={onOpenIotModal}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/80 hover:bg-slate-200 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 font-semibold flex items-center gap-1.5 transition hover:scale-105"
            title="Storage & Cold Chain IoT Telemetry Stream"
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>IoT Cold-Chain</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition hover:scale-105"
            title="Create Food Surplus Listing with Photo Quality Scanner"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Surplus</span>
          </button>
        </div>

        {/* Right Tools: Dark/Light, Offline Mode, Auth Pill, Mobile Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleOffline}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition hover:scale-105 ${
              isOffline
                ? 'bg-amber-500 text-white border-amber-600 shadow-md animate-pulse'
                : 'bg-slate-100 dark:bg-emerald-950/80 text-slate-600 dark:text-emerald-300 border-slate-200 dark:border-emerald-800 hover:bg-slate-200 dark:hover:bg-emerald-900'
            }`}
            title={isOffline ? 'Offline Mode Active' : 'Click to simulate No-Signal Offline Mode'}
          >
            {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
            <span className="hidden xl:inline text-[11px]">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-emerald-950/80 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 hover:bg-slate-200 dark:hover:bg-emerald-900 transition hover:scale-105"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-emerald-800">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-emerald-100 flex items-center justify-end gap-1">
                  <span>{currentUser.displayName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-emerald-300/70 font-mono truncate max-w-[130px]">
                  {currentUser.organization}
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/80 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-emerald-800 transition hover:scale-105"
                title="Sign out of Annsarthi"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition hover:scale-105"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl md:hidden bg-slate-100 dark:bg-emerald-950 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-white dark:bg-[#071a13] border border-slate-200 dark:border-emerald-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 animate-fade-in z-50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/80 border-b border-slate-100 dark:border-emerald-900 pb-2">
            Switch Dashboard
          </div>
          <div className="grid grid-cols-2 gap-2">
            {portals.map((p) => (
              <button
                key={p.role}
                onClick={() => {
                  onSelectPortal(p.role);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left border flex items-center gap-2 transition hover:scale-105 ${
                  activePortal === p.role
                    ? 'bg-emerald-50 dark:bg-emerald-900/60 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
                    : 'bg-slate-50 dark:bg-emerald-950/80 border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-300'
                }`}
              >
                <span className="text-lg">{p.icon}</span>
                <span className="text-xs">{p.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-400/80 border-b border-slate-100 dark:border-emerald-900 pt-2 pb-1">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { onOpenSihDemoModal(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-amber-500 text-white font-bold flex items-center gap-2 hover:scale-105 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>SIH Demo Tour</span>
            </button>
            <button
              onClick={() => { onOpenAddModal(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2 hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Surplus</span>
            </button>
            <button
              onClick={() => { onOpenMapModal(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-950 text-slate-800 dark:text-emerald-200 flex items-center gap-2 hover:scale-105 transition"
            >
              <Navigation className="w-4 h-4 text-cyan-500" />
              <span>Rourkela Radar</span>
            </button>
            <button
              onClick={() => { onOpenIotModal(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-950 text-slate-800 dark:text-emerald-200 flex items-center gap-2 hover:scale-105 transition"
            >
              <Activity className="w-4 h-4 text-rose-500" />
              <span>IoT Telemetry</span>
            </button>
            <button
              onClick={() => { onOpenEsgModal(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-emerald-950 text-slate-800 dark:text-emerald-200 flex items-center gap-2 hover:scale-105 transition"
            >
              <FileText className="w-4 h-4 text-purple-500" />
              <span>ESG Report</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};