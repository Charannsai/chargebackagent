'use client';

import React, { useState, useEffect } from 'react';
import { Dispute } from '@/lib/types';
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { DisputeTable } from '@/components/DisputeTable';
import { DisputeDetailView } from '@/components/DisputeDetailView';
import { AuditTrailModal } from '@/components/AuditTrailModal';
import { CreateDisputeModal } from '@/components/CreateDisputeModal';
import { ArrowUpRight, Sparkles, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function Home() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [engineMode, setEngineMode] = useState<'groq' | 'demo'>('groq');
  const [isGroqConfigured, setIsGroqConfigured] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [auditDispute, setAuditDispute] = useState<Dispute | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Initial load & health
  useEffect(() => {
    fetchHealth();
    fetchDisputes();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setIsGroqConfigured(data.groq_configured);
        if (!data.groq_configured) {
          setEngineMode('demo');
        }
      }
    } catch {
      setEngineMode('demo');
    }
  };

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/disputes');
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
        // Refresh active selected dispute if open
        if (selectedDispute) {
          const updated = (data.disputes || []).find((d: Dispute) => d.id === selectedDispute.id);
          if (updated) setSelectedDispute(updated);
        }
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
        setSelectedDispute(null);
      }
    } catch (err) {
      console.error('Failed to reset data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Top Navigation */}
      <Header
        engineMode={engineMode}
        setEngineMode={setEngineMode}
        isGroqConfigured={isGroqConfigured}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ==================================================== */}
        {/* HERO SECTION: Calm, Minimalist Overview & Benchmarks */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-950 text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                <span>AUTONOMOUS RISK SPECIALIST</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-950 tracking-tight">
                Razorpay Agentic Chargeback Resolver
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Autonomous risk-and-operations AI agent that investigates payment disputes. Select any dispute to inspect gateway authorization, courier telemetry signatures, customer risk flags, and run autonomous representment investigations.
              </p>
            </div>

            {/* Active AI Status Pill */}
            <div className="bg-charcoal-50 p-4 rounded-2xl border border-charcoal-200/80 flex flex-col gap-1.5 min-w-[240px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
                Active Intelligence
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-lime-500 shadow-lime-glow-sm"></div>
                <span className="text-xs font-bold text-charcoal-900">
                  {engineMode === 'groq' ? 'Groq / Llama 3.3 70B' : 'Deterministic Operations Simulator'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-500">
                Autonomous Dynamic Tool Loop
              </p>
            </div>
          </div>

          {/* Quick Scenario Showcase Cards */}
          <div className="mt-6 pt-5 border-t border-charcoal-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                <div
                  key={caseItem.id}
                  onClick={() => setSelectedDispute(caseItem)}
                  className="group p-3.5 rounded-2xl bg-charcoal-50/70 hover:bg-lime-50/50 border border-charcoal-200 hover:border-lime-300 transition-all cursor-pointer shadow-subtle flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-charcoal-900 group-hover:text-charcoal-950">
                        {caseLabel}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-lime-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-[11px] text-charcoal-500 truncate">
                      {caseItem.merchant_name}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-charcoal-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold font-mono text-charcoal-950">
                      {formatINR(caseItem.amount)}
                    </span>
                    <span className="text-charcoal-500 font-medium">
                      {expectedAction}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* High-Level KPI Metrics Bar */}
        <MetricsBar disputes={disputes} />

        {/* Dispute Operations Queue Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-charcoal-950 tracking-tight">
                Dispute Operations Queue
              </h3>
              <p className="text-xs text-charcoal-500">
                Click any dispute row to open full transaction facts, courier telemetry, and run the AI Resolver.
              </p>
            </div>
          </div>

          <DisputeTable
            disputes={disputes}
            onSelectDispute={(dispute) => setSelectedDispute(dispute)}
            selectedDisputeId={selectedDispute?.id}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-charcoal-200 py-6 mt-12 text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-charcoal-900">
              Razorpay Agentic Chargeback Resolver
            </span>
            <span>•</span>
            <span>Authored by Charan Sai Pathuri (AI Builder Target Role)</span>
          </div>
          <div className="flex items-center gap-4 text-charcoal-400 font-mono text-[11px]">
            <span>Groq Llama 3.3 70B</span>
            <span>•</span>
            <span>Autonomous State Machine</span>
            <span>•</span>
            <span>Inter & JetBrains Mono</span>
          </div>
        </div>
      </footer>

      {/* Flagship Dispute Detail View Drawer */}
      <DisputeDetailView
        dispute={selectedDispute}
        isOpen={Boolean(selectedDispute)}
        onClose={() => setSelectedDispute(null)}
        engineMode={engineMode}
        onRunComplete={fetchDisputes}
        onViewAudit={(d) => setAuditDispute(d)}
      />

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
