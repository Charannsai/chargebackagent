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
} from 'lucide-react';

export default function KnowMorePage() {
  const [activeTab, setActiveTab] = useState<'why' | 'how' | 'architecture'>('why');

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Floating Borderless Header */}
      <Header onOpenCreateModal={() => {}} />

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

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-charcoal-950 text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            <span>AUTONOMOUS RISK OPERATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
            About Razorpay Agentic Chargeback Resolver
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-3xl">
            An autonomous AI specialist engineering prototype designed to investigate payment disputes, aggregate evidence across payment gateways and logistics telemetry, and assemble verifiable representment packages.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-1.5 border border-charcoal-200 shadow-subtle flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('why')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'why'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            1. Why it Matters to Razorpay
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'how'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            2. How It Works (Operator Guide)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap text-center ${
              activeTab === 'architecture'
                ? 'bg-charcoal-950 text-white shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
            }`}
          >
            3. Architecture &amp; Prototype Note
          </button>
        </div>

        {/* Tab 1: Why It Matters to Razorpay */}
        {activeTab === 'why' && (
          <div className="space-y-6 animate-fade-in">
            {/* Pillar 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-lime-400 flex items-center justify-center font-extrabold text-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-charcoal-950">
                  It Solves a Real, High-Cost Razorpay Problem
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Razorpay processes billions in transactions. Chargebacks and payment disputes are major financial and operational drains on merchants and payment compliance desks.
              </p>
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-charcoal-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>Most AI applicants build generic PDF search tools or simple chatbot wrappers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>
                    By building a <strong>Chargeback Resolver</strong>, you show immediate understanding of their business model. You are proving you can write code that directly impacts their bottom line (risk mitigation, merchant operations, and representment win rates).
                  </span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-lime-400 flex items-center justify-center font-extrabold text-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-charcoal-950">
                  High Technical Signal (No Framework Wrappers)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                The hiring team wants to see if you actually understand agent loops from first principles. Anyone can import <code className="bg-charcoal-50 px-1.5 py-0.5 rounded border border-charcoal-200 font-mono text-charcoal-900">LangChain</code> or <code className="bg-charcoal-50 px-1.5 py-0.5 rounded border border-charcoal-200 font-mono text-charcoal-900">CrewAI</code> and run a boilerplate template.
              </p>
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-charcoal-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>
                    By building a <strong>raw state-machine loop with JSON-schema tool calling</strong> in native TypeScript and Next.js, you demonstrate that you understand state management, context window limits, and how to control LLM outputs.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>
                    This proves you have the engineering rigor needed to work on their internal <strong>Agentic Platform</strong> or <strong>Agent Studio</strong> teams.
                  </span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-charcoal-950 text-lime-400 flex items-center justify-center font-extrabold text-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-charcoal-950">
                  It Solves the &quot;Black Box&quot; UX Problem
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                The biggest bottleneck in deploying AI agents in fintech is trust. Operators won&apos;t trust an agent that just outputs a blind &quot;Refund Approved&quot; button without explanation.
              </p>
              <ul className="space-y-2 pt-2 text-xs sm:text-sm text-charcoal-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>
                    Your <strong>Live Decision Trace</strong> (showing <em>Thinking &rarr; Tool Call &rarr; Tool Output &rarr; Reasoning</em> with millisecond latency tags) shows you have strong product sense.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-lime-600 font-bold mt-0.5">•</span>
                  <span>
                    It proves you don&apos;t just build backends; you build highly usable interfaces that make complex AI operations transparent and auditable.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: How It Works */}
        {activeTab === 'how' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-charcoal-950">
                Step-by-Step Operator Guide
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Follow this simple workflow to test the autonomous dispute resolution lifecycle:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Select a Benchmark Dispute
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Click on any dispute from the queue (e.g. <strong>Case 1: Friendly Fraud</strong> or <strong>Case 2: Account Takeover</strong>). You will enter the dedicated dispute investigation screen showing the cardholder&apos;s stated bank claim against merchant fulfillment records.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-lime-500 text-charcoal-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Trigger the Autonomous AI Agent
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      Click <strong>&quot;Start AI Resolution&quot;</strong>. The agent will autonomously execute live tool calls (querying gateway 3DS logs, verifying BlueDart/Delhivery delivery OTP signatures, and inspecting customer fraud risk scores).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Inspect the Decision &amp; Evidence Checklist
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The agent outputs a structured verdict (Represent / Refund / Escalate), confidence score %, &quot;Why this decision?&quot; evidence checklist, and an editable formal rebuttal letter.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Human-in-the-Loop Sign-Off
                    </h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">
                      The dispute remains in <em>Pending Sign-off</em> until you review. Click <strong>&quot;Approve &amp; Submit&quot;</strong> to commit to the card network, or click <strong>&quot;Override Verdict&quot;</strong> to choose an alternate action with custom operator notes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Architecture & Disclaimer */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-lime-50/60 p-6 sm:p-7 rounded-3xl border border-lime-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-lime-700" />
                <h4 className="font-bold text-lime-950 text-sm uppercase tracking-wider">
                  Interactive Prototype Disclaimer
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-lime-900 leading-relaxed">
                This interface runs as an interactive prototype using curated benchmark dispute telemetry and live Groq LLM tool loops.
              </p>
              <p className="text-xs sm:text-sm text-lime-900/90 leading-relaxed">
                In a production enterprise deployment, the agent directly hooks into live Razorpay payment gateway webhooks, courier REST APIs (BlueDart, Delhivery, Shadowfax), CRM/Auth microservices, and card scheme representment pipelines (Visa VROL, Mastercard MasterCom), processing real-time dispute payloads with sub-second latency and zero human latency bottlenecks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                  LLM Engine &amp; Reasoning
                </span>
                <p className="font-bold text-charcoal-950 text-sm">
                  Groq / Llama 3.3 70B Versatile
                </p>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Deterministic dynamic tool loops with JSON-schema validation and SSE streaming.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                  Audit &amp; Security
                </span>
                <p className="font-bold text-charcoal-950 text-sm">
                  Immutable Decision Trail
                </p>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  PostgreSQL schema with step-by-step latency records and operator overrides.
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
