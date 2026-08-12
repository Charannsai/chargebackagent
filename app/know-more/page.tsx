'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import {
  ArrowLeft,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  Mail,
  Check,
  FileText,
  CreditCard,
  Truck,
  User,
} from 'lucide-react';

export default function KnowMorePage() {
  const [activeTab, setActiveTab] = useState<'value' | 'how' | 'architecture'>('value');

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Floating Borderless Header */}
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-all shadow-subtle group"
          >
            <ArrowLeft className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-950 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Clean Hero Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
            Razorpay Chargeback Resolver
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-2xl">
            An autonomous AI risk specialist that unifies gateway payment telemetry, courier proof of delivery, and customer risk profiling to investigate disputes and assemble verifiable representment packages.
          </p>
        </div>

        {/* Minimal Tab Switcher */}
        <div className="bg-white rounded-2xl p-1.5 border border-charcoal-200 shadow-subtle flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('value')}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'value'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            Why it Matters
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'how'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            How it Works
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-2 px-4 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'architecture'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            Architecture
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: WHY IT MATTERS                                */}
        {/* ==================================================== */}
        {activeTab === 'value' && (
          <div className="space-y-4 animate-fade-in">
            {/* Value Item 1 */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-charcoal-950 text-lime-400 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-charcoal-950">
                  Solves a Real, High-Cost Payment Problem
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed pl-8">
                Payment disputes and friendly fraud cause major financial and operational losses for merchants. This agent directly impacts the bottom line by recovering legitimate revenue, eliminating chargeback penalties, and resolving disputes within network deadlines.
              </p>
            </div>

            {/* Value Item 2 */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-charcoal-950 text-lime-400 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-charcoal-950">
                  Built from First Principles (No Framework Wrappers)
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed pl-8">
                Rather than relying on generic chatbot wrappers, this resolver is engineered with a native autonomous state-machine loop and JSON-schema tool calling in TypeScript, ensuring deterministic, production-grade output control.
              </p>
            </div>

            {/* Value Item 3 */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-charcoal-950 text-lime-400 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-charcoal-950">
                  Transparent &quot;Glass-Box&quot; Operational Trust
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed pl-8">
                In fintech compliance, opaque AI cannot be trusted. The live decision trace logs every tool call, latency metric, and evidence signal in real time, keeping human operators in full control with mandatory sign-offs and overrides.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: HOW IT WORKS                                  */}
        {/* ==================================================== */}
        {activeTab === 'how' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-charcoal-950 uppercase tracking-wider">
                Autonomous 4-Step Resolution Lifecycle
              </h3>

              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-charcoal-950 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-charcoal-900 text-xs">Dispute Intake</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Select any dispute from the queue to view the cardholder&apos;s stated bank claim against merchant fulfillment records.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-lime-500 text-charcoal-950 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-charcoal-900 text-xs">Autonomous Tool Loop</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Click &quot;Start AI Resolution&quot;. The agent dynamically queries 3DS authentication logs, verifies BlueDart/Delhivery OTP signatures, and inspects buyer fraud risk scores.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-charcoal-950 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-charcoal-900 text-xs">Evidence Synthesis</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The agent scores evidence strength, checks corroborating signals, and drafts a formal representment rebuttal letter aligned with card network rules.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-charcoal-950 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    4
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-charcoal-900 text-xs">Human Sign-Off</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The dispute remains pending until the operator clicks &quot;Approve &amp; Submit&quot; or uses &quot;Override Verdict&quot; with custom notes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ARCHITECTURE & DISCLAIMER                     */}
        {/* ==================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 animate-fade-in">
            {/* Prototype Note */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-600" />
                <h4 className="font-bold text-charcoal-950 text-xs uppercase tracking-wider">
                  Interactive Prototype vs. Production Deployment
                </h4>
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                This working prototype demonstrates the full autonomous reasoning loop and streaming UI using curated benchmark telemetry and live Groq LLM tool calling.
              </p>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                In an enterprise production deployment at Razorpay scale, the agent connects directly to real-time gateway webhooks, courier REST APIs (BlueDart, Delhivery, Shadowfax), internal merchant CRM microservices, and card network representment APIs (Visa VROL, Mastercard MasterCom, RuPay DMS).
              </p>
            </div>

            {/* Technical Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-1">
                <span className="font-bold text-charcoal-900 block">LLM Reasoning</span>
                <p className="text-charcoal-500">
                  Groq / Llama 3.3 70B Versatile delivering deterministic JSON-schema tool execution with sub-second latency.
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-1">
                <span className="font-bold text-charcoal-900 block">Immutable Audit Trail</span>
                <p className="text-charcoal-500">
                  PostgreSQL schema logging every decision step, tool output, and operator review for compliance auditability.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full bg-white border-t border-charcoal-100 py-6 mt-12 text-xs text-charcoal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
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
    </div>
  );
}
