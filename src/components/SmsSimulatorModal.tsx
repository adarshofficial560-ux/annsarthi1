'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface SmsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsSimulatorModal: React.FC<SmsSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { simulateSmsListing } = useFoodRescue();

  const [smsInput, setSmsInput] = useState('SURPLUS RICE 30KG 19:00');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const res = simulateSmsListing(smsInput);
    setResult(res);
  };

  const setTemplate = (tmpl: string) => {
    setSmsInput(tmpl);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D1530] border border-slate-700/80 text-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">SMS / USSD Gateway Simulator</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Feature 20: Twilio Webhook Parser translating SMS strings into Firestore listings
        </p>

        {/* Quick Template Chips */}
        <div className="mb-4">
          <label className="block text-[11px] text-slate-400 font-semibold mb-2">Preset Quick Test Commands</label>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTemplate('SURPLUS RICE 30KG 19:00')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-mono text-[11px]"
            >
              SURPLUS RICE 30KG 19:00
            </button>
            <button
              type="button"
              onClick={() => setTemplate('SURPLUS BREAD 15KG 18:30')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-mono text-[11px]"
            >
              SURPLUS BREAD 15KG 18:30
            </button>
            <button
              type="button"
              onClick={() => setTemplate('SURPLUS CURRY 25KG 21:00')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition font-mono text-[11px]"
            >
              SURPLUS CURRY 25KG 21:00
            </button>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">From: Sender Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#070B1E] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Incoming SMS Text Payload</label>
            <div className="relative">
              <input
                type="text"
                required
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
                className="w-full bg-[#070B1E] border border-slate-700 rounded-xl pl-3.5 pr-24 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
              >
                <Send className="w-3 h-3" />
                <span>Simulate</span>
              </button>
            </div>
          </div>

          {/* Result Output */}
          {result && (
            <div
              className={`p-3.5 rounded-2xl border text-xs ${
                result.success
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/80 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{result.success ? 'Twilio TwiML Confirmation Sent' : 'Validation Error'}</span>
              </div>
              <p className="font-mono text-[11px] leading-relaxed">{result.message}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
