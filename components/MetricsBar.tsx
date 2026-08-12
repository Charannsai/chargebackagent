'use client';

import React from 'react';
import { Dispute } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { ShieldAlert, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MetricsBarProps {
  disputes: Dispute[];
}

export function MetricsBar({ disputes }: MetricsBarProps) {
  const totalAmount = disputes.reduce((sum, d) => sum + d.amount, 0);

  const pendingCount = disputes.filter(
    (d) => d.status === 'PENDING' || d.status === 'UNDER_INVESTIGATION'
  ).length;

  const representedDisputes = disputes.filter(
    (d) => d.status === 'RESOLVED_REPRESENTED'
  );
  const defendedAmount = representedDisputes.reduce(
    (sum, d) => sum + d.amount,
    0
  );
  const representedCount = representedDisputes.length;

  const refundedCount = disputes.filter(
    (d) => d.status === 'RESOLVED_REFUNDED'
  ).length;

  const escalatedCount = disputes.filter(
    (d) => d.status === 'ESCALATED'
  ).length;

  const resolvedCount = representedCount + refundedCount + escalatedCount;
  const totalCount = disputes.length;
  const resolutionPercentage =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total In Dispute */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Total In Dispute
          </p>
          <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
            {formatINR(totalAmount)}
          </p>
          <p className="text-xs text-charcoal-500">
            {totalCount} active merchant cases
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <ShieldAlert className="w-5 h-5 text-charcoal-600" />
        </div>
      </div>

      {/* Metric 2: Pending Review */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
            {pendingCount}
          </p>
          <p className="text-xs text-charcoal-500">
            {pendingCount === 0
              ? 'All cases resolved'
              : `${pendingCount} awaiting decision`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-center text-amber-700">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Metric 3: Defended Volume */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Defended Volume
          </p>
          <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
            {formatINR(defendedAmount)}
          </p>
          <p className="text-xs text-charcoal-500">
            {representedCount === 0
              ? '0 representments filed'
              : `${representedCount} case${representedCount > 1 ? 's' : ''} represented`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700">
          <ShieldCheck className="w-5 h-5 text-lime-600" />
        </div>
      </div>

      {/* Metric 4: Resolved Queue */}
      <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
            Resolved Queue
          </p>
          <p className="text-2xl font-extrabold text-charcoal-950 font-mono tracking-tight">
            {resolvedCount} / {totalCount}
          </p>
          <p className="text-xs text-charcoal-500">
            {resolvedCount === 0
              ? '0% processed'
              : `${resolutionPercentage}% processed (${representedCount} rep · ${refundedCount} ref)`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <CheckCircle2 className="w-5 h-5 text-charcoal-600" />
        </div>
      </div>
    </div>
  );
}

