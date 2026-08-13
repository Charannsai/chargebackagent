'use client';

import React from 'react';
import { Dispute } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { ShieldAlert, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MetricsBarProps {
  disputes: Dispute[];
  isLoading?: boolean;
}

export function MetricsBarSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-subtle flex items-center justify-between animate-fade-in"
        >
          <div className="space-y-2 w-full pr-3">
            <div className="h-2.5 w-24 rounded-md skeleton-shimmer" />
            <div className="h-6 w-32 rounded-lg skeleton-shimmer" />
            <div className="h-2.5 w-20 rounded-md skeleton-shimmer" />
          </div>
          <div className="w-9 h-9 rounded-xl skeleton-shimmer shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function MetricsBar({ disputes, isLoading }: MetricsBarProps) {
  if (isLoading) {
    return <MetricsBarSkeleton />;
  }

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Metric 1: Total In Dispute */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10.5px] font-bold text-charcoal-500 uppercase tracking-wider">
            Total In Dispute
          </p>
          <p className="text-xl font-bold text-charcoal-950 font-mono tracking-tight">
            {formatINR(totalAmount)}
          </p>
          <p className="text-[11px] text-charcoal-400">
            {totalCount} active cases
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <ShieldAlert className="w-4 h-4 text-charcoal-600" />
        </div>
      </div>

      {/* Metric 2: Pending Review */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10.5px] font-bold text-charcoal-500 uppercase tracking-wider">
            Pending Review
          </p>
          <p className="text-xl font-bold text-charcoal-950 font-mono tracking-tight">
            {pendingCount}
          </p>
          <p className="text-[11px] text-charcoal-400">
            {pendingCount === 0
              ? 'All cases resolved'
              : `${pendingCount} awaiting triage`}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-center text-amber-700">
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
      </div>

      {/* Metric 3: Defended Volume */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10.5px] font-bold text-charcoal-500 uppercase tracking-wider">
            Defended Volume
          </p>
          <p className="text-xl font-bold text-charcoal-950 font-mono tracking-tight">
            {formatINR(defendedAmount)}
          </p>
          <p className="text-[11px] text-charcoal-400">
            {representedCount === 0
              ? '0 representments'
              : `${representedCount} case${representedCount > 1 ? 's' : ''} defended`}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700">
          <ShieldCheck className="w-4 h-4 text-lime-600" />
        </div>
      </div>

      {/* Metric 4: Resolved Queue */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10.5px] font-bold text-charcoal-500 uppercase tracking-wider">
            Resolved Queue
          </p>
          <p className="text-xl font-bold text-charcoal-950 font-mono tracking-tight">
            {resolvedCount} / {totalCount}
          </p>
          <p className="text-[11px] text-charcoal-400">
            {resolvedCount === 0
              ? '0% processed'
              : `${resolutionPercentage}% processed (${representedCount} rep · ${refundedCount} ref)`}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center text-charcoal-700">
          <CheckCircle2 className="w-4 h-4 text-charcoal-600" />
        </div>
      </div>
    </div>
  );
}


