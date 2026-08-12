'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dispute,
  AgentRun,
  AgentStep,
  AgentVerdict,
  StepEventType,
} from '@/lib/types';
import { formatINR, formatDateTime } from '@/lib/utils';
import { JsonViewer } from './JsonViewer';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  FileText,
  Send,
  SlidersHorizontal,
  Clock,
  Zap,
  Check,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface AgentTraceDrawerProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
  engineMode: 'groq' | 'demo';
  onRunComplete: () => void;
}

export function AgentTraceDrawer({
  dispute,
  isOpen,
  onClose,
  engineMode,
  onRunComplete,
}: AgentTraceDrawerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [activeTab, setActiveTab] = useState<'decision' | 'rebuttal' | 'exhibits'>('decision');
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

  // When drawer opens with a dispute, start investigation if pending or fetch existing run
  useEffect(() => {
    if (isOpen && dispute) {
      setSteps([]);
      setCurrentRun(null);
      setOperatorGuidance('');
      setShowGuidanceInput(false);
      setShowOverrideMenu(false);

      // Start live SSE investigation
      startInvestigation(dispute.id);
    }
  }, [isOpen, dispute?.id]);

  const startInvestigation = async (disputeId: string, customGuidance?: string) => {
    setIsRunning(true);
    setSteps([]);
    setCurrentRun(null);

    try {
      const response = await fetch('/api/agent/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          engineMode,
          operatorGuidance: customGuidance || operatorGuidance,
        }),
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported in response');
      }

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
            } else if (eventType === 'error') {
              console.error('Agent SSE Error:', data);
            }
          }
        }
      }
    } catch (err) {
      console.error('Investigation failed:', err);
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
      console.error('Failed to submit review:', err);
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
      <div className="w-full max-w-5xl bg-[#FAFAFA] h-full shadow-2xl flex flex-col border-l border-charcoal-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-white border-b border-charcoal-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-charcoal-950 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-charcoal-950 tracking-tight">
                  Autonomous Agent Resolver
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-700">
                  {dispute.id}
                </span>
                {isRunning && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-lime-50 text-lime-800 border border-lime-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-ping"></span>
                    Investigating live
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-500">
                {dispute.merchant_name} • {dispute.customer_name} • {formatINR(dispute.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-950 hover:bg-charcoal-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Main Content Area */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-charcoal-200">
          {/* ======================================================== */}
          {/* LEFT PANE: Agent Activity / Decision Trace (5 cols)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-charcoal-200 bg-charcoal-50/70 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-lime-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                  Agent Activity & Decision Trace
                </span>
              </div>
              <span className="text-[11px] font-mono text-charcoal-400">
                {steps.length} steps logged
              </span>
            </div>

            {/* Steps Timeline Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
              {steps.length === 0 && isRunning && (
                <div className="flex flex-col items-center justify-center h-48 text-charcoal-400 text-xs gap-2">
                  <div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Dispatching autonomous agent...</span>
                </div>
              )}

              {steps.map((step, idx) => {
                const isCompletedTool = step.event_type === 'TOOL_COMPLETED';
                const isDecision = step.event_type === 'DECISION_READY';
                const isInvoked = step.event_type === 'TOOL_INVOKED';
                const isEvaluating = step.event_type === 'EVALUATING';

                return (
                  <div
                    key={step.id || idx}
                    className="flex items-start gap-2.5 group animate-fade-in"
                  >
                    {/* Step Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompletedTool && (
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

                    {/* Step Content */}
                    <div className="flex-1 bg-charcoal-50/80 rounded-lg p-2.5 border border-charcoal-200 hover:border-charcoal-300 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-sans text-xs ${
                            isDecision
                              ? 'font-semibold text-charcoal-950'
                              : isCompletedTool
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

                      {/* Expandable JSON Arguments/Results */}
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

            {/* Re-run with Operator Guidance input */}
            <div className="p-3 border-t border-charcoal-200 bg-charcoal-50/50">
              {!showGuidanceInput ? (
                <button
                  onClick={() => setShowGuidanceInput(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-charcoal-600 hover:text-charcoal-950 bg-white border border-charcoal-200 hover:border-charcoal-300 transition-all shadow-subtle"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-charcoal-500" />
                  <span>Rerun with Custom Operator Guidance</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="e.g., Focus specifically on the courier signature OTP match..."
                    value={operatorGuidance}
                    onChange={(e) => setOperatorGuidance(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 font-sans text-charcoal-900"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowGuidanceInput(false)}
                      className="px-2.5 py-1 text-xs text-charcoal-500 hover:text-charcoal-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowGuidanceInput(false);
                        startInvestigation(dispute.id, operatorGuidance);
                      }}
                      disabled={isRunning}
                      className="flex items-center gap-1 px-3 py-1 bg-charcoal-950 hover:bg-charcoal-800 text-white rounded-lg text-xs font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-lime-400" />
                      <span>Rerun Agent</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANE: Resolution Workshop & Evidence (7 cols)      */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 flex flex-col bg-[#FAFAFA] overflow-y-auto">
            {isRunning && !currentRun && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-10 h-10 border-3 border-lime-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <h3 className="text-sm font-semibold text-charcoal-900">
                  Agent Autonomous Loop in Progress
                </h3>
                <p className="text-xs text-charcoal-500 max-w-sm mt-1">
                  Querying gateway databases, third-party logistics APIs, and analyzing customer behavioral history...
                </p>
              </div>
            )}

            {currentRun && (
              <div className="p-6 space-y-6">
                {/* 1. AI Verdict Banner */}
                <div
                  className={`p-5 rounded-xl border shadow-sm transition-all ${
                    effectiveVerdict === 'REPRESENT_DISPUTE'
                      ? 'bg-lime-50/70 border-lime-300 ring-1 ring-lime-400/30'
                      : effectiveVerdict === 'ACCEPT_REFUND'
                      ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/30'
                      : 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {effectiveVerdict === 'REPRESENT_DISPUTE' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse"></span>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                          AI Recommended Resolution
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-charcoal-950 mt-1 tracking-tight">
                        {effectiveVerdict === 'REPRESENT_DISPUTE' && 'Represent Dispute (Reject Customer Claim)'}
                        {effectiveVerdict === 'ACCEPT_REFUND' && 'Accept Dispute (Full Merchant Refund)'}
                        {effectiveVerdict === 'ESCALATE_TO_HUMAN' && 'Escalate to Manual Compliance Desk'}
                      </h3>
                    </div>

                    {/* Confidence Score Pill */}
                    <div className="text-right">
                      <span className="text-2xl font-bold text-charcoal-950 font-mono">
                        {currentRun.confidence_score}%
                      </span>
                      <p className="text-[11px] text-charcoal-500 font-medium">
                        Confidence Score
                      </p>
                    </div>
                  </div>

                  {isApproved && (
                    <div className="mt-3 pt-3 border-t border-lime-200/80 flex items-center gap-1.5 text-xs text-lime-900 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-lime-600" />
                      <span>Approved by Human Operator • Submitted to Card Network</span>
                    </div>
                  )}

                  {isOverridden && (
                    <div className="mt-3 pt-3 border-t border-charcoal-200 flex items-center gap-1.5 text-xs text-charcoal-800 font-medium">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>
                        Overruled by Operator to: {currentRun.human_override_verdict} (
                        {currentRun.human_notes || 'Manual override'})
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. "Why this decision?" Panel (Evidence Checklist) */}
                {currentRun.evaluation && (
                  <div className="bg-white rounded-xl p-5 border border-charcoal-200 shadow-subtle space-y-4">
                    <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-charcoal-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900">
                          Why this decision? (Evidence Assessment)
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-charcoal-500">Evidence Strength:</span>
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

                    {/* Operational Summary */}
                    <p className="text-xs text-charcoal-700 leading-relaxed bg-charcoal-50 p-3 rounded-lg border border-charcoal-200">
                      {currentRun.evaluation.operational_summary}
                    </p>

                    {/* Corroborating Signals Checklist */}
                    {currentRun.evaluation.corroborating_signals.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
                          Corroborating Evidence
                        </span>
                        <ul className="space-y-1.5">
                          {currentRun.evaluation.corroborating_signals.map((sig, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-charcoal-800 font-sans"
                            >
                              <Check className="w-3.5 h-3.5 text-lime-600 mt-0.5 flex-shrink-0" />
                              <span>{sig}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Contradictory or Missing Signals */}
                    {currentRun.evaluation.contradictory_signals.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-charcoal-100">
                        <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                          Risk Flags & Discrepancies
                        </span>
                        <ul className="space-y-1.5">
                          {currentRun.evaluation.contradictory_signals.map((sig, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-xs text-amber-900 font-sans"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{sig}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Structured Representment Package / Rebuttal Tabs */}
                <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle overflow-hidden">
                  <div className="flex items-center border-b border-charcoal-200 bg-charcoal-50/60 px-4">
                    <button
                      onClick={() => setActiveTab('decision')}
                      className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'decision'
                          ? 'border-charcoal-950 text-charcoal-950 font-semibold'
                          : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
                      }`}
                    >
                      Formal Rebuttal Letter
                    </button>
                    <button
                      onClick={() => setActiveTab('exhibits')}
                      className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === 'exhibits'
                          ? 'border-charcoal-950 text-charcoal-950 font-semibold'
                          : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
                      }`}
                    >
                      Key Exhibits (
                      {currentRun.representment_package?.key_exhibits.length || 0})
                    </button>
                  </div>

                  <div className="p-4">
                    {activeTab === 'decision' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-charcoal-500">
                          <span>
                            Editable Representment Draft (Aligned with standard network guidelines)
                          </span>
                          <span className="font-mono text-[11px]">
                            {rebuttalText.length} characters
                          </span>
                        </div>
                        <textarea
                          rows={9}
                          value={rebuttalText}
                          onChange={(e) => setRebuttalText(e.target.value)}
                          className="w-full p-3 font-mono text-xs text-charcoal-800 bg-charcoal-50/50 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white leading-relaxed"
                        />
                      </div>
                    )}

                    {activeTab === 'exhibits' && (
                      <div className="space-y-3">
                        {currentRun.representment_package?.key_exhibits.map((exhibit, i) => (
                          <div
                            key={i}
                            className="p-3 bg-charcoal-50 rounded-lg border border-charcoal-200 flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded bg-white border border-charcoal-200 flex items-center justify-center text-charcoal-700 flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-charcoal-950">
                                  {exhibit.title}
                                </span>
                                <span className="text-[10px] font-mono bg-charcoal-200/60 px-1.5 py-0.5 rounded text-charcoal-700">
                                  {exhibit.category}
                                </span>
                              </div>
                              <p className="text-charcoal-600 mt-0.5 leading-normal">
                                {exhibit.summary}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Human-in-the-Loop Action Workshop Bar */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur p-4 rounded-xl border border-charcoal-200 shadow-modal flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-charcoal-500">
                    <span className="font-medium text-charcoal-900">Human-in-the-Loop Review:</span> Operator approval commits the final resolution to the network and logs to audit trail.
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Override Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                        className="px-3 py-2 rounded-lg text-xs font-medium text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                      >
                        Override Verdict
                      </button>

                      {showOverrideMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-xl border border-charcoal-200 shadow-xl p-3 z-30 space-y-2 text-xs">
                          <p className="font-semibold text-charcoal-900">
                            Operator Decision Override
                          </p>
                          <input
                            type="text"
                            placeholder="Optional reason for override..."
                            value={overrideNotes}
                            onChange={(e) => setOverrideNotes(e.target.value)}
                            className="w-full p-2 border border-charcoal-300 rounded text-xs"
                          />
                          <div className="flex flex-col gap-1 pt-1">
                            <button
                              onClick={() => handleApplyReview('OVERRIDDEN', 'REPRESENT_DISPUTE')}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-lime-50 hover:text-lime-900 text-charcoal-800 font-medium"
                            >
                              Represent Dispute
                            </button>
                            <button
                              onClick={() => handleApplyReview('OVERRIDDEN', 'ACCEPT_REFUND')}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-50 hover:text-rose-900 text-charcoal-800 font-medium"
                            >
                              Accept Full Refund
                            </button>
                            <button
                              onClick={() => handleApplyReview('OVERRIDDEN', 'ESCALATE_TO_HUMAN')}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-amber-50 hover:text-amber-900 text-charcoal-800 font-medium"
                            >
                              Escalate to Compliance
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Approve & Submit CTA */}
                    <button
                      onClick={() => handleApplyReview('APPROVED')}
                      disabled={isSubmittingReview || isApproved}
                      className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-subtle ${
                        isApproved
                          ? 'bg-lime-100 text-lime-800 border border-lime-300 cursor-default'
                          : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-lime-400" />
                      <span>{isApproved ? 'Submitted & Audited' : 'Approve & Submit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
