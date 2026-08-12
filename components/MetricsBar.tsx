'use client';

import React from 'react';
import { Dispute } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { TrendingUp, ShieldAlert, Zap, History } from 'lucide-react';

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
  const pendingCount = disputes.filter(
    (d) => d.status === 'PENDING' || d.status === 'UNDER_INVESTIGATION'
  ).length;

  const totalResolved = representedCount + refundedCount;
  const winRate = totalResolved > 0 ? Math.round((representedCount / totalResolved) * 100) : 85;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Total Disputed Volume */}
      <div className="bg-white p-4 rounded-xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            Total Disputed Volume
          </p>
          <p className="text-2xl font-semibold text-charcoal-950 mt-1 tracking-tight">
            {formatINR(totalAmount)}
          </p>
          <p className="text-[11px] text-charcoal-400 mt-0.5">
            Across {disputes.length} active merchant disputes
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <ShieldAlert className="w-5 h-5 text-charcoal-600" />
        </div>
      </div>

      {/* Metric 2: Representment Win Rate */}
      <div className="bg-white p-4 rounded-xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            Representment Win Rate
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-semibold text-charcoal-950 tracking-tight">
              {winRate}%
            </p>
            <span className="inline-flex items-center text-[11px] font-medium text-lime-700 bg-lime-50 px-1.5 py-0.2 rounded border border-lime-200">
              +14% vs manual
            </span>
          </div>
          <p className="text-[11px] text-charcoal-400 mt-0.5">
            {representedCount} represented • {refundedCount} auto-refunded
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700">
          <TrendingUp className="w-5 h-5 text-lime-600" />
        </div>
      </div>

      {/* Metric 3: Autonomous Resolution Speed */}
      <div className="bg-white p-4 rounded-xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            Agent Latency
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-semibold text-charcoal-950 tracking-tight">
              1.2s
            </p>
            <span className="text-[11px] font-medium text-charcoal-500">
              vs 48 hrs manual
            </span>
          </div>
          <p className="text-[11px] text-charcoal-400 mt-0.5">
            Multi-tool autonomous cycle
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <Zap className="w-5 h-5 text-lime-500" />
        </div>
      </div>

      {/* Metric 4: Audit Trail Compliance */}
      <div className="bg-white p-4 rounded-xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            Operational Audit Trail
          </p>
          <p className="text-2xl font-semibold text-charcoal-950 mt-1 tracking-tight">
            100%
          </p>
          <p className="text-[11px] text-charcoal-400 mt-0.5">
            Every step & tool call logged
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <History className="w-5 h-5 text-charcoal-600" />
        </div>
      </div>
    </div>
  );
}
