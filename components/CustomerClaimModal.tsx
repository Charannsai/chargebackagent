'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dispute } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import {
  X,
  MessageSquareQuote,
  ArrowRight,
  ShieldAlert,
  Building2,
  User,
  Calendar,
  CreditCard,
  Truck,
} from 'lucide-react';

interface CustomerClaimModalProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerClaimModal({
  dispute,
  isOpen,
  onClose,
}: CustomerClaimModalProps) {
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dispute) return null;

  const handleNavigateToDispute = () => {
    onClose();
    router.push(`/disputes/${dispute.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal border border-charcoal-200 overflow-hidden z-10 animate-slide-up flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-charcoal-100 flex items-start justify-between bg-charcoal-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center shadow-sm">
              <MessageSquareQuote className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-charcoal-950">
                  Customer Claim Statement
                </h3>
                <span className="font-mono text-[11px] text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-md border border-charcoal-200">
                  {dispute.id}
                </span>
              </div>
              <p className="text-xs text-charcoal-500">
                Official statement filed with issuing bank / card scheme
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Dispute Context Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-charcoal-50 p-4 rounded-2xl border border-charcoal-200 text-xs">
            <div>
              <span className="text-[10.5px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Disputed Amount
              </span>
              <span className="font-mono font-bold text-charcoal-950 text-sm">
                {formatINR(dispute.amount)}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Cardholder
              </span>
              <span className="font-medium text-charcoal-900 truncate block">
                {dispute.customer_name}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Merchant
              </span>
              <span className="font-medium text-charcoal-900 truncate block">
                {dispute.merchant_name}
              </span>
            </div>

            <div>
              <span className="text-[10.5px] font-bold text-charcoal-400 uppercase tracking-wider block">
                Network &amp; Due
              </span>
              <span className="font-medium text-charcoal-900">
                {dispute.network} • {formatDate(dispute.due_date)}
              </span>
            </div>
          </div>

          {/* Full Customer Claim Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Cardholder Grievance Statement</span>
              </span>
              <span className="text-[11px] text-charcoal-400">
                Dispute Reason: {dispute.reason.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-lime-50/50 border border-lime-200/80 text-charcoal-800 text-sm leading-relaxed font-sans relative">
              <span className="text-2xl text-lime-600 font-serif leading-none absolute top-3 left-3 opacity-40">
                &ldquo;
              </span>
              <p className="pl-4 pr-1 text-charcoal-800 text-xs sm:text-sm font-medium">
                {dispute.customer_claim_statement ||
                  'Cardholder filed a dispute alleging non-receipt of merchandise or unauthorized transaction charge.'}
              </p>
            </div>
          </div>

          {/* Merchant Stated Fulfillment Record (if present) */}
          {dispute.merchant_fulfillment_note && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Merchant Fulfillment Telemetry Stated</span>
              </span>

              <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 text-xs text-charcoal-700 leading-relaxed font-sans">
                <p>{dispute.merchant_fulfillment_note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-charcoal-100 bg-charcoal-50/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleNavigateToDispute}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-charcoal-950 hover:bg-charcoal-800 text-white shadow-subtle hover:scale-[1.01] transition-all"
          >
            <span>Open Investigation Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
