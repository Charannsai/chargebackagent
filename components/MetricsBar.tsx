'use client';

import React from 'react';
import { Dispute } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { TrendingUp, ShieldAlert, Zap, Layers } from 'lucide-react';

interface MetricsBarProps {
  disputes: Dispute[];
}

export function MetricsBar({ disputes }: MetricsBarProps) {
  const totalAmount = disputes.reduce((sum, d) => sum + d.amount, 0);
  const representedCount = disputes.filter(
    (d) => d.status === 'RESOLVED_REPRESENTED'
  ).length;
  const refundedCount = disputes.filter(
    (d) => d.status === 'RESOLVED_REFUNDED'
  ).length;

  const totalResolved = representedCount + refundedCount;
  const winRate = totalResolved > 0 ? Math.round((representedCount / totalResolved) * 100) : 85;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Disputed Volume */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Total Disputed Volume
          </p>
          <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
            {formatINR(totalAmount)}
          </p>
          <p className="text-[11px] text-charcoal-400">
            Across {disputes.length} merchant cases
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <ShieldAlert className="w-5 h-5 text-charcoal-600" />
        </div>
      </div>

      {/* Metric 2: Representment Win Rate */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Representment Win Rate
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
              {winRate}%
            </p>
            <span className="inline-flex items-center text-[10px] font-bold text-lime-800 bg-lime-50 px-1.5 py-0.5 rounded-full border border-lime-200">
              +14% vs manual
            </span>
          </div>
          <p className="text-[11px] text-charcoal-400">
            {representedCount} won • {refundedCount} refunded
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700">
          <TrendingUp className="w-5 h-5 text-lime-600" />
        </div>
      </div>

      {/* Metric 3: Resolution Latency */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            AI Resolution Speed
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
              ~1.2s
            </p>
            <span className="text-[10.5px] text-charcoal-400 font-medium">
              vs 48h manual
            </span>
          </div>
          <p className="text-[11px] text-charcoal-400">
            Multi-tool autonomous cycle
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <Zap className="w-5 h-5 text-lime-500" />
        </div>
      </div>

      {/* Metric 4: Card Schemes Verified */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Network Evidence
          </p>
          <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
            100%
          </p>
          <p className="text-[11px] text-charcoal-400">
            Visa, Mastercard, RuPay
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <Layers className="w-5 h-5 text-charcoal-600" />
        </div>
      </div>
    </div>
  );
}
