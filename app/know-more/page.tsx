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
  Clock,
  Code2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export default function KnowMorePage() {
  const [activeTab, setActiveTab] = useState<'why' | 'how' | 'architecture'>('why');

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
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
              Why This Architecture Matters to Razorpay
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-2xl">
            A first-principles breakdown of the business value, deterministic agent loop, card network compliance protections, and human-in-the-loop safety architecture.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-1.5 border border-charcoal-200 shadow-subtle flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('why')}
            className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'why'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            Why it Matters to Razorpay
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'how'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            How it Works (Operator Guide)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'architecture'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            Architecture &amp; Prototype Note
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: WHY THIS ARCHITECTURE MATTERS TO RAZORPAY     */}
        {/* ==================================================== */}
        {activeTab === 'why' && (
          <div className="space-y-5 animate-fade-in">
            {/* 1. The Operational Bottleneck */}
            <div className="group relative bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden transition-all hover:border-charcoal-300">
              {/* Big Faded Overlay Number 01 */}
              <div className="absolute top-1 right-5 text-7xl sm:text-9xl font-black font-mono text-charcoal-100/70 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] transition-colors group-hover:text-lime-100/80">
                01
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-charcoal-950 tracking-tight">
                  The Operational Bottleneck (The $ Billion Problem)
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed">
                  <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
                    <span className="font-bold text-charcoal-900 block">The Status Quo:</span>
                    <p className="text-charcoal-600">
                      Payment disputes and chargebacks require risk analysts to manually open 4 to 5 different tools: the internal ledger, customer support tickets, payment gateway logs, and third-party logistics APIs (e.g., Delhivery, BlueDart). Each dispute takes <strong>15 to 30 minutes</strong> of human investigation.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200/90 space-y-1">
                    <span className="font-bold text-lime-950 block">The Agent Solution:</span>
                    <p className="text-lime-900">
                      This system collapses that entire pipeline into <strong>10 seconds</strong>. By executing structured tool-calling parallelly, the agent aggregates ledger data, courier status, and risk signals instantly, drafting a complete evidence packet without human intervention.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Deterministic Execution over "Chatbot" Guesswork */}
            <div className="group relative bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden transition-all hover:border-charcoal-300">
              {/* Big Faded Overlay Number 02 */}
              <div className="absolute top-1 right-5 text-7xl sm:text-9xl font-black font-mono text-charcoal-100/70 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] transition-colors group-hover:text-lime-100/80">
                02
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-charcoal-950 tracking-tight">
                  Deterministic Execution over &quot;Chatbot&quot; Guesswork
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed">
                  <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
                    <span className="font-bold text-charcoal-900 block">Why it&apos;s not a wrapper:</span>
                    <p className="text-charcoal-600">
                      Traditional LLM chatbots hallucinate and are unreliable for financial operations.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200/90 space-y-1">
                    <span className="font-bold text-lime-950 block">Deterministic State Machine:</span>
                    <p className="text-lime-900">
                      This prototype implements a <strong>strict state-machine loop</strong> utilizing JSON-schema tool calling. The LLM does not make decisions based on memory; it is forced to interact with deterministic APIs (mocked via Supabase) to gather verified facts before outputting a verdict. If a tool fails or returns missing data, the agent safely flags it for escalation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Protecting Merchant Health & Card Network Compliance */}
            <div className="group relative bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden transition-all hover:border-charcoal-300">
              {/* Big Faded Overlay Number 03 */}
              <div className="absolute top-1 right-5 text-7xl sm:text-9xl font-black font-mono text-charcoal-100/70 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] transition-colors group-hover:text-lime-100/80">
                03
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-charcoal-950 tracking-tight">
                  Protecting Merchant Health &amp; Card Network Compliance
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed">
                  <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
                    <span className="font-bold text-charcoal-900 block">The Risk:</span>
                    <p className="text-charcoal-600">
                      If a merchant’s chargeback-to-transaction ratio exceeds <strong>0.9%</strong>, card networks (Visa/Mastercard) place them in high-risk monitoring programs, leading to massive fines and paused settlements.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200/90 space-y-1">
                    <span className="font-bold text-lime-950 block">The Agent Solution:</span>
                    <p className="text-lime-900">
                      By automating the drafting of highly structured &quot;Representment&quot; packages (compelling evidence formatted precisely to card network rules), merchants can defend against friendly fraud faster, win more disputes, and keep their dispute ratio well below the danger threshold.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Safety First: Human-in-the-Loop (HITL) Guardrails */}
            <div className="group relative bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden transition-all hover:border-charcoal-300">
              {/* Big Faded Overlay Number 04 */}
              <div className="absolute top-1 right-5 text-7xl sm:text-9xl font-black font-mono text-charcoal-100/70 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] transition-colors group-hover:text-lime-100/80">
                04
              </div>

              <div className="relative z-10 space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-charcoal-950 tracking-tight">
                  Safety First: Human-in-the-Loop (HITL) Guardrails
                </h3>

                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed">
                  <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-1">
                    <span className="font-bold text-charcoal-900 block">Copilot, Not an Autopilot:</span>
                    <p className="text-charcoal-600">
                      Fully autonomous financial agents are a compliance risk. This system is designed as a <strong>Copilot, not an Autopilot</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200/90 space-y-1">
                    <span className="font-bold text-lime-950 block">Mandatory Operator Sign-off:</span>
                    <p className="text-lime-900">
                      The agent does the heavy lifting—gathering evidence, checking risk heuristics, and drafting the response—but holds the final transaction state in suspense until a human operator reviews the live execution trace and clicks <strong>&quot;Approve &amp; Submit&quot;</strong> or applies an override.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: HOW IT WORKS (OPERATOR GUIDE)                 */}
        {/* ==================================================== */}
        {activeTab === 'how' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-charcoal-950 uppercase tracking-wider">
                Autonomous Resolution Lifecycle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Step 1 */}
                <div className="group relative p-5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200 overflow-hidden space-y-2">
                  <div className="absolute top-1 right-3 text-6xl font-black font-mono text-charcoal-200/60 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
                    01
                  </div>
                  <div className="relative z-10 space-y-1">
                    <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                      Dispute Intake
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Select any dispute from the queue to inspect the cardholder&apos;s stated bank claim against merchant fulfillment records.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative p-5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200 overflow-hidden space-y-2">
                  <div className="absolute top-1 right-3 text-6xl font-black font-mono text-charcoal-200/60 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
                    02
                  </div>
                  <div className="relative z-10 space-y-1">
                    <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                      Autonomous Tool Loop
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Click &quot;Start AI Resolution&quot;. The agent dynamically queries 3DS authentication logs, verifies courier OTP signatures, and inspects fraud scores.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative p-5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200 overflow-hidden space-y-2">
                  <div className="absolute top-1 right-3 text-6xl font-black font-mono text-charcoal-200/60 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
                    03
                  </div>
                  <div className="relative z-10 space-y-1">
                    <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                      Evidence Synthesis
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The agent scores evidence strength, checks corroborating signals, and drafts a formal representment rebuttal letter aligned with card network rules.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="group relative p-5 rounded-2xl bg-charcoal-50/80 border border-charcoal-200 overflow-hidden space-y-2">
                  <div className="absolute top-1 right-3 text-6xl font-black font-mono text-charcoal-200/60 select-none pointer-events-none [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
                    04
                  </div>
                  <div className="relative z-10 space-y-1">
                    <h4 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                      Human Sign-Off
                    </h4>
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
        {/* TAB 3: ARCHITECTURE & PROTOTYPE NOTE                 */}
        {/* ==================================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-4 animate-fade-in">
            {/* Prototype Note */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
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

            {/* Technical Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-1">
                <span className="font-bold text-charcoal-900 block">LLM Reasoning Engine</span>
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
