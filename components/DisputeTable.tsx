'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dispute, DisputeStatus } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface DisputeTableProps {
  disputes: Dispute[];
  onSelectDispute?: (dispute: Dispute) => void;
  selectedDisputeId?: string;
  isLoading?: boolean;
}

export function DisputeTableSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden animate-fade-in">
      {/* Table Header Controls Skeleton */}
      <div className="p-4 sm:p-5 border-b border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs Skeleton */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="h-8 w-24 rounded-xl skeleton-shimmer shrink-0" />
          <div className="h-8 w-32 rounded-xl skeleton-shimmer shrink-0" />
          <div className="h-8 w-28 rounded-xl skeleton-shimmer shrink-0" />
          <div className="h-8 w-24 rounded-xl skeleton-shimmer shrink-0" />
          <div className="h-8 w-24 rounded-xl skeleton-shimmer shrink-0" />
        </div>

        {/* Search Input Skeleton */}
        <div className="h-8 w-full sm:w-72 rounded-xl skeleton-shimmer shrink-0" />
      </div>

      {/* Streamlined Skeleton Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-charcoal-50/60 border-b border-charcoal-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
              <th className="py-3.5 px-6">Dispute ID</th>
              <th className="py-3.5 px-4">Merchant &amp; Customer</th>
              <th className="py-3.5 px-4">Reason</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr key={i} className="hover:bg-charcoal-50/40 transition-colors">
                {/* Column 1: Dispute ID & Due Date */}
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 w-24 rounded-md skeleton-shimmer" />
                    <div className="h-2.5 w-16 rounded-md skeleton-shimmer" />
                  </div>
                </td>

                {/* Column 2: Merchant & Customer */}
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 w-32 rounded-md skeleton-shimmer" />
                    <div className="h-2.5 w-20 rounded-md skeleton-shimmer" />
                  </div>
                </td>

                {/* Column 3: Reason */}
                <td className="py-4 px-4">
                  <div
                    className="h-5 rounded-full skeleton-shimmer"
                    style={{
                      width:
                        i % 3 === 0
                          ? '140px'
                          : i % 3 === 1
                          ? '120px'
                          : '160px',
                    }}
                  />
                </td>

                {/* Column 4: Amount & Network */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-4 w-16 rounded-md skeleton-shimmer" />
                    <div className="h-4 w-10 rounded skeleton-shimmer" />
                  </div>
                </td>

                {/* Column 5: Status */}
                <td className="py-4 px-4">
                  <div className="h-6 w-28 rounded-full skeleton-shimmer" />
                </td>

                {/* Column 6: Action */}
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center justify-end gap-1 ml-auto">
                    <div className="h-3 w-8 rounded skeleton-shimmer" />
                    <div className="h-3.5 w-3.5 rounded skeleton-shimmer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DisputeTable({
  disputes,
  onSelectDispute,
  selectedDisputeId,
  isLoading,
}: DisputeTableProps) {
  if (isLoading) {
    return <DisputeTableSkeleton />;
  }
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const handleRowClick = (dispute: Dispute) => {
    if (onSelectDispute) {
      onSelectDispute(dispute);
    }
    router.push(`/disputes/${dispute.id}`);
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PENDING') return d.status === 'PENDING' || d.status === 'UNDER_INVESTIGATION';
    if (selectedFilter === 'REPRESENTED') return d.status === 'RESOLVED_REPRESENTED';
    if (selectedFilter === 'REFUNDED') return d.status === 'RESOLVED_REFUNDED';
    if (selectedFilter === 'ESCALATED') return d.status === 'ESCALATED';

    return true;
  });

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'RESOLVED_REPRESENTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Represented
          </span>
        );
      case 'RESOLVED_REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            Refund Accepted
          </span>
        );
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Escalated to Ops
          </span>
        );
      case 'UNDER_INVESTIGATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Ready for Sign-Off
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-700 border border-charcoal-200">
            <Clock className="w-3.5 h-3.5 text-charcoal-400" />
            Pending Action
          </span>
        );
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'PRODUCT_NOT_RECEIVED':
        return { label: 'Product Not Received', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'FRAUDULENT_TRANSACTION':
        return { label: 'Fraud / Unauthorized', color: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'SUBSCRIPTION_UNRECOGNIZED':
        return { label: 'Subscription Unrecognized', color: 'text-blue-800 bg-blue-50 border-blue-200' };
      default:
        return { label: reason.replace(/_/g, ' '), color: 'text-charcoal-800 bg-charcoal-50 border-charcoal-200' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'All Disputes' },
            { key: 'PENDING', label: 'Pending Action' },
            { key: 'REPRESENTED', label: 'Represented' },
            { key: 'REFUNDED', label: 'Refunded' },
            { key: 'ESCALATED', label: 'Escalated' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                selectedFilter === tab.key
                  ? 'bg-charcoal-950 text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dispute ID, customer, merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-charcoal-50 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:bg-white text-charcoal-950 placeholder-charcoal-400 transition-all"
          />
        </div>
      </div>

      {/* Streamlined, Minimal Disputes Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-charcoal-50/60 border-b border-charcoal-200 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
              <th className="py-3.5 px-6">Dispute ID</th>
              <th className="py-3.5 px-4">Merchant &amp; Customer</th>
              <th className="py-3.5 px-4">Reason</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 text-xs text-charcoal-800">
            {filteredDisputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-charcoal-400 text-sm">
                  No disputes found matching the selected filter.
                </td>
              </tr>
            ) : (
              filteredDisputes.map((dispute) => {
                const reasonInfo = getReasonLabel(dispute.reason);
                const isSelected = selectedDisputeId === dispute.id;

                return (
                  <tr
                    key={dispute.id}
                    onClick={() => handleRowClick(dispute)}
                    className={`cursor-pointer hover:bg-charcoal-50/80 transition-colors group ${
                      isSelected ? 'bg-lime-50/40' : ''
                    }`}
                  >
                    {/* Column 1: Dispute ID & Due Date */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-semibold text-charcoal-950 text-xs group-hover:text-lime-700 transition-colors">
                          {dispute.id}
                        </span>
                        <span className="text-[11px] text-charcoal-400">
                          Due {formatDate(dispute.due_date)}
                        </span>
                      </div>
                    </td>

                    {/* Column 2: Merchant & Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-charcoal-900">
                          {dispute.merchant_name}
                        </span>
                        <span className="text-charcoal-500 text-[11px]">
                          {dispute.customer_name}
                        </span>
                      </div>
                    </td>

                    {/* Column 3: Reason */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${reasonInfo.color}`}
                      >
                        {reasonInfo.label}
                      </span>
                    </td>

                    {/* Column 4: Amount & Network */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-charcoal-950 text-sm font-mono">
                          {formatINR(dispute.amount)}
                        </span>
                        <span className="text-[10.5px] font-medium text-charcoal-500 bg-charcoal-100 px-1.5 py-0.5 rounded border border-charcoal-200">
                          {dispute.network}
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(dispute.status)}
                    </td>

                    {/* Column 6: Action */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-500 group-hover:text-charcoal-950 transition-colors">
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-charcoal-950 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
