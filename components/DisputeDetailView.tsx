'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dispute,
  Transaction,
  UserProfile,
  AgentRun,
  AgentStep,
  AgentVerdict,
} from '@/lib/types';
import { formatINR, formatDate, formatDateTime } from '@/lib/utils';
import { JsonViewer } from './JsonViewer';
import {
  ArrowLeft,
  Play,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  CreditCard,
  Truck,
  User,
  Clock,
  Zap,
  Check,
  AlertCircle,
  HelpCircle,
  History,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

interface DisputeDetailViewProps {
  dispute: Dispute;
  onBack: () => void;
  engineMode: 'groq' | 'demo';
  onRunComplete: () => void;
  onViewAudit: (dispute: Dispute) => void;
}

export function DisputeDetailView({
  dispute,
  onBack,
  engineMode,
  onRunComplete,
  onViewAudit,
}: DisputeDetailViewProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [existingRuns, setExistingRuns] = useState<AgentRun[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Agent Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [activeTab, setActiveTab] = useState<'resolution' | 'rebuttal' | 'transaction' | 'customer'>('resolution');
  const [rebuttalText, setRebuttalText] = useState('');
  const [operatorGuidance, setOperatorGuidance] = useState('');
  const [showGuidanceInput, setShowGuidanceInput] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState('');

  const traceEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll trace as steps arrive
  useEffect(() => {
    traceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  // Fetch dispute details & past runs on mount
  useEffect(() => {
    if (dispute) {
      fetchDisputeDetails(dispute.id);
    }
  }, [dispute?.id]);

  const fetchDisputeDetails = async (disputeId: string) => {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/disputes?id=${disputeId}`);
      if (res.ok) {
        const data = await res.json();
        setTransaction(data.transaction || null);
        setUserProfile(data.userProfile || null);
        setExistingRuns(data.runs || []);

        if (data.runs && data.runs.length > 0) {
          const latest = data.runs[0];
          setCurrentRun(latest);
          setSteps(latest.steps || []);
          if (latest.representment_package?.rebuttal_letter) {
            setRebuttalText(latest.representment_package.rebuttal_letter);
          }
        } else {
          setCurrentRun(null);
          setSteps([]);
          setRebuttalText('');
        }
      }
    } catch (err) {
      console.error('Failed to load dispute detail:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleStartInvestigation = async (customGuidance?: string) => {
    if (!dispute) return;
    setIsRunning(true);
    setSteps([]);
    setCurrentRun(null);
    setActiveTab('resolution');

    try {
      const response = await fetch('/api/agent/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: dispute.id,
          engineMode,
          operatorGuidance: customGuidance || operatorGuidance,
        }),
      });

      if (!response.body) throw new Error('No stream body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const eventMatch = line.match(/^event:\s*(\w+)/m);
          const dataMatch = line.match(/^data:\s*(.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (eventType === 'step') {
              setSteps((prev) => [...prev, data as AgentStep]);
            } else if (eventType === 'complete') {
              const run = data as AgentRun;
              setCurrentRun(run);
              if (run.representment_package?.rebuttal_letter) {
                setRebuttalText(run.representment_package.rebuttal_letter);
              }
              onRunComplete();
            }
          }
        }
      }
    } catch (err) {
      console.error('Investigation stream error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplyReview = async (
    action: 'APPROVED' | 'OVERRIDDEN',
    overrideVerdict?: AgentVerdict
  ) => {
    if (!dispute || !currentRun) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch('/api/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: dispute.id,
          runId: currentRun.id,
          action,
          overrideVerdict,
          notes: overrideNotes || undefined,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCurrentRun(result.run);
        onRunComplete();
        setShowOverrideMenu(false);
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const effectiveVerdict = currentRun?.human_override_verdict || currentRun?.final_verdict;
  const isApproved = currentRun?.human_action === 'APPROVED';
  const isOverridden = currentRun?.human_action === 'OVERRIDDEN';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ==================================================== */}
      {/* TOP NAVIGATION: Back to Disputes Bar                */}
      {/* ==================================================== */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 bg-white hover:bg-charcoal-100 border border-charcoal-200 transition-all shadow-subtle group"
        >
          <ArrowLeft className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-950 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dispute Queue</span>
        </button>

        <div className="flex items-center gap-3">
          {currentRun && (
            <button
              onClick={() => onViewAudit(dispute)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-colors shadow-subtle"
            >
              <History className="w-3.5 h-3.5 text-charcoal-500" />
              <span>View Audit Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* FULL-WIDTH HERO: Dispute Context & Primary Action   */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono font-bold text-charcoal-950 text-base">
              {dispute.id}
            </span>
            <span className="text-xs px-3 py-1 rounded-full font-medium bg-charcoal-100 text-charcoal-700">
              {dispute.reason.replace(/_/g, ' ')}
            </span>
            {dispute.status === 'RESOLVED_REPRESENTED' && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-lime-100 text-lime-800 border border-lime-300">
                Represented (Won)
              </span>
            )}
            {dispute.status === 'RESOLVED_REFUNDED' && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                Refund Accepted
              </span>
            )}
            {dispute.status === 'ESCALATED' && (
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Escalated to Ops
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-6 pt-1">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 block">
                Disputed Amount
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-charcoal-950 font-mono tracking-tight">
                {formatINR(dispute.amount)}
              </span>
            </div>

            <div className="h-10 w-px bg-charcoal-200 hidden sm:block"></div>

            <div className="space-y-1 text-xs text-charcoal-600">
              <p>
                <span className="text-charcoal-400">Merchant:</span> <strong>{dispute.merchant_name}</strong>
              </p>
              <p>
                <span className="text-charcoal-400">Cardholder:</span> {dispute.customer_name} ({dispute.customer_email})
              </p>
              <p>
                <span className="text-charcoal-400">Network / Due Date:</span> {dispute.network} • Due by {formatDate(dispute.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Run AI Resolver */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => handleStartInvestigation()}
            disabled={isRunning}
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-subtle ${
              isRunning
                ? 'bg-lime-500 text-white cursor-not-allowed animate-pulse ring-2 ring-lime-400/50'
                : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : 'text-lime-400 fill-lime-400'}`} />
            <span>
              {isRunning
                ? 'Agent Investigating Live...'
                : currentRun
                ? 'Re-Run AI Resolver'
                : 'Run Autonomous AI Resolver'}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* CLEAR ISSUE SUMMARY: Customer Claim vs Merchant Stance */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer's Claim */}
        <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs border border-rose-200">
              !
            </div>
            <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Cardholder's Stated Issue & Bank Claim
            </span>
          </div>
          <p className="text-xs text-charcoal-800 bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100/80 italic leading-relaxed">
            "{dispute.customer_claim_statement || 'Customer filed a formal chargeback alleging non-delivery or unauthorized billing.'}"
          </p>
        </div>

        {/* Merchant's Stance & Evidence Baseline */}
        <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-charcoal-100 text-charcoal-700 flex items-center justify-center font-bold text-xs border border-charcoal-200">
              i
            </div>
            <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Merchant Order & Fulfillment Record
            </span>
          </div>
          <p className="text-xs text-charcoal-800 bg-charcoal-50 p-3.5 rounded-2xl border border-charcoal-200/80 leading-relaxed">
            {dispute.merchant_fulfillment_note || 'Order was processed via Razorpay gateway and dispatched via third-party logistics.'}
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* NAVIGATION TABS                                     */}
      {/* ==================================================== */}
      <div className="flex items-center border-b border-charcoal-200 bg-white rounded-2xl px-4 shadow-subtle overflow-x-auto">
        <button
          onClick={() => setActiveTab('resolution')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'resolution'
              ? 'border-charcoal-950 text-charcoal-950'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-lime-600" />
          <span>AI Resolution & Decision Trace</span>
          {currentRun && (
            <span className="w-2 h-2 rounded-full bg-lime-500 shadow-lime-glow-sm"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rebuttal')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rebuttal'
              ? 'border-charcoal-950 text-charcoal-950'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-charcoal-400" />
          <span>Formal Rebuttal Dossier</span>
        </button>

        <button
          onClick={() => setActiveTab('transaction')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transaction'
              ? 'border-charcoal-950 text-charcoal-950'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-charcoal-400" />
          <span>Transaction & Logistics Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('customer')}
          className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customer'
              ? 'border-charcoal-950 text-charcoal-950'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-charcoal-400" />
          <span>Customer Risk Profile</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB CONTENT PANELS                                  */}
      {/* ==================================================== */}

      {/* TAB 1: RESOLUTION & LIVE AGENT TRACE */}
      {activeTab === 'resolution' && (
        <div className="space-y-6">
          {!currentRun && !isRunning && (
            <div className="py-16 px-6 rounded-3xl border-2 border-dashed border-charcoal-200 bg-white flex flex-col items-center justify-center text-center space-y-4 shadow-subtle">
              <div className="w-14 h-14 rounded-2xl bg-lime-50 text-lime-700 flex items-center justify-center border border-lime-200 shadow-sm">
                <Sparkles className="w-7 h-7 text-lime-600" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="font-bold text-charcoal-950 text-base">
                  Ready for Autonomous AI Investigation
                </h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Click <strong>"Run Autonomous AI Resolver"</strong> in the header above to trigger the live Groq / Llama 3.3 70B state machine.
                </p>
              </div>
            </div>
          )}

          {(currentRun || isRunning) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Decision Trace Stream (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle flex flex-col h-[540px]">
                <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-100">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-lime-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                      Live Decision Trace
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-charcoal-400">
                    {steps.length} steps logged
                  </span>
                </div>

                {/* Steps Scroll Area */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2.5 font-mono text-xs pr-1">
                  {steps.map((step, idx) => {
                    const isCompleted = step.event_type === 'TOOL_COMPLETED';
                    const isDecision = step.event_type === 'DECISION_READY';
                    const isInvoked = step.event_type === 'TOOL_INVOKED';
                    const isEvaluating = step.event_type === 'EVALUATING';

                    return (
                      <div key={step.id || idx} className="flex items-start gap-2.5 group animate-fade-in">
                        <div className="mt-0.5 flex-shrink-0">
                          {isCompleted && (
                            <div className="w-4 h-4 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center border border-lime-300">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          {isDecision && (
                            <div className="w-4 h-4 rounded-full bg-charcoal-950 text-lime-400 flex items-center justify-center">
                              <Sparkles className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {isInvoked && (
                            <div className="w-4 h-4 rounded-full bg-charcoal-100 text-charcoal-600 flex items-center justify-center animate-pulse">
                              <Clock className="w-2.5 h-2.5" />
                            </div>
                          )}
                          {isEvaluating && (
                            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center animate-spin">
                              <span className="text-[9px]">⟳</span>
                            </div>
                          )}
                          {step.event_type === 'INVESTIGATION_STARTED' && (
                            <div className="w-4 h-4 rounded-full bg-charcoal-200 text-charcoal-700 flex items-center justify-center">
                              <span className="text-[9px]">▶</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 bg-charcoal-50/80 rounded-xl p-2.5 border border-charcoal-200 hover:border-charcoal-300 transition-colors">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-sans text-xs ${
                                isDecision
                                  ? 'font-bold text-charcoal-950'
                                  : isCompleted
                                  ? 'text-charcoal-900 font-medium'
                                  : 'text-charcoal-600'
                              }`}
                            >
                              {step.label}
                            </span>
                            {step.latency_ms > 0 && (
                              <span className="text-[10px] text-charcoal-400 bg-white px-1.5 py-0.5 rounded border border-charcoal-200 whitespace-nowrap font-mono">
                                {step.latency_ms}ms
                              </span>
                            )}
                          </div>

                          {step.arguments && Object.keys(step.arguments).length > 0 && (
                            <JsonViewer
                              title={`Params: ${step.tool_name}`}
                              data={step.arguments}
                              defaultExpanded={false}
                            />
                          )}
                          {step.result && Object.keys(step.result).length > 0 && (
                            <JsonViewer
                              title={`Result: ${step.tool_name || 'Output'}`}
                              data={step.result}
                              defaultExpanded={false}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={traceEndRef} />
                </div>

                {/* Guidance injection footer */}
                <div className="pt-3 border-t border-charcoal-100">
                  {!showGuidanceInput ? (
                    <button
                      onClick={() => setShowGuidanceInput(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>Rerun with Custom Operator Guidance</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. Focus on OTP timestamp verification..."
                        value={operatorGuidance}
                        onChange={(e) => setOperatorGuidance(e.target.value)}
                        className="w-full p-2.5 text-xs border border-charcoal-300 rounded-xl text-charcoal-900"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowGuidanceInput(false)}
                          className="px-3 py-1.5 text-xs text-charcoal-500 hover:text-charcoal-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowGuidanceInput(false);
                            handleStartInvestigation(operatorGuidance);
                          }}
                          disabled={isRunning}
                          className="px-3.5 py-1.5 bg-charcoal-950 text-white rounded-xl text-xs font-medium"
                        >
                          Rerun Agent
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: AI Verdict & Evidence Workshop (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* AI Verdict Banner */}
                {currentRun && (
                  <div
                    className={`p-6 rounded-3xl border shadow-sm transition-all ${
                      effectiveVerdict === 'REPRESENT_DISPUTE'
                        ? 'bg-lime-50/70 border-lime-300 ring-1 ring-lime-400/30'
                        : effectiveVerdict === 'ACCEPT_REFUND'
                        ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/30'
                        : 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600 block">
                          AI Recommended Resolution
                        </span>
                        <h3 className="text-xl font-bold text-charcoal-950 mt-1">
                          {effectiveVerdict === 'REPRESENT_DISPUTE' && 'Represent Dispute (Reject Customer Claim)'}
                          {effectiveVerdict === 'ACCEPT_REFUND' && 'Accept Dispute (Full Merchant Refund)'}
                          {effectiveVerdict === 'ESCALATE_TO_HUMAN' && 'Escalate to Manual Compliance Desk'}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-3xl font-extrabold text-charcoal-950 font-mono">
                          {currentRun.confidence_score}%
                        </span>
                        <p className="text-[10px] text-charcoal-500 font-semibold uppercase">
                          Confidence
                        </p>
                      </div>
                    </div>

                    {isApproved && (
                      <div className="mt-3.5 pt-3.5 border-t border-lime-200 flex items-center gap-1.5 text-xs text-lime-900 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-lime-600" />
                        <span>Approved by Human Operator • Submitted to Card Network</span>
                      </div>
                    )}
                    {isOverridden && (
                      <div className="mt-3.5 pt-3.5 border-t border-charcoal-200 flex items-center gap-1.5 text-xs text-charcoal-800 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>
                          Overridden to: {currentRun.human_override_verdict} ({currentRun.human_notes || 'Manual override'})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* "Why this decision?" Evidence Checklist */}
                {currentRun?.evaluation && (
                  <div className="bg-white rounded-3xl p-6 border border-charcoal-200 shadow-subtle space-y-4">
                    <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-charcoal-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                          Why this decision? (Evidence Assessment)
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-charcoal-500">Evidence Strength:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            currentRun.evaluation.evidence_strength === 'HIGH'
                              ? 'bg-lime-100 text-lime-800 border border-lime-300'
                              : currentRun.evaluation.evidence_strength === 'MODERATE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {currentRun.evaluation.evidence_strength}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-charcoal-700 bg-charcoal-50 p-3.5 rounded-2xl border border-charcoal-200 leading-relaxed">
                      {currentRun.evaluation.operational_summary}
                    </p>

                    {/* Corroborating Signals */}
                    {currentRun.evaluation.corroborating_signals.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block">
                          Corroborating Evidence
                        </span>
                        <ul className="space-y-1.5">
                          {currentRun.evaluation.corroborating_signals.map((sig, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-charcoal-800 font-sans">
                              <Check className="w-3.5 h-3.5 text-lime-600 mt-0.5 flex-shrink-0" />
                              <span>{sig}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk Flags / Discrepancies */}
                    {currentRun.evaluation.contradictory_signals.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-charcoal-100">
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                          Risk Flags & Discrepancies
                        </span>
                        <ul className="space-y-1.5">
                          {currentRun.evaluation.contradictory_signals.map((sig, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-amber-900 font-sans">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{sig}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Human Review Action Bar */}
                {currentRun && (
                  <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-charcoal-500">
                      <span className="font-semibold text-charcoal-900">Human-in-the-Loop Review:</span> Operator sign-off commits representment to the card network.
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative">
                        <button
                          onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                          className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                        >
                          Override Verdict
                        </button>

                        {showOverrideMenu && (
                          <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-2xl border border-charcoal-200 shadow-xl p-3.5 z-30 space-y-2 text-xs">
                            <p className="font-semibold text-charcoal-900">
                              Operator Decision Override
                            </p>
                            <input
                              type="text"
                              placeholder="Reason for override..."
                              value={overrideNotes}
                              onChange={(e) => setOverrideNotes(e.target.value)}
                              className="w-full p-2 border border-charcoal-300 rounded-xl text-xs"
                            />
                            <div className="flex flex-col gap-1 pt-1">
                              <button
                                onClick={() => handleApplyReview('OVERRIDDEN', 'REPRESENT_DISPUTE')}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-lime-50 text-charcoal-800 font-medium"
                              >
                                Represent Dispute
                              </button>
                              <button
                                onClick={() => handleApplyReview('OVERRIDDEN', 'ACCEPT_REFUND')}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-charcoal-800 font-medium"
                              >
                                Accept Full Refund
                              </button>
                              <button
                                onClick={() => handleApplyReview('OVERRIDDEN', 'ESCALATE_TO_HUMAN')}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-charcoal-800 font-medium"
                              >
                                Escalate to Ops
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleApplyReview('APPROVED')}
                        disabled={isSubmittingReview || isApproved}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-subtle ${
                          isApproved
                            ? 'bg-lime-100 text-lime-800 border border-lime-300 cursor-default'
                            : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40'
                        }`}
                      >
                        <Check className="w-4 h-4 text-lime-400" />
                        <span>{isApproved ? 'Approved & Submitted' : 'Approve & Submit'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORMAL REBUTTAL LETTER */}
      {activeTab === 'rebuttal' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span className="font-semibold text-charcoal-800">
              Formal Representment Letter (Aligned with standard network representment rules)
            </span>
            <span className="font-mono">{rebuttalText.length} characters</span>
          </div>
          <textarea
            rows={18}
            value={rebuttalText}
            onChange={(e) => setRebuttalText(e.target.value)}
            placeholder="Formal rebuttal letter will be generated by the AI agent upon running investigation..."
            className="w-full p-5 font-mono text-xs text-charcoal-800 bg-charcoal-50/40 border border-charcoal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white leading-relaxed"
          />
        </div>
      )}

      {/* TAB 3: TRANSACTION & LOGISTICS */}
      {activeTab === 'transaction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {transaction ? (
            <>
              {/* Gateway Payment Details */}
              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-4">
                <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                  <CreditCard className="w-4 h-4 text-charcoal-600" />
                  <h4 className="font-bold text-charcoal-900 text-sm">
                    Gateway Payment Record
                  </h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Transaction ID</span>
                    <span className="font-mono text-charcoal-900 font-medium">{transaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Gateway Reference</span>
                    <span className="font-mono text-charcoal-900">{transaction.gateway_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Card Network</span>
                    <span className="text-charcoal-900 font-medium">{transaction.card_network || 'Visa'} (•••• {transaction.card_last4 || '4192'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">3DS Authentication</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${transaction.three_ds_status === 'AUTHENTICATED' ? 'bg-lime-50 text-lime-700 border border-lime-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {transaction.three_ds_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Client IP Address</span>
                    <span className="font-mono text-charcoal-900">{transaction.ip_address} ({transaction.ip_country})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">VPN / Tor Proxy</span>
                    <span className={`font-bold ${transaction.is_vpn_or_proxy ? 'text-rose-600' : 'text-lime-600'}`}>
                      {transaction.is_vpn_or_proxy ? 'Flagged Proxy Detected' : 'Clean IP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logistics & Courier Telemetry */}
              <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-4">
                <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                  <Truck className="w-4 h-4 text-charcoal-600" />
                  <h4 className="font-bold text-charcoal-900 text-sm">
                    Logistics & Courier Telemetry
                  </h4>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Courier Partner</span>
                    <span className="font-medium text-charcoal-900">{transaction.shipping_carrier || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Tracking AWB</span>
                    <span className="font-mono font-medium text-charcoal-900">{transaction.shipping_tracking_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Item Description</span>
                    <span className="text-charcoal-900 font-medium text-right max-w-[200px] truncate">{transaction.item_description}</span>
                  </div>
                  <div className="pt-2 border-t border-charcoal-100">
                    <span className="text-charcoal-500 block mb-1">Destination Address:</span>
                    <p className="text-charcoal-800 bg-charcoal-50 p-3 rounded-2xl border border-charcoal-200">
                      {transaction.shipping_address}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 py-12 text-center text-xs text-charcoal-400">
              Loading transaction telemetry...
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOMER PROFILE */}
      {activeTab === 'customer' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200 shadow-subtle max-w-2xl text-xs space-y-5">
          {userProfile ? (
            <>
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                <User className="w-4 h-4 text-charcoal-600" />
                <h4 className="font-bold text-charcoal-900 text-sm">
                  Customer Behavioral Profile
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-charcoal-500 block">Full Name</span>
                  <span className="font-semibold text-charcoal-900 text-sm">{userProfile.full_name}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Email Address</span>
                  <span className="font-mono text-charcoal-900">{userProfile.email}</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Lifetime Orders</span>
                  <span className="font-medium text-charcoal-900">{userProfile.total_orders_count} orders ({formatINR(userProfile.total_spent_inr)})</span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Prior Chargebacks</span>
                  <span className={`font-bold ${userProfile.chargeback_history_count > 0 ? 'text-rose-600' : 'text-lime-700'}`}>
                    {userProfile.chargeback_history_count} previous disputes
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Account Risk Tier</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold inline-block mt-1 ${
                    userProfile.risk_flag === 'LOW' ? 'bg-lime-50 text-lime-700 border border-lime-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {userProfile.risk_flag}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-500 block">Trusted Devices</span>
                  <span className="text-charcoal-800">{userProfile.known_device_ids.length} registered hardware IDs</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-charcoal-400">
              Loading customer risk profile...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
