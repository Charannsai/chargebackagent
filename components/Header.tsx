'use client';

import React from 'react';
import { ShieldCheck, Cpu, Plus, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  engineMode: 'groq' | 'demo';
  setEngineMode: (mode: 'groq' | 'demo') => void;
  isGroqConfigured: boolean;
  onOpenCreateModal: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

export function Header({
  engineMode,
  setEngineMode,
  isGroqConfigured,
  onOpenCreateModal,
  onResetData,
  isResetting,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-charcoal-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-charcoal-950 flex items-center justify-center text-white shadow-sm ring-1 ring-charcoal-800">
            <ShieldCheck className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-charcoal-950 text-base tracking-tight">
                Razorpay <span className="font-normal text-charcoal-500">Agentic Chargeback Resolver</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-lime-50 text-lime-800 border border-lime-200">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></span>
                Autonomous Agent
              </span>
            </div>
            <p className="text-xs text-charcoal-500 hidden sm:block">
              AI Risk & Operations Specialist • Real-time Decision Trace & Representment Engine
            </p>
          </div>
        </div>

        {/* Action Controls & AI Engine Selector */}
        <div className="flex items-center gap-3">
          {/* Engine Selector */}
          <div className="flex items-center bg-charcoal-100/80 p-0.5 rounded-lg border border-charcoal-200 text-xs">
            <button
              onClick={() => setEngineMode('groq')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                engineMode === 'groq'
                  ? 'bg-white text-charcoal-950 shadow-sm border border-charcoal-200'
                  : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
              title={
                isGroqConfigured
                  ? 'Active: Llama 3.3 70B Versatile via Groq'
                  : 'Groq API Key (Auto-fallback to demo simulation if key absent)'
              }
            >
              <Cpu className="w-3.5 h-3.5 text-lime-600" />
              <span className="hidden md:inline">Groq / Llama 3.3 70B</span>
              <span className="md:hidden">Groq AI</span>
              {isGroqConfigured && (
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500" title="API Key Connected" />
              )}
            </button>
            <button
              onClick={() => setEngineMode('demo')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all ${
                engineMode === 'demo'
                  ? 'bg-white text-charcoal-950 shadow-sm border border-charcoal-200'
                  : 'text-charcoal-600 hover:text-charcoal-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Demo Mode</span>
            </button>
          </div>

          {/* Reset Seed Data */}
          <button
            onClick={onResetData}
            disabled={isResetting}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:text-charcoal-950 bg-white border border-charcoal-200 hover:border-charcoal-300 transition-colors shadow-subtle disabled:opacity-50"
            title="Reset dataset to default 4 case studies"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>

          {/* Simulate Custom Dispute Webhook */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-charcoal-950 hover:bg-charcoal-800 text-white shadow-sm transition-all hover:ring-2 hover:ring-lime-400/40"
          >
            <Plus className="w-3.5 h-3.5 text-lime-400" />
            <span>Simulate Dispute</span>
          </button>
        </div>
      </div>
    </header>
  );
}
