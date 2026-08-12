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
  X,
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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface DisputeDetailViewProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
  engineMode: 'groq' | 'demo';
  onRunComplete: () => void;
  onViewAudit: (dispute: Dispute) => void;
}

export function DisputeDetailView({
  dispute,
  isOpen,
  onClose,
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

  // Fetch dispute details & past runs on open
  useEffect(() => {
    if (isOpen && dispute) {
      fetchDisputeDetails(dispute.id);
    }
  }, [isOpen, dispute?.id]);

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

  if (!isOpen || !dispute) return null;

  const effectiveVerdict = currentRun?.human_override_verdict || currentRun?.final_verdict;
  const isApproved = currentRun?.human_action === 'APPROVED';
  const isOverridden = currentRun?.human_action === 'OVERRIDDEN';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-950/40 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-5xl bg-[#FFFFFF] h-full shadow-2xl flex flex-col border-l border-charcoal-200 overflow-hidden">
        {/* ==================================================== */}
        {/* TOP BAR: Clean Dispute Context & Close Action       */}
        {/* ==================================================== */}
        <div className="px-6 py-4 border-b border-charcoal-200 bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-950 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-semibold text-charcoal-950 text-sm">
                  {dispute.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-charcoal-100 text-charcoal-700">
                  {dispute.reason.replace(/_/g, ' ')}
                </span>
                {dispute.status === 'RESOLVED_REPRESENTED' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-lime-100 text-lime-800 border border-lime-300">
                    Represented
                  </span>
                )}
                {dispute.status === 'RESOLVED_REFUNDED' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    Refunded
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {dispute.merchant_name} • ARN: <span className="font-mono">{dispute.arn}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentRun && (
              <button
                onClick={() => onViewAudit(dispute)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-colors"
              >
                <History className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Audit History</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-950 hover:bg-charcoal-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* HERO SECTION: Amount, Quick Facts & RUN AI BUTTON   */}
        {/* ==================================================== */}
        <div className="px-6 py-5 bg-charcoal-50/50 border-b border-charcoal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 block">
                Disputed Amount
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-charcoal-950 font-mono tracking-tight">
                {formatINR(dispute.amount)}
              </span>
            </div>
            <div className="h-8 w-px bg-charcoal-200 hidden sm:block"></div>
            <div className="space-y-0.5 text-xs text-charcoal-600">
              <p>
                <span className="text-charcoal-400">Cardholder:</span> {dispute.customer_name} ({dispute.customer_email})
              </p>
              <p>
                <span className="text-charcoal-400">Network / Deadline:</span> {dispute.network} • Due by {formatDate(dispute.due_date)}
              </p>
            </div>
          </div>

          {/* Primary Action: Run AI Resolver CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartInvestigation()}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-subtle ${
                isRunning
                  ? 'bg-lime-500 text-white cursor-not-allowed animate-pulse ring-2 ring-lime-400/50'
                  : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40'
              }`}
            >
              <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : 'text-lime-400 fill-lime-400'}`} />
              <span>{isRunning ? 'Investigating Live...' : currentRun ? 'Re-Run AI Resolver' : 'Run AI Resolver'}</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* NAVIGATION TABS                                     */}
        {/* ==================================================== */}
        <div className="flex items-center border-b border-charcoal-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('resolution')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'resolution'
                ? 'border-charcoal-950 text-charcoal-950 font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-lime-600" />
            <span>AI Resolution & Trace</span>
            {currentRun && (
              <span className="w-2 h-2 rounded-full bg-lime-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rebuttal')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rebuttal'
                ? 'border-charcoal-950 text-charcoal-950 font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Formal Rebuttal Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('transaction')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'transaction'
                ? 'border-charcoal-950 text-charcoal-950 font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Transaction & Logistics</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'customer'
                ? 'border-charcoal-950 text-charcoal-950 font-semibold'
                : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Customer Profile</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* MAIN BODY AREA                                       */}
        {/* ==================================================== */}
        <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
          {/* TAB 1: AI RESOLUTION & DECISION TRACE */}
          {activeTab === 'resolution' && (
            <div className="p-6 space-y-6">
              {!currentRun && !isRunning && (
                <div className="py-12 px-4 rounded-2xl border-2 border-dashed border-charcoal-200 bg-white flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-lime-50 text-lime-700 flex items-center justify-center border border-lime-200 shadow-sm">
                    <Sparkles className="w-6 h-6 text-lime-600" />
                  </div>
                  <div className="max-w-md">
                    <h4 className="font-semibold text-charcoal-950 text-sm">
                      Ready for Autonomous Investigation
                    </h4>
                    <p className="text-xs text-charcoal-500 mt-1">
                      Click the <strong>Run AI Resolver</strong> button above. The agent will dynamically query gateway records, courier APIs, and behavioral risk to compile an evidence package.
                    </p>
                  </div>
                </div>
              )}

              {/* Live / Completed Investigation Split View */}
              {(currentRun || isRunning) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Decision Trace (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-charcoal-200 shadow-subtle flex flex-col h-[520px]">
                    <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-lime-600" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                          Decision Trace
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-charcoal-400">
                        {steps.length} events
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 space-y-2.5 font-mono text-xs pr-1">
                      {steps.map((step, idx) => {
                        const isCompleted = step.event_type === 'TOOL_COMPLETED';
                        const isDecision = step.event_type === 'DECISION_READY';
                        const isInvoked = step.event_type === 'TOOL_INVOKED';
                        const isEvaluating = step.event_type === 'EVALUATING';

                        return (
                          <div key={step.id || idx} className="flex items-start gap-2 group animate-fade-in">
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

                            <div className="flex-1 bg-charcoal-50/80 rounded-lg p-2 border border-charcoal-200 hover:border-charcoal-300 transition-colors">
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`font-sans text-xs ${
                                    isDecision
                                      ? 'font-semibold text-charcoal-950'
                                      : isCompleted
                                      ? 'text-charcoal-900 font-medium'
                                      : 'text-charcoal-600'
                                  }`}
                                >
                                  {step.label}
                                </span>
                                {step.latency_ms > 0 && (
                                  <span className="text-[10px] text-charcoal-400 bg-white px-1.5 py-0.5 rounded border border-charcoal-200 whitespace-nowrap">
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
                    <div className="pt-2 border-t border-charcoal-100">
                      {!showGuidanceInput ? (
                        <button
                          onClick={() => setShowGuidanceInput(true)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-400" />
                          <span>Add Operator Guidance</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Focus on OTP timestamp verification..."
                            value={operatorGuidance}
                            onChange={(e) => setOperatorGuidance(e.target.value)}
                            className="w-full p-2 text-xs border border-charcoal-300 rounded-lg text-charcoal-900"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setShowGuidanceInput(false)}
                              className="px-2 py-1 text-xs text-charcoal-500"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setShowGuidanceInput(false);
                                handleStartInvestigation(operatorGuidance);
                              }}
                              disabled={isRunning}
                              className="px-3 py-1 bg-charcoal-950 text-white rounded-lg text-xs font-medium"
                            >
                              Rerun with Guidance
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Verdict & Evidence Workshop (7 cols) */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Verdict Banner */}
                    {currentRun && (
                      <div
                        className={`p-5 rounded-2xl border shadow-sm transition-all ${
                          effectiveVerdict === 'REPRESENT_DISPUTE'
                            ? 'bg-lime-50/70 border-lime-300 ring-1 ring-lime-400/30'
                            : effectiveVerdict === 'ACCEPT_REFUND'
                            ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/30'
                            : 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-600 block">
                              AI Recommended Resolution
                            </span>
                            <h3 className="text-lg font-bold text-charcoal-950 mt-0.5">
                              {effectiveVerdict === 'REPRESENT_DISPUTE' && 'Represent Dispute (Reject Customer Claim)'}
                              {effectiveVerdict === 'ACCEPT_REFUND' && 'Accept Dispute (Full Merchant Refund)'}
                              {effectiveVerdict === 'ESCALATE_TO_HUMAN' && 'Escalate to Manual Compliance Desk'}
                            </h3>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-bold text-charcoal-950 font-mono">
                              {currentRun.confidence_score}%
                            </span>
                            <p className="text-[10px] text-charcoal-500 font-medium">
                              Confidence
                            </p>
                          </div>
                        </div>

                        {isApproved && (
                          <div className="mt-3 pt-3 border-t border-lime-200 flex items-center gap-1.5 text-xs text-lime-900 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-lime-600" />
                            <span>Approved by Human Operator • Submitted to Network</span>
                          </div>
                        )}
                        {isOverridden && (
                          <div className="mt-3 pt-3 border-t border-charcoal-200 flex items-center gap-1.5 text-xs text-charcoal-800 font-medium">
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
                      <div className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-subtle space-y-3.5">
                        <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-charcoal-600" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900">
                              Why this decision? (Evidence Checklist)
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-charcoal-500">Strength:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
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

                        <p className="text-xs text-charcoal-700 bg-charcoal-50 p-3 rounded-xl border border-charcoal-200 leading-relaxed">
                          {currentRun.evaluation.operational_summary}
                        </p>

                        {/* Corroborating Signals */}
                        {currentRun.evaluation.corroborating_signals.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
                              Corroborating Evidence
                            </span>
                            <ul className="space-y-1.5">
                              {currentRun.evaluation.corroborating_signals.map((sig, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-charcoal-800">
                                  <Check className="w-3.5 h-3.5 text-lime-600 mt-0.5 flex-shrink-0" />
                                  <span>{sig}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Risk Flags / Discrepancies */}
                        {currentRun.evaluation.contradictory_signals.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-charcoal-100">
                            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                              Risk Flags & Discrepancies
                            </span>
                            <ul className="space-y-1.5">
                              {currentRun.evaluation.contradictory_signals.map((sig, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
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
                      <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-charcoal-500">
                          <span className="font-semibold text-charcoal-900">Human-in-the-Loop Review:</span> Operator approval commits the final resolution to the network.
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="relative">
                            <button
                              onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                              className="px-3 py-2 rounded-xl text-xs font-medium text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                            >
                              Override
                            </button>

                            {showOverrideMenu && (
                              <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-xl border border-charcoal-200 shadow-xl p-3 z-30 space-y-2 text-xs">
                                <p className="font-semibold text-charcoal-900">
                                  Operator Decision Override
                                </p>
                                <input
                                  type="text"
                                  placeholder="Reason for override..."
                                  value={overrideNotes}
                                  onChange={(e) => setOverrideNotes(e.target.value)}
                                  className="w-full p-2 border border-charcoal-300 rounded text-xs"
                                />
                                <div className="flex flex-col gap-1 pt-1">
                                  <button
                                    onClick={() => handleApplyReview('OVERRIDDEN', 'REPRESENT_DISPUTE')}
                                    className="w-full text-left px-2 py-1.5 rounded hover:bg-lime-50 text-charcoal-800 font-medium"
                                  >
                                    Represent Dispute
                                  </button>
                                  <button
                                    onClick={() => handleApplyReview('OVERRIDDEN', 'ACCEPT_REFUND')}
                                    className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-50 text-charcoal-800 font-medium"
                                  >
                                    Accept Full Refund
                                  </button>
                                  <button
                                    onClick={() => handleApplyReview('OVERRIDDEN', 'ESCALATE_TO_HUMAN')}
                                    className="w-full text-left px-2 py-1.5 rounded hover:bg-amber-50 text-charcoal-800 font-medium"
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
                            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isApproved
                                ? 'bg-lime-100 text-lime-800 border border-lime-300 cursor-default'
                                : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 text-lime-400" />
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
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-charcoal-500">
                <span>
                  Formal Representment Letter (Structured format for Card Network submission)
                </span>
                <span className="font-mono">{rebuttalText.length} characters</span>
              </div>
              <textarea
                rows={18}
                value={rebuttalText}
                onChange={(e) => setRebuttalText(e.target.value)}
                placeholder="Formal rebuttal letter will be generated by the AI agent upon running investigation..."
                className="w-full p-4 font-mono text-xs text-charcoal-800 bg-white border border-charcoal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 leading-relaxed shadow-subtle"
              />
            </div>
          )}

          {/* TAB 3: TRANSACTION & LOGISTICS */}
          {activeTab === 'transaction' && (
            <div className="p-6 space-y-6">
              {transaction ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Gateway Payment Details */}
                  <div className="bg-white p-5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-3">
                    <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
                      <CreditCard className="w-4 h-4 text-charcoal-600" />
                      <h4 className="font-semibold text-charcoal-900">
                        Gateway Payment Record
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Transaction ID</span>
                        <span className="font-mono text-charcoal-900 font-medium">{transaction.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Gateway Ref</span>
                        <span className="font-mono text-charcoal-900">{transaction.gateway_reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Card Network</span>
                        <span className="text-charcoal-900 font-medium">{transaction.card_network || 'Visa'} (•••• {transaction.card_last4 || '4192'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">3DS Authentication</span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${transaction.three_ds_status === 'AUTHENTICATED' ? 'bg-lime-50 text-lime-700 border border-lime-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {transaction.three_ds_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Client IP Address</span>
                        <span className="font-mono text-charcoal-900">{transaction.ip_address} ({transaction.ip_country})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">VPN / Tor Proxy</span>
                        <span className={`font-semibold ${transaction.is_vpn_or_proxy ? 'text-rose-600' : 'text-lime-600'}`}>
                          {transaction.is_vpn_or_proxy ? 'Flagged Proxy Detected' : 'Clean IP'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logistics & Courier Telemetry */}
                  <div className="bg-white p-5 rounded-2xl border border-charcoal-200 shadow-subtle space-y-3">
                    <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
                      <Truck className="w-4 h-4 text-charcoal-600" />
                      <h4 className="font-semibold text-charcoal-900">
                        Logistics & Courier Telemetry
                      </h4>
                    </div>
                    <div className="space-y-2">
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
                        <p className="text-charcoal-800 bg-charcoal-50 p-2.5 rounded-xl border border-charcoal-200">
                          {transaction.shipping_address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-charcoal-400">
                  Loading transaction logs...
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CUSTOMER PROFILE */}
          {activeTab === 'customer' && (
            <div className="p-6">
              {userProfile ? (
                <div className="bg-white p-5 rounded-2xl border border-charcoal-200 shadow-subtle max-w-2xl text-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
                    <User className="w-4 h-4 text-charcoal-600" />
                    <h4 className="font-semibold text-charcoal-900">
                      Customer Behavioral Profile
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-charcoal-500 block">Full Name</span>
                      <span className="font-medium text-charcoal-900 text-sm">{userProfile.full_name}</span>
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
                      <span className={`font-semibold ${userProfile.chargeback_history_count > 0 ? 'text-rose-600' : 'text-lime-700'}`}>
                        {userProfile.chargeback_history_count} previous disputes
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500 block">Account Risk Tier</span>
                      <span className={`px-2 py-0.5 rounded font-bold inline-block mt-0.5 ${
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
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-charcoal-400">
                  Loading customer risk profile...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
