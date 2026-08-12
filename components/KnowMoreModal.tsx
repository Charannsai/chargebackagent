'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Cpu,
  Eye,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Zap,
  CheckCircle2,
  Mail,
  ExternalLink,
  Layers,
  FileText,
} from 'lucide-react';

interface KnowMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KnowMoreModal({ isOpen, onClose }: KnowMoreModalProps) {
  const [activeTab, setActiveTab] = useState<'why' | 'how' | 'architecture'>('why');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-charcoal-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-charcoal-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-charcoal-950 tracking-tight">
                About Razorpay Agentic Chargeback Resolver
              </h2>
            </div>
            <p className="text-xs text-charcoal-500">
              Autonomous AI Risk Specialist • Architecture, Value & Operations Guide
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 flex items-center justify-center text-charcoal-500 hover:text-charcoal-950 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-charcoal-100 flex items-center gap-2 overflow-x-auto bg-charcoal-50/50">
          <button
            onClick={() => setActiveTab('why')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'why'
                ? 'border-charcoal-950 text-charcoal-950'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            1. Why it Matters to Razorpay
          </button>
          <button
            onClick={() => setActiveTab('how')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'how'
                ? 'border-charcoal-950 text-charcoal-950'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            2. How It Works (Operator Guide)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-charcoal-950 text-charcoal-950'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            3. Architecture & Prototype Note
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-charcoal-800 text-xs leading-relaxed flex-1">
          {/* ==================================================== */}
          {/* TAB 1: WHY IT MATTERS TO RAZORPAY                   */}
          {/* ==================================================== */}
          {activeTab === 'why' && (
            <div className="space-y-5 animate-fade-in">
              {/* Pillar 1 */}
              <div className="bg-charcoal-50/60 p-5 rounded-2xl border border-charcoal-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-charcoal-950 text-lime-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-charcoal-950">
                    It Solves a Real, High-Cost Razorpay Problem
                  </h3>
                </div>
                <p className="text-charcoal-600">
                  Razorpay processes billions in transactions. Chargebacks and payment disputes are major financial and operational drains on merchants and compliance teams.
                </p>
                <ul className="space-y-1 pt-1 text-charcoal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>Most AI applicants build generic PDF search tools or chatbot wrappers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>
                      By building a <strong>Chargeback Resolver</strong>, you show immediate understanding of their business model and write code that directly impacts bottom line revenue, risk mitigation, and merchant operations.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="bg-charcoal-50/60 p-5 rounded-2xl border border-charcoal-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-charcoal-950 text-lime-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-charcoal-950">
                    High Technical Signal (No Framework Wrappers)
                  </h3>
                </div>
                <p className="text-charcoal-600">
                  The hiring team wants to see if you actually understand agent loops from first principles. Anyone can import <code className="bg-white px-1.5 py-0.5 rounded border text-charcoal-900 font-mono">LangChain</code> or <code className="bg-white px-1.5 py-0.5 rounded border text-charcoal-900 font-mono">CrewAI</code> and run a boilerplate script.
                </p>
                <ul className="space-y-1 pt-1 text-charcoal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>
                      By building a <strong>raw state-machine loop with dynamic JSON-schema tool calling</strong> in native TypeScript/Next.js, you demonstrate deep mastery over state management, context window limits, and controlling deterministic LLM outputs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>
                      This proves the engineering rigor required to build on internal <strong>Agentic Platform</strong> and <strong>Agent Studio</strong> initiatives.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-charcoal-50/60 p-5 rounded-2xl border border-charcoal-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-charcoal-950 text-lime-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-charcoal-950">
                    It Solves the &quot;Black Box&quot; UX Problem
                  </h3>
                </div>
                <p className="text-charcoal-600">
                  The biggest bottleneck in deploying AI agents in fintech is operational trust. Risk officers will never trust an agent that emits a blind &quot;Refund Approved&quot; verdict without transparent evidence.
                </p>
                <ul className="space-y-1 pt-1 text-charcoal-700">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>
                      Our <strong>Live Decision Trace</strong> (streaming <em>Invocation &rarr; Tool Call &rarr; Result &rarr; Evidence Synthesis</em>) provides full transparency with millisecond latency tags.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">•</span>
                    <span>
                      It shows strong product sense: creating usable, trustworthy interfaces for high-stakes financial operations.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: HOW IT WORKS (OPERATOR GUIDE)                 */}
          {/* ==================================================== */}
          {activeTab === 'how' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-charcoal-600">
                Follow this simple step-by-step workflow to test the autonomous chargeback resolution flow:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Select a Benchmark Dispute
                    </h4>
                    <p className="text-charcoal-600 leading-relaxed">
                      Click on any dispute from the queue (e.g. <strong>Case 1: Friendly Fraud</strong> or <strong>Case 2: Account Takeover</strong>). You will enter the dedicated dispute case screen displaying the buyer's stated claim against the merchant fulfillment records.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-lime-500 text-charcoal-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Trigger the Autonomous AI Agent
                    </h4>
                    <p className="text-charcoal-600 leading-relaxed">
                      Click <strong>&quot;Start AI Resolution&quot;</strong>. Watch the agent autonomously execute live tool calls (querying gateway 3DS logs, verifying BlueDart/Delhivery delivery OTP signatures, and inspecting customer fraud risk scores).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Inspect the Decision &amp; Evidence Checklist
                    </h4>
                    <p className="text-charcoal-600 leading-relaxed">
                      The agent outputs a structured verdict (Represent / Refund / Escalate), confidence percentage, &quot;Why this decision?&quot; evidence corroboration signals, and an editable formal rebuttal letter.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-charcoal-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-charcoal-950 text-xs">
                      Human-in-the-Loop Sign-Off
                    </h4>
                    <p className="text-charcoal-600 leading-relaxed">
                      The dispute remains in <em>Pending Sign-off</em> until the human operator signs off. Click <strong>&quot;Approve &amp; Submit&quot;</strong> to commit to the card network, or click <strong>&quot;Override Verdict&quot;</strong> to adjust the decision with custom notes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: ARCHITECTURE & PROTOTYPE DISCLAIMER          */}
          {/* ==================================================== */}
          {activeTab === 'architecture' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-lime-50/60 p-5 rounded-2xl border border-lime-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime-700" />
                  <h4 className="font-bold text-lime-950 text-xs uppercase tracking-wider">
                    Interactive Prototype Disclaimer
                  </h4>
                </div>
                <p className="text-lime-900 leading-relaxed">
                  This working prototype demonstrates the full autonomous reasoning loop and streaming UI over synthetic payment, logistics, and risk data using live Groq LLM tool calling.
                </p>
                <p className="text-lime-900/90 leading-relaxed">
                  A production implementation could integrate with relevant network representment systems and partner APIs (such as Visa VROL, Mastercard MasterCom, or RuPay DMS), subject to access, certification, and network requirements, alongside live payment gateway webhooks, courier partner REST APIs (e.g. BlueDart, Delhivery, Shadowfax), and internal risk scoring microservices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                    LLM Engine &amp; Reasoning
                  </span>
                  <p className="font-semibold text-charcoal-900">
                    Groq / Llama 3.3 70B Versatile
                  </p>
                  <p className="text-[11px] text-charcoal-500">
                    Deterministic dynamic tool loop with JSON Schema verification.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                    Audit &amp; Security
                  </span>
                  <p className="font-semibold text-charcoal-900">
                    Immutable Decision Trail
                  </p>
                  <p className="text-[11px] text-charcoal-500">
                    Complete telemetry logs with step-by-step latency and human overrides.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Charan Sai Mailto Link */}
        <div className="p-5 border-t border-charcoal-100 bg-charcoal-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-charcoal-600">
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

          <button
            onClick={onClose}
            className="px-4 py-2 bg-charcoal-950 hover:bg-charcoal-800 text-white rounded-xl font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
