'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { UserRole } from '../types/schema';
import { X, ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useFoodRescue();
  const [username, setUsername] = useState('annsarthi');
  const [password, setPassword] = useState('annsarthi1');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(username, password, selectedRole);
    if (result.success) {
      setErrorMsg(null);
      onSuccess(selectedRole);
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0D1530] border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <img src="/annsarthi-logo.png" alt="Annsarthi Logo" className="w-11 h-11 object-contain rounded-2xl shadow-md bg-white p-1" />
          <div>
            <h2 className="text-lg font-black tracking-tight">Annsarthi Authentication</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your designated operational portal</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Username</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (annsarthi)"
                className="w-full bg-slate-50 dark:bg-[#070B1E] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (annsarthi1)"
                className="w-full bg-slate-50 dark:bg-[#070B1E] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Role & Portal</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'ADMIN' as UserRole, label: '🛡️ Authority Admin' },
                { role: 'KITCHEN' as UserRole, label: '🍳 Kitchen Chef' },
                { role: 'NGO' as UserRole, label: '🤝 NGO Shelter' },
                { role: 'PROCESSING_UNIT' as UserRole, label: '🏭 Processing Unit' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.role}
                  onClick={() => setSelectedRole(item.role)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                    selectedRole === item.role
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:scale-[1.01]"
          >
            Authenticate & Open Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};