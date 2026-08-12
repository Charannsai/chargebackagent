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
  ArrowRight,
  Eye,
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

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [hasStartedInvestigation, setHasStartedInvestigation] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(null);
  const [rebuttalText, setRebuttalText] = useState('');
  const [showCaseFactsModal, setShowCaseFactsModal] = useState(false);
  const [operatorGuidance, setOperatorGuidance] = useState('');
  const [showGuidanceInput, setShowGuidanceInput] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState('');

  const traceEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll trace
  useEffect(() => {
    traceEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  // Load dispute context on mount
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
          setHasStartedInvestigation(true);
          if (latest.representment_package?.rebuttal_letter) {
            setRebuttalText(latest.representment_package.rebuttal_letter);
          }
        } else {
          setCurrentRun(null);
          setSteps([]);
          setHasStartedInvestigation(false);
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
    setHasStartedInvestigation(true);
    setSteps([]);
    setCurrentRun(null);

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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 bg-white hover:bg-charcoal-100 border border-charcoal-200 transition-all shadow-subtle group"
        >
          <ArrowLeft className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-950 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dispute Queue</span>
        </button>

        <div className="flex items-center gap-2">
          {hasStartedInvestigation && (
            <button
              onClick={() => setShowCaseFactsModal(!showCaseFactsModal)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-colors shadow-subtle"
            >
              <Eye className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{showCaseFactsModal ? 'Hide Raw Case Facts' : 'View Raw Case Facts'}</span>
            </button>
          )}

          {currentRun && (
            <button
              onClick={() => onViewAudit(dispute)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-colors shadow-subtle"
            >
              <History className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Audit Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* FULL-WIDTH HERO: Dispute Context & Primary Actions  */}
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
                <span className="text-charcoal-400">Network / Deadline:</span> {dispute.network} • Due by {formatDate(dispute.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
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
                : hasStartedInvestigation
                ? 'Re-Run AI Resolver'
                : 'Resolve with AI Agent'}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* CLEAR DISPUTE STORY: Customer Claim vs Merchant Stance */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer's Claim */}
        <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs border border-rose-200">
              !
            </div>
            <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Cardholder's Stated Dispute Issue
            </span>
          </div>
          <p className="text-xs text-charcoal-800 bg-rose-50/40 p-4 rounded-2xl border border-rose-100/80 italic leading-relaxed">
            "{dispute.customer_claim_statement || 'Customer filed a formal chargeback with their bank claiming non-delivery or unauthorized transaction.'}"
          </p>
        </div>

        {/* Merchant's Stance & Evidence Baseline */}
        <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-charcoal-100 text-charcoal-700 flex items-center justify-center font-bold text-xs border border-charcoal-200">
              i
            </div>
            <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              Merchant Fulfillment & Baseline
            </span>
          </div>
          <p className="text-xs text-charcoal-800 bg-charcoal-50 p-4 rounded-2xl border border-charcoal-200/80 leading-relaxed">
            {dispute.merchant_fulfillment_note || 'Order was processed via Razorpay gateway and dispatched via courier partner.'}
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* STAGE 1: BEFORE RUNNING AI (Clean Case File Overview) */}
      {/* ==================================================== */}
      {(!hasStartedInvestigation || showCaseFactsModal) && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
              Case Evidence & Raw Data Files
            </h3>
            {!hasStartedInvestigation && (
              <span className="text-xs text-charcoal-500">
                Click <strong>"Resolve with AI Agent"</strong> to autonomously analyze this case
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* 1. Transaction Telemetry */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3.5">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                <CreditCard className="w-4 h-4 text-charcoal-600" />
                <h4 className="font-bold text-charcoal-900 text-sm">
                  Gateway Payment
                </h4>
              </div>
              {transaction ? (
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
                    <span className="text-charcoal-500">3DS Auth</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${transaction.three_ds_status === 'AUTHENTICATED' ? 'bg-lime-50 text-lime-800 border border-lime-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                      {transaction.three_ds_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">IP Location</span>
                    <span className="font-mono text-charcoal-900">{transaction.ip_country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Proxy/VPN</span>
                    <span className={`font-semibold ${transaction.is_vpn_or_proxy ? 'text-rose-600' : 'text-lime-700'}`}>
                      {transaction.is_vpn_or_proxy ? 'Flagged Proxy' : 'Clean IP'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-charcoal-400">Loading payment facts...</div>
              )}
            </div>

            {/* 2. Courier Telemetry */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3.5">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                <Truck className="w-4 h-4 text-charcoal-600" />
                <h4 className="font-bold text-charcoal-900 text-sm">
                  Courier Logistics
                </h4>
              </div>
              {transaction ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Carrier Partner</span>
                    <span className="font-medium text-charcoal-900">{transaction.shipping_carrier || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Tracking AWB</span>
                    <span className="font-mono font-medium text-charcoal-900">{transaction.shipping_tracking_no || 'N/A'}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-charcoal-500 block mb-0.5">Item Description:</span>
                    <span className="text-charcoal-900 font-medium">{transaction.item_description}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-charcoal-500 block mb-0.5">Destination:</span>
                    <span className="text-charcoal-700 truncate block">{transaction.shipping_address}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-charcoal-400">Loading courier facts...</div>
              )}
            </div>

            {/* 3. Customer Profile */}
            <div className="bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3.5">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                <User className="w-4 h-4 text-charcoal-600" />
                <h4 className="font-bold text-charcoal-900 text-sm">
                  Customer Profile
                </h4>
              </div>
              {userProfile ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Customer Name</span>
                    <span className="font-medium text-charcoal-900">{userProfile.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Lifetime Orders</span>
                    <span className="font-medium text-charcoal-900">{userProfile.total_orders_count} orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Chargeback History</span>
                    <span className={`font-bold ${userProfile.chargeback_history_count > 0 ? 'text-rose-600' : 'text-lime-700'}`}>
                      {userProfile.chargeback_history_count} previous disputes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Risk Tier</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${userProfile.risk_flag === 'LOW' ? 'bg-lime-50 text-lime-800 border border-lime-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                      {userProfile.risk_flag}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-charcoal-400">Loading user facts...</div>
              )}
            </div>
          </div>

          {/* Big CTA Banner when not investigated yet */}
          {!hasStartedInvestigation && (
            <div className="bg-charcoal-950 text-white rounded-3xl p-8 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-lime-400" />
                  <h4 className="text-base font-bold tracking-tight">
                    Trigger Autonomous Agent Investigation
                  </h4>
                </div>
                <p className="text-xs text-charcoal-400 leading-relaxed">
                  The agent will autonomously execute live tool calls against BlueDart/Delhivery APIs, verify cardholder OTP signatures, calculate risk scores, and assemble an auditable representment package.
                </p>
              </div>

              <button
                onClick={() => handleStartInvestigation()}
                disabled={isRunning}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3.5 bg-lime-400 hover:bg-lime-300 text-charcoal-950 rounded-2xl text-xs font-bold transition-all shadow-lime-glow hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-charcoal-950" />
                <span>Start Autonomous Resolution</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* STAGE 2: AFTER RUNNING AI (Live Trace & Workshop)    */}
      {/* ==================================================== */}
      {hasStartedInvestigation && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-lime-600" />
              <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Autonomous AI Investigation & Resolution Workshop
              </h3>
            </div>
            {currentRun && (
              <span className="text-xs font-mono text-charcoal-500">
                Engine: {currentRun.model}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Decision Trace (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle flex flex-col h-[560px]">
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

            {/* Right Column: AI Verdict, Why-This-Decision & Rebuttal (7 cols) */}
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

              {/* "Why this decision?" Evidence Assessment */}
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

              {/* Formal Rebuttal Dossier Preview & Editor */}
              {currentRun && (
                <div className="bg-white rounded-3xl p-6 border border-charcoal-200 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-charcoal-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                        Formal Rebuttal Dossier (Network Packet)
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-charcoal-400">
                      {rebuttalText.length} characters
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={rebuttalText}
                    onChange={(e) => setRebuttalText(e.target.value)}
                    className="w-full p-4 font-mono text-xs text-charcoal-800 bg-charcoal-50/40 border border-charcoal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white leading-relaxed"
                  />
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
        </div>
      )}
    </div>
  );
}
