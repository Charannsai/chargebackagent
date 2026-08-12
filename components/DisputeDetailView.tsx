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
import { formatINR, formatDate } from '@/lib/utils';
import { JsonViewer } from './JsonViewer';
import {
  ArrowLeft,
  Play,
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
  History,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
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
  const [activeRightTab, setActiveRightTab] = useState<'verdict' | 'rebuttal' | 'telemetry'>('verdict');
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState('');
  const [copiedRebuttal, setCopiedRebuttal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const traceEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleStepExpand = (stepKey: string) => {
    setExpandedStepIds((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  // Load dispute context on mount
  useEffect(() => {
    if (dispute) {
      fetchDisputeDetails(dispute.id);
    }
  }, [dispute?.id]);

  useEffect(() => {
    if (isRunning && traceEndRef.current) {
      traceEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps.length, isRunning]);

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

  const handleStartInvestigation = async () => {
    if (!dispute) return;
    setIsRunning(true);
    setHasStartedInvestigation(true);
    setSteps([]);
    setCurrentRun(null);
    setActiveRightTab('verdict');

    try {
      const response = await fetch('/api/agent/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: dispute.id,
          engineMode,
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
    if (!dispute) return;
    setIsSubmittingReview(true);

    try {
      const res = await fetch('/api/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: dispute.id,
          runId: currentRun?.id || 'manual',
          action,
          overrideVerdict,
          notes: overrideNotes || undefined,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCurrentRun(result.run);
        setHasStartedInvestigation(true);
        onRunComplete();
        setShowOverrideMenu(false);

        if (result.dispute) {
          dispute.status = result.dispute.status;
        }

        if (overrideVerdict === 'ACCEPT_REFUND') {
          setRebuttalText(
            `RAZORPAY DISPUTE RESOLUTION ADVICE - REFUND RECOMMENDED\nDate: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\nDispute ID: ${dispute.id}\nCardholder: ${dispute.customer_name}\nDisputed Amount: ₹${dispute.amount.toLocaleString('en-IN')}\n\nOPERATOR OVERRIDE ACTION:\nOperator reviewed case facts and determined that accepting this dispute and initiating an immediate credit is the optimal resolution.\n\nReason: ${overrideNotes || 'Manual risk supervisor override'}`
          );
          showToast(`Verdict updated: Accept Full Refund`);
        } else if (overrideVerdict === 'REPRESENT_DISPUTE') {
          setRebuttalText(
            `FORMAL CHARGEBACK REPRESENTMENT REBUTTAL\nDate: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\nMerchant: ${dispute.merchant_name}\nCardholder Name: ${dispute.customer_name}\nARN: ${dispute.arn}\nDisputed Amount: ₹${dispute.amount.toLocaleString('en-IN')}\n\nSTATEMENT OF REBUTTAL:\nThe merchant respectfully contests the chargeback claim. Sufficient authorization and fulfillment evidence exists to validate this transaction.\n\nOperator Note: ${overrideNotes || 'Representment approved by human operator'}`
          );
          showToast(`Verdict updated: Represent Dispute`);
        } else if (overrideVerdict === 'ESCALATE_TO_HUMAN') {
          showToast(`Verdict updated: Escalate to Operations`);
        } else if (action === 'APPROVED') {
          showToast(`Resolution approved & submitted to card network!`);
        }
      }
    } catch (err) {
      console.error('Review submit error:', err);
      showToast('Failed to apply action');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const copyRebuttalToClipboard = () => {
    navigator.clipboard.writeText(rebuttalText);
    setCopiedRebuttal(true);
    setTimeout(() => setCopiedRebuttal(false), 2000);
  };

  const effectiveVerdict = currentRun?.human_override_verdict || currentRun?.final_verdict;
  const isApproved = currentRun?.human_action === 'APPROVED';
  const isOverridden = currentRun?.human_action === 'OVERRIDDEN';

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'PRODUCT_NOT_RECEIVED':
        return { label: 'Product Not Received', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'FRAUDULENT_TRANSACTION':
        return { label: 'Fraud / Unauthorized', color: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'SUBSCRIPTION_UNRECOGNIZED':
        return { label: 'Subscription Unrecognized', color: 'text-blue-800 bg-blue-50 border-blue-200' };
      default:
        return { label: reason.replace(/_/g, ' '), color: 'text-charcoal-800 bg-charcoal-50 border-charcoal-200' };
    }
  };

  const reasonInfo = getReasonLabel(dispute.reason);

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-charcoal-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-charcoal-800 flex items-center gap-2.5 text-xs font-semibold animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. COMPACT HERO BAR (STAYS ANCHORED AT TOP)          */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-charcoal-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Identity, Amount & Claim */}
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-charcoal-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Queue</span>
            </button>

            <span className="font-mono text-xs font-bold text-charcoal-950">
              {dispute.id}
            </span>

            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${reasonInfo.color}`}>
              {reasonInfo.label}
            </span>

            {dispute.status === 'RESOLVED_REPRESENTED' && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-lime-50 text-lime-800 border border-lime-200">
                Represented (Won)
              </span>
            )}
            {dispute.status === 'RESOLVED_REFUNDED' && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                Refund Accepted
              </span>
            )}
            {dispute.status === 'UNDER_INVESTIGATION' && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                Ready for Review
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-charcoal-950 font-mono tracking-tight">
              {formatINR(dispute.amount)}
            </span>
            <span className="text-xs text-charcoal-500">
              {dispute.merchant_name} • {dispute.customer_name} • Due {formatDate(dispute.due_date)}
            </span>
          </div>

          {/* Stated Claim Inline Quote */}
          <p className="text-xs text-charcoal-700 bg-charcoal-50 p-2.5 rounded-xl border border-charcoal-200 italic truncate max-w-2xl">
            &quot;{dispute.customer_claim_statement || 'Buyer filed dispute claiming non-receipt / unauthorized charge.'}&quot;
          </p>
        </div>

        {/* Right: Primary Run Button */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {currentRun && (
            <button
              onClick={() => onViewAudit(dispute)}
              className="p-2.5 rounded-2xl text-charcoal-500 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-colors"
              title="Audit Trail"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleStartInvestigation()}
            disabled={isRunning}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-subtle ${
              isRunning
                ? 'bg-lime-500 text-white cursor-not-allowed animate-pulse ring-2 ring-lime-400/40'
                : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/30 hover:scale-[1.01]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'text-lime-400 fill-lime-400'}`} />
            <span>
              {isRunning
                ? 'Analyzing Telemetry Live...'
                : hasStartedInvestigation
                ? 'Re-Run AI Resolver'
                : 'Start AI Resolution'}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. MAIN COMPACT WORKSPACE (NO SCROLL / FITS VIEWPORT) */}
      {/* ==================================================== */}

      {/* STAGE A: Before running AI (Clean 3-Card Baseline) */}
      {!hasStartedInvestigation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fade-in">
          {/* Payment */}
          <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2.5">
            <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
              <CreditCard className="w-4 h-4 text-charcoal-500" />
              <h4 className="font-bold text-charcoal-900">Payment Telemetry</h4>
            </div>
            {transaction ? (
              <div className="space-y-1.5 text-charcoal-600">
                <div className="flex justify-between">
                  <span>3DS Status</span>
                  <span className={`font-bold ${transaction.three_ds_status === 'AUTHENTICATED' ? 'text-lime-700' : 'text-rose-600'}`}>
                    {transaction.three_ds_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IP Country</span>
                  <span className="font-mono text-charcoal-900">{transaction.ip_country}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proxy Flag</span>
                  <span className={`font-semibold ${transaction.is_vpn_or_proxy ? 'text-rose-600' : 'text-lime-700'}`}>
                    {transaction.is_vpn_or_proxy ? 'Flagged Proxy' : 'Clean IP'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-charcoal-400">Loading telemetry...</div>
            )}
          </div>

          {/* Courier */}
          <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2.5">
            <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
              <Truck className="w-4 h-4 text-charcoal-500" />
              <h4 className="font-bold text-charcoal-900">Logistics Tracking</h4>
            </div>
            {transaction ? (
              <div className="space-y-1.5 text-charcoal-600">
                <div className="flex justify-between">
                  <span>Carrier</span>
                  <span className="font-medium text-charcoal-900">{transaction.shipping_carrier || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>AWB Number</span>
                  <span className="font-mono text-charcoal-900">{transaction.shipping_tracking_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Item</span>
                  <span className="text-charcoal-900 font-medium truncate max-w-[130px]">{transaction.item_description}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-charcoal-400">Loading logistics...</div>
            )}
          </div>

          {/* User */}
          <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-2.5">
            <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
              <User className="w-4 h-4 text-charcoal-500" />
              <h4 className="font-bold text-charcoal-900">Customer Risk</h4>
            </div>
            {userProfile ? (
              <div className="space-y-1.5 text-charcoal-600">
                <div className="flex justify-between">
                  <span>Order Count</span>
                  <span className="font-medium text-charcoal-900">{userProfile.total_orders_count} orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Prior Disputes</span>
                  <span className={`font-bold ${userProfile.chargeback_history_count > 0 ? 'text-rose-600' : 'text-lime-700'}`}>
                    {userProfile.chargeback_history_count} previous
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Level</span>
                  <span className={`font-bold ${userProfile.risk_flag === 'LOW' ? 'text-lime-700' : 'text-rose-600'}`}>
                    {userProfile.risk_flag}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-charcoal-400">Loading customer...</div>
            )}
          </div>
        </div>
      )}

      {/* STAGE B: While/After Running AI (Compact 2-Column Dashboard) */}
      {hasStartedInvestigation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in items-start">
          {/* Left Column: Live Decision Trace Console (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-lime-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                  Decision Trace
                </span>
              </div>
              <span className="text-[11px] font-mono text-charcoal-400">
                {steps.length} steps
              </span>
            </div>

            {/* Trace Steps List with simple, calm styling */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {steps.map((step, idx) => {
                const stepKey = step.id || `step_${idx}`;
                const isExpanded = Boolean(expandedStepIds[stepKey]);
                const isCompleted = step.event_type === 'TOOL_COMPLETED';
                const isDecision = step.event_type === 'DECISION_READY';
                const isInvoked = step.event_type === 'TOOL_INVOKED';
                const isEvaluating = step.event_type === 'EVALUATING';
                const hasDetails = Boolean(step.arguments || step.result || step.tool_name);

                return (
                  <div
                    key={stepKey}
                    className="bg-white hover:bg-charcoal-50/40 border border-charcoal-200/90 rounded-2xl text-xs transition-all overflow-hidden"
                  >
                    {/* Header Click Row */}
                    <div
                      onClick={() => hasDetails && toggleStepExpand(stepKey)}
                      className={`flex items-center justify-between p-3 select-none ${hasDetails ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-5 h-5 rounded-full bg-charcoal-100 text-charcoal-700 flex items-center justify-center text-[10px] flex-shrink-0">
                          {isCompleted ? (
                            <Check className="w-3 h-3 text-charcoal-800 stroke-[2.5]" />
                          ) : isDecision ? (
                            <Shield className="w-3 h-3 text-charcoal-900 stroke-[2]" />
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full ${isEvaluating ? 'bg-charcoal-700 animate-pulse' : 'bg-charcoal-400'}`} />
                          )}
                        </div>
                        <span className="font-sans font-medium text-charcoal-900 truncate">
                          {step.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {step.latency_ms > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-charcoal-50 text-charcoal-500 border-charcoal-200">
                            {step.latency_ms}ms
                          </span>
                        )}

                        {hasDetails && (
                          <div className="text-charcoal-400 hover:text-charcoal-600">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Dropdown Drawer Content */}
                    {isExpanded && hasDetails && (
                      <div className="px-3 pb-3 pt-1 border-t border-charcoal-100 space-y-2 text-[11px] font-mono bg-charcoal-50/50">
                        {step.tool_name && (
                          <div className="flex items-center gap-1 text-[10px] text-charcoal-500">
                            <span className="font-sans font-semibold text-charcoal-700">Tool:</span>
                            <code className="text-charcoal-900 font-semibold bg-white px-1.5 py-0.5 rounded border border-charcoal-200">
                              {step.tool_name}
                            </code>
                          </div>
                        )}

                        {step.arguments && Object.keys(step.arguments).length > 0 && (
                          <div className="space-y-1">
                            <span className="font-sans font-semibold text-[10px] text-charcoal-500 uppercase tracking-wider block">
                              Parameters
                            </span>
                            <pre className="p-2.5 rounded-xl bg-white border border-charcoal-200 text-charcoal-800 text-[10.5px] overflow-x-auto">
                              {JSON.stringify(step.arguments, null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.result && (
                          <div className="space-y-1">
                            <span className="font-sans font-semibold text-[10px] text-charcoal-500 uppercase tracking-wider block">
                              Output Telemetry
                            </span>
                            <pre className="p-2.5 rounded-xl bg-white border border-charcoal-200 text-charcoal-800 text-[10.5px] overflow-x-auto">
                              {JSON.stringify(step.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isRunning && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-charcoal-50 border border-charcoal-200 text-xs text-charcoal-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-charcoal-600 animate-ping" />
                  <span className="font-sans font-medium">
                    Running investigation tool loop...
                  </span>
                </div>
              )}
              <div ref={traceEndRef} />
            </div>
          </div>

          {/* Right Column: Resolution Workshop Deck (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Resolution Header Deck */}
            {currentRun && (
              <div
                className={`p-5 rounded-3xl border transition-all ${
                  effectiveVerdict === 'REPRESENT_DISPUTE'
                    ? 'bg-lime-50/70 border-lime-300 ring-1 ring-lime-400/20'
                    : effectiveVerdict === 'ACCEPT_REFUND'
                    ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/20'
                    : 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">
                      {isOverridden ? 'Operator Override Decision' : 'AI Recommendation'}
                    </span>
                    <h3 className="text-lg font-extrabold text-charcoal-950 tracking-tight">
                      {effectiveVerdict === 'REPRESENT_DISPUTE' && 'Represent Dispute (Reject Customer Claim)'}
                      {effectiveVerdict === 'ACCEPT_REFUND' && 'Accept Dispute (Full Merchant Refund)'}
                      {effectiveVerdict === 'ESCALATE_TO_HUMAN' && 'Escalate to Manual Compliance'}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-charcoal-950 font-mono">
                      {currentRun.confidence_score}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">
                      Confidence
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabbed Resolution Card */}
            <div className="bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle space-y-3">
              {/* Card Tabs */}
              <div className="flex items-center justify-between border-b border-charcoal-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveRightTab('verdict')}
                    className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                      activeRightTab === 'verdict'
                        ? 'bg-charcoal-950 text-white'
                        : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
                    }`}
                  >
                    Evidence Checklist
                  </button>
                  <button
                    onClick={() => setActiveRightTab('rebuttal')}
                    className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                      activeRightTab === 'rebuttal'
                        ? 'bg-charcoal-950 text-white'
                        : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
                    }`}
                  >
                    Rebuttal Letter
                  </button>
                  <button
                    onClick={() => setActiveRightTab('telemetry')}
                    className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                      activeRightTab === 'telemetry'
                        ? 'bg-charcoal-950 text-white'
                        : 'text-charcoal-600 hover:text-charcoal-950 hover:bg-charcoal-50'
                    }`}
                  >
                    Raw Telemetry
                  </button>
                </div>

                {activeRightTab === 'rebuttal' && (
                  <button
                    onClick={copyRebuttalToClipboard}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg text-charcoal-600 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-colors font-medium"
                  >
                    {copiedRebuttal ? (
                      <>
                        <Check className="w-3 h-3 text-lime-600" />
                        <span className="text-lime-700 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-charcoal-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tab 1: Evidence Checklist */}
              {activeRightTab === 'verdict' && (
                <div className="space-y-3 text-xs animate-fade-in">
                  {currentRun?.evaluation ? (
                    <>
                      <p className="text-charcoal-700 leading-relaxed bg-charcoal-50/70 p-3 rounded-2xl border border-charcoal-200/80">
                        {currentRun.evaluation.operational_summary}
                      </p>

                      <ul className="space-y-2">
                        {currentRun.evaluation.corroborating_signals.map((sig, i) => (
                          <li key={i} className="flex items-start gap-2 text-charcoal-800">
                            <div className="w-4 h-4 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>

                      {currentRun.evaluation.contradictory_signals.length > 0 && (
                        <div className="pt-2 border-t border-charcoal-100 space-y-1">
                          <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider block">
                            Risk Flags
                          </span>
                          {currentRun.evaluation.contradictory_signals.map((sig, i) => (
                            <p key={i} className="text-amber-900 text-xs flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                              <span>{sig}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-charcoal-400">Evaluating evidence...</div>
                  )}
                </div>
              )}

              {/* Tab 2: Formal Rebuttal Letter */}
              {activeRightTab === 'rebuttal' && (
                <div className="space-y-2 animate-fade-in">
                  <textarea
                    rows={8}
                    value={rebuttalText}
                    onChange={(e) => setRebuttalText(e.target.value)}
                    className="w-full p-3.5 font-mono text-xs text-charcoal-800 bg-charcoal-50/40 border border-charcoal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 3: Raw Telemetry */}
              {activeRightTab === 'telemetry' && currentRun && (
                <div className="space-y-2 animate-fade-in">
                  <JsonViewer title="Complete AgentRun State" data={currentRun} defaultExpanded={true} />
                </div>
              )}

              {/* Human-in-the-Loop Review Bar (Docked right inside the deck) */}
              {currentRun && (
                <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-charcoal-500 font-medium">
                    Human sign-off required to submit
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                      >
                        Override
                      </button>

                      {showOverrideMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-2xl border border-charcoal-200 shadow-2xl p-3 z-30 space-y-2 text-xs">
                          <p className="font-bold text-charcoal-900">
                            Override Verdict
                          </p>
                          <input
                            type="text"
                            placeholder="Reason..."
                            value={overrideNotes}
                            onChange={(e) => setOverrideNotes(e.target.value)}
                            className="w-full p-2 border border-charcoal-300 rounded-xl text-xs"
                          />
                          <div className="flex flex-col gap-1 pt-1">
                            <button
                              onClick={() => handleApplyReview('OVERRIDDEN', 'REPRESENT_DISPUTE')}
                              className="w-full text-left px-2 py-1 rounded-lg hover:bg-lime-50 text-charcoal-800 font-medium"
                            >
                              Represent Dispute
                            </button>
                            <button
                              onClick={() => handleApplyReview('OVERRIDDEN', 'ACCEPT_REFUND')}
                              className="w-full text-left px-2 py-1 rounded-lg hover:bg-rose-50 text-charcoal-800 font-medium"
                            >
                              Accept Full Refund
                            </button>
                            <button
                              onClick={() => handleApplyReview('OVERRIDDEN', 'ESCALATE_TO_HUMAN')}
                              className="w-full text-left px-2 py-1 rounded-lg hover:bg-amber-50 text-charcoal-800 font-medium"
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
                      className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-subtle ${
                        isApproved
                          ? 'bg-lime-100 text-lime-800 border border-lime-300 cursor-default'
                          : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-lime-400" />
                      <span>{isApproved ? 'Approved' : 'Approve & Submit'}</span>
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
