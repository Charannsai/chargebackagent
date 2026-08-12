'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export function Header({ onOpenCreateModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full pointer-events-none">
      {/* Background layer with continuous smooth bottom fade */}
      <div className="absolute inset-0 h-28 bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] backdrop-blur-[6px]" />

      {/* Navbar Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between pointer-events-auto">
        {/* Brand & Identity: Clean Typography */}
        <div className="flex flex-col">
          <h1 className="font-extrabold text-charcoal-950 text-lg sm:text-xl tracking-tight font-sans">
            Razorpay <span className="font-light text-charcoal-400">Chargeback Resolver</span>
          </h1>
          <p className="text-[11px] text-charcoal-500 hidden sm:block tracking-wide">
            Autonomous Risk & Dispute Operations Intelligence
          </p>
        </div>

        {/* Action: Simulate Custom Dispute */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-charcoal-950 hover:bg-charcoal-800 text-white shadow-subtle transition-all hover:ring-2 hover:ring-lime-400/30 hover:scale-[1.01]"
          >
            <Plus className="w-3.5 h-3.5 text-lime-400" />
            <span>Simulate Dispute</span>
          </button>
        </div>
      </div>
    </header>
  );
}
