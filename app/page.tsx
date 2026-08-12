'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dispute } from '@/lib/types';
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { DisputeTable } from '@/components/DisputeTable';
import { AuditTrailModal } from '@/components/AuditTrailModal';
import { CreateDisputeModal } from '@/components/CreateDisputeModal';
import { ArrowUpRight, Mail, Info, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function Home() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditDispute, setAuditDispute] = useState<Dispute | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isResetting, setIsResetting] = useState(false);

  // Load disputes
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/disputes');
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      if (res.ok) {
        await fetchDisputes();
      }
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Sleek Borderless Header */}
      <Header
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Minimalist Hero Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-950 text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              <span>AUTONOMOUS OPERATIONS BENCHMARK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
              Autonomous Chargeback Resolution
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Autonomous AI specialist that investigates payment disputes. Select any dispute to inspect gateway authorization, courier telemetry signatures, customer risk flags, and trigger representment investigations.
            </p>
          </div>

          {/* Quick Preset Scenarios */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
            <div className="bg-charcoal-50 p-4 rounded-2xl border border-charcoal-200 text-charcoal-700 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                Supported Payment Rails &amp; Schemes
              </span>
              <p className="text-xs font-semibold text-charcoal-900 font-mono">
                UPI (NPCI UDIR) • Visa • Mastercard • RuPay • AutoPay Mandates
              </p>
            </div>
          </div>
        </div>

        {/* Clean KPI Metrics */}
        <MetricsBar disputes={disputes} />

        {/* Quick Benchmark Cases Row */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 relative group">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                Benchmark Test Cases
              </span>

              <div className="relative inline-flex items-center">
                <button
                  type="button"
                  className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors cursor-help"
                  aria-label="Benchmark Information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Hover Tooltip Popover */}
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-40 w-72 sm:w-80 p-3.5 rounded-2xl bg-charcoal-950 text-white shadow-2xl border border-charcoal-800 text-xs space-y-2 animate-slide-up pointer-events-auto">
                  <p className="text-charcoal-300 leading-relaxed text-[11.5px]">
                    These benchmark test cases represent simulated chargeback scenarios filed by cardholders across diverse dispute reason codes (friendly fraud, account takeover, courier delays, and subscription billing) with synthetic gateway, carrier, and risk telemetry.
                  </p>
                  <Link
                    href="/know-more"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-lime-400 hover:text-lime-300 underline pt-1 transition-colors"
                  >
                    <span>To know more, visit architecture guide</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {disputes.slice(0, 4).map((caseItem, idx) => {
              const caseLabel =
                idx === 0
                  ? 'Case 1: Friendly Fraud'
                  : idx === 1
                  ? 'Case 2: Account Takeover'
                  : idx === 2
                  ? 'Case 3: Courier Delay'
                  : 'Case 4: SaaS Subscription';

              const expectedAction =
                idx === 0
                  ? 'Represent (Reject Claim)'
                  : idx === 1
                  ? 'Accept Full Refund'
                  : idx === 2
                  ? 'Escalate to Ops'
                  : 'Represent';

              return (
                <Link
                  key={caseItem.id}
                  href={`/disputes/${caseItem.id}`}
                  className="group p-4 rounded-2xl bg-white hover:bg-lime-50/40 border border-charcoal-200 hover:border-lime-300 transition-all cursor-pointer shadow-subtle flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-charcoal-900 group-hover:text-charcoal-950">
                        {caseLabel}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-charcoal-400 group-hover:text-lime-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-[11px] text-charcoal-500 truncate">
                      {caseItem.merchant_name}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-charcoal-100 flex items-center justify-between text-[11px]">
                    <span className="font-bold font-mono text-charcoal-950 text-xs">
                      {formatINR(caseItem.amount)}
                    </span>
                    <span className="text-charcoal-500 font-medium">
                      {expectedAction}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dispute Operations Queue Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal-900">
              Dispute Operations Queue
            </h3>
          </div>

          <DisputeTable
            disputes={disputes}
          />
        </div>
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full bg-white border-t border-charcoal-100 py-6 mt-12 text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-charcoal-900">
              Razorpay Chargeback Resolver
            </span>
            <span>•</span>
            <span>Autonomous Risk Operations</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <span>Built by</span>
            <a
              href="mailto:pathurisai31@gmail.com"
              className="font-bold text-charcoal-950 hover:text-lime-700 underline inline-flex items-center gap-1 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Charan Sai</span>
            </a>
            <span className="text-charcoal-400">(pathurisai31@gmail.com)</span>
          </div>
        </div>
      </footer>

      {/* Immutable Operational Audit Trail Modal */}
      <AuditTrailModal
        dispute={auditDispute}
        isOpen={Boolean(auditDispute)}
        onClose={() => setAuditDispute(null)}
      />

      {/* Inbound Dispute Webhook Simulator Modal */}
      <CreateDisputeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchDisputes}
      />
    </div>
  );
}
