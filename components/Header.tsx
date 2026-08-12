'use client';

import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export function Header({ onOpenCreateModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-charcoal-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-charcoal-950 flex items-center justify-center text-white shadow-sm ring-1 ring-charcoal-800">
            <ShieldCheck className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-charcoal-950 text-base tracking-tight">
                Razorpay <span className="font-normal text-charcoal-500">Chargeback Resolver</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-lime-50 text-lime-800 border border-lime-200">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></span>
                Autonomous Agent
              </span>
            </div>
            <p className="text-xs text-charcoal-500 hidden sm:block">
              AI Risk & Operations Specialist • Autonomous Representment Engine
            </p>
          </div>
        </div>

        {/* Action: Simulate Custom Dispute */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal-950 hover:bg-charcoal-800 text-white shadow-sm transition-all hover:ring-2 hover:ring-lime-400/40 hover:scale-[1.01]"
          >
            <Plus className="w-3.5 h-3.5 text-lime-400" />
            <span>Simulate Dispute</span>
          </button>
        </div>
      </div>
    </header>
  );
}
