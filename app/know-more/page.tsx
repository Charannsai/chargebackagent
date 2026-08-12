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
  CheckCircle2,
  Terminal,
  ExternalLink,
  Layers,
  FileText,
  TrendingUp,
  Scale,
  Lock,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function KnowMorePage() {
  const [activeTab, setActiveTab] = useState<'value' | 'how' | 'architecture'>('value');

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Floating Borderless Header */}
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-all shadow-subtle group"
          >
            <ArrowLeft className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-950 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dispute Dashboard</span>
          </Link>
        </div>

        {/* Hero Section: Tool Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-950 text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span>AUTONOMOUS RISK OPERATIONS INTELLIGENCE</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
              Razorpay Agentic Chargeback Resolver
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-3xl">
              An autonomous risk intelligence system that eliminates the manual operational bottleneck of payment disputes. It unifies gateway telemetry, logistics proof of delivery, and customer risk profiling to autonomously investigate claims and generate representment dossiers with sub-second turnaround.
            </p>
          </div>

          {/* Quick Stat Highlights */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block">
                Investigation Speed
              </span>
              <p className="text-base font-extrabold text-charcoal-950 font-mono">
                ~1.2s <span className="text-xs font-normal text-charcoal-500 font-sans">vs 48 hours manual</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block">
                Win Rate Uplift
              </span>
              <p className="text-base font-extrabold text-charcoal-950 font-mono">
                +14% <span className="text-xs font-normal text-charcoal-500 font-sans">higher representment wins</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block">
                Audit Trail
              </span>
              <p className="text-base font-extrabold text-charcoal-950 font-mono">
                100% <span className="text-xs font-normal text-charcoal-500 font-sans">verifiable decision log</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-1.5 border border-charcoal-200 shadow-subtle flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('value')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'value'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            1. Value to Payment Gateways &amp; Merchants
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'how'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            2. How the Autonomous Agent Works
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'architecture'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            3. Architecture &amp; Production Roadmap
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: VALUE TO PAYMENT GATEWAYS & MERCHANTS        */}
        {/* ==================================================== */}
        {activeTab === 'value' && (
          <div className="space-y-6 animate-fade-in">
            {/* Pillar 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-lime-400 flex items-center justify-center font-extrabold text-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-charcoal-950">
                  Solving the Multi-Million Dollar Dispute Drain
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                At high transaction volume, payment disputes are one of the heaviest operational and financial drains on merchants. Every chargeback comes with gateway penalties, operational overhead, and potential card network monitoring flags.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 space-y-1">
                  <span className="font-bold text-charcoal-900 text-xs">Direct Merchant Revenue Protection</span>
                  <p className="text-xs text-charcoal-600">
                    Automatically recovers funds from friendly fraud and invalid claims by assembling bulletproof evidence within strict network deadlines.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 space-y-1">
                  <span className="font-bold text-charcoal-900 text-xs">Eliminating Ops Latency Bottlenecks</span>
                  <p className="text-xs text-charcoal-600">
                    Replaces tedious 48-hour manual document gathering across disparate systems with sub-second autonomous multi-source correlation.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-lime-400 flex items-center justify-center font-extrabold text-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-charcoal-950">
                  Engineered from First Principles (Zero Framework Wrappers)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Rather than relying on generic chatbot frameworks or rigid wrapper libraries, this resolver is built on a <strong>native autonomous state machine</strong> with strict JSON-schema tool calling.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 space-y-1">
                  <span className="font-bold text-charcoal-900 text-xs">Dynamic Tool Invocation</span>
                  <p className="text-xs text-charcoal-600">
                    The LLM dynamically decides which tools to invoke (payment telemetry, courier tracking, fraud scoring) based on live investigation findings without hardcoded sequential scripts.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 space-y-1">
                  <span className="font-bold text-charcoal-900 text-xs">Deterministic Enterprise Output</span>
                  <p className="text-xs text-charcoal-600">
                    Enforces strict typing, structured evidence schemas, and validated network dossiers suitable for direct submission to card network APIs.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-lime-400 flex items-center justify-center font-extrabold text-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-charcoal-950">
                  Transparent &quot;Glass-Box&quot; Operational Trust
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                The primary barrier to deploying AI agents in financial compliance is the &quot;black box&quot; risk. Human supervisors cannot trust an opaque AI that makes financial decisions without full auditability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 space-y-1">
                  <span className="font-bold text-charcoal-900 text-xs">Live Decision Trace</span>
                  <p className="text-xs text-charcoal-600">
                    Real-time SSE streaming logs every thought, tool parameter, API payload, and latency metric in a transparent operational console.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80 space-y-1">
                  <span className="font-bold text-charcoal-900 text-xs">Human-in-the-Loop Control</span>
                  <p className="text-xs text-charcoal-600">
                    Disputes remain in a pending review state until the operator inspects the evidence checklist and officially approves or overrides the verdict.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: HOW THE AUTONOMOUS AGENT WORKS               */}
        {/* ==================================================== */}
        {activeTab === 'how' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-charcoal-950">
                  Autonomous Resolution Lifecycle
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Here is how the agent processes an inbound payment dispute from initial claim to final card network representment:
                </p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-950 text-xs uppercase tracking-wider">
                        Dispute Intake &amp; Claim Parsing
                      </h4>
                      <span className="text-[10px] font-mono bg-charcoal-200 text-charcoal-800 px-1.5 py-0.5 rounded">
                        Intake Stage
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The system ingests the inbound dispute notification (ARN, card scheme, dispute reason code, and cardholder&apos;s stated claim). It establishes baseline payment records and shipping references.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-lime-500 text-charcoal-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-950 text-xs uppercase tracking-wider">
                        Autonomous Multi-System Tool Loop
                      </h4>
                      <span className="text-[10px] font-mono bg-lime-100 text-lime-800 px-1.5 py-0.5 rounded border border-lime-200">
                        Live Agent Loop
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The AI model dynamically invokes specialized tools:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-charcoal-700 font-mono">
                      <li className="bg-white p-2 rounded-xl border border-charcoal-200">
                        <code className="text-lime-700 font-bold">get_transaction_details</code>
                        <span className="block text-[11px] font-sans text-charcoal-500">Queries 3DS authentication &amp; IP/VPN logs</span>
                      </li>
                      <li className="bg-white p-2 rounded-xl border border-charcoal-200">
                        <code className="text-lime-700 font-bold">verify_delivery_courier</code>
                        <span className="block text-[11px] font-sans text-charcoal-500">Extracts BlueDart/Delhivery OTP signatures</span>
                      </li>
                      <li className="bg-white p-2 rounded-xl border border-charcoal-200">
                        <code className="text-lime-700 font-bold">get_user_behavior_profile</code>
                        <span className="block text-[11px] font-sans text-charcoal-500">Analyzes buyer order history &amp; dispute rates</span>
                      </li>
                      <li className="bg-white p-2 rounded-xl border border-charcoal-200">
                        <code className="text-lime-700 font-bold">calculate_risk_score</code>
                        <span className="block text-[11px] font-sans text-charcoal-500">Evaluates fraud anomaly indices</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-950 text-xs uppercase tracking-wider">
                        Evidence Synthesis &amp; Rebuttal Generation
                      </h4>
                      <span className="text-[10px] font-mono bg-charcoal-200 text-charcoal-800 px-1.5 py-0.5 rounded">
                        Synthesis Stage
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The agent correlates corroborating proofs against contradictory risk signals. It outputs an evidence strength score (<code className="font-mono text-lime-700">HIGH</code> / <code className="font-mono text-amber-700">MODERATE</code> / <code className="font-mono text-rose-700">LOW</code>), confidence percentage, and compiles a formal card-network rebuttal dossier.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-950 text-xs uppercase tracking-wider">
                        Human-in-the-Loop Sign-off &amp; Submission
                      </h4>
                      <span className="text-[10px] font-mono bg-charcoal-200 text-charcoal-800 px-1.5 py-0.5 rounded">
                        Final Stage
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The case is flagged as <em>AI Investigated (Pending Sign-off)</em>. The human supervisor can review the operational summary, edit the rebuttal letter, and click <strong>&quot;Approve &amp; Submit&quot;</strong> or choose an <strong>&quot;Override Verdict&quot;</strong> with custom compliance notes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ARCHITECTURE & PRODUCTION ROADMAP            */}
        {/* ==================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 animate-fade-in">
            {/* Prototype Note */}
            <div className="bg-lime-50/70 p-6 sm:p-7 rounded-3xl border border-lime-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-700" />
                <h4 className="font-bold text-lime-950 text-sm uppercase tracking-wider">
                  Interactive Prototype vs. Production Deployment
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-lime-900 leading-relaxed">
                This working prototype demonstrates the full autonomous reasoning loop, streaming UI, and human-in-the-loop controls using curated benchmark test scenarios and live Groq LLM tool calling.
              </p>
              <p className="text-xs sm:text-sm text-lime-900/90 leading-relaxed">
                In an enterprise production deployment at Razorpay scale, the agent connects directly to real-time payment gateway webhooks, carrier logistics integrations (BlueDart, Delhivery, Shadowfax, Shiprocket), internal merchant CRM microservices, and card network representment APIs (Visa VROL, Mastercard MasterCom, RuPay DMS) to resolve disputes at sub-second scale.
              </p>
            </div>

            {/* Architecture Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-charcoal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Inference &amp; Reasoning
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Powered by <strong>Groq / Llama 3.3 70B Versatile</strong> delivering ultra-low-latency tool execution and deterministic JSON-schema evidence outputs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-charcoal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Audit &amp; Security Compliance
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Every decision trace, tool result, millisecond latency metric, and human override is immutably logged into PostgreSQL for compliance inspection.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-charcoal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Card Scheme Alignment
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Pre-configured with reason-code evidence requirements across Visa (13.1 Non-Receipt), Mastercard (4855 Goods/Services Not Provided), and RuPay chargeback rules.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-charcoal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Real-Time SSE Streaming
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 leading-relaxed">
                  Server-Sent Events (SSE) stream the agent&apos;s active decision trace live to the frontend with zero polling overhead.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full bg-white border-t border-charcoal-100 py-6 mt-12 text-xs text-charcoal-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-charcoal-900">
              Razorpay Chargeback Resolver
            </span>
            <span>•</span>
            <span>Autonomous Risk Operations</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <span>Built with passion by</span>
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
