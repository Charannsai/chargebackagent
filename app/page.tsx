'use client';

import React, { useState, useEffect } from 'react';
import { Dispute } from '@/lib/types';
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { DisputeTable } from '@/components/DisputeTable';
import { AuditTrailModal } from '@/components/AuditTrailModal';
import { CreateDisputeModal } from '@/components/CreateDisputeModal';
import { Mail } from 'lucide-react';

export default function Home() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [auditDispute, setAuditDispute] = useState<Dispute | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load disputes
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/disputes');
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Sleek Borderless Header */}
      <Header
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
        {/* Clean Minimal Page Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-950 tracking-tight">
              Dispute Operations
            </h2>
            <p className="text-xs text-charcoal-500">
              Autonomous chargeback triage, evidence synthesis, and representment defense
            </p>
          </div>
          <div className="text-[11px] font-mono text-charcoal-600 bg-white px-3 py-1.5 rounded-xl border border-charcoal-200 shadow-subtle self-start sm:self-auto">
            Rails: UPI (UDIR) • Visa • Mastercard • RuPay
          </div>
        </div>

        {/* Clean, Compact KPI Metrics Bar */}
        <MetricsBar disputes={disputes} isLoading={isLoading} />

        {/* Dispute Operations Queue Table */}
        <div className="space-y-3 pt-1">
          <DisputeTable disputes={disputes} isLoading={isLoading} />
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
