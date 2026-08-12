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
  const [showCaseFacts, setShowCaseFacts] = useState(false);
  const [showRawTelemetry, setShowRawTelemetry] = useState(false);
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

  const handleStartInvestigation = async () => {
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-charcoal-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-charcoal-800 flex items-center gap-2.5 text-xs font-semibold animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-all shadow-subtle group"
        >
          <ArrowLeft className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-950 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Disputes</span>
        </button>

        <div className="flex items-center gap-2">
          {currentRun && (
            <button
              onClick={() => onViewAudit(dispute)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-charcoal-600 hover:text-charcoal-950 bg-white border border-charcoal-200 hover:border-charcoal-300 transition-colors shadow-subtle"
            >
              <History className="w-3.5 h-3.5 text-charcoal-400" />
              <span>Audit Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* UNIFIED HERO CARD: Minimalist, Calm & High-Impact    */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-charcoal-400 uppercase tracking-wider">
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

            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-charcoal-950 font-mono tracking-tight">
                {formatINR(dispute.amount)}
              </span>
              <div className="hidden sm:flex items-center gap-2 text-xs text-charcoal-500 font-medium">
                <span>{dispute.merchant_name}</span>
                <span>•</span>
                <span>{dispute.customer_name}</span>
                <span>•</span>
                <span>Due {formatDate(dispute.due_date)}</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStartInvestigation()}
              disabled={isRunning}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-subtle ${
                isRunning
                  ? 'bg-lime-500 text-white cursor-not-allowed animate-pulse ring-2 ring-lime-400/40'
                  : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/30 hover:scale-[1.01]'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'text-lime-400 fill-lime-400'}`} />
              <span>
                {isRunning
                  ? 'Analyzing Evidence Live...'
                  : hasStartedInvestigation
                  ? 'Re-Run AI Resolver'
                  : 'Start AI Resolution'}
              </span>
            </button>
          </div>
        </div>

        {/* Dispute Claim Summary Strip */}
        <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
              Cardholder Stated Claim
            </span>
            <p className="text-charcoal-800 italic leading-relaxed">
              &quot;{dispute.customer_claim_statement || 'Buyer filed a chargeback claiming non-receipt or unauthorized transaction.'}&quot;
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-charcoal-200 sm:pl-4 flex-shrink-0 text-[11px] text-charcoal-500 space-y-0.5">
            <span className="block font-medium">Fulfillment Baseline</span>
            <span className="font-mono text-charcoal-800 block">
              {transaction?.shipping_carrier ? `${transaction.shipping_carrier} • ${transaction.shipping_tracking_no}` : 'Razorpay Gateway Settled'}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* STAGE 1: BEFORE RUNNING AI (Clean Case Baseline)     */}
      {/* ==================================================== */}
      {!hasStartedInvestigation && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Gateway Payment */}
            <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2.5">
                <CreditCard className="w-4 h-4 text-charcoal-500" />
                <h4 className="font-bold text-charcoal-900">Payment Telemetry</h4>
              </div>
              {transaction ? (
                <div className="space-y-2 text-charcoal-600">
                  <div className="flex justify-between">
                    <span>3DS Challenge</span>
                    <span className={`font-bold ${transaction.three_ds_status === 'AUTHENTICATED' ? 'text-lime-700' : 'text-rose-600'}`}>
                      {transaction.three_ds_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>IP Location</span>
                    <span className="font-mono text-charcoal-900">{transaction.ip_country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proxy / VPN</span>
                    <span className={`font-semibold ${transaction.is_vpn_or_proxy ? 'text-rose-600' : 'text-lime-700'}`}>
                      {transaction.is_vpn_or_proxy ? 'Flagged Proxy' : 'Clean IP'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-charcoal-400">Loading payment facts...</div>
              )}
            </div>

            {/* Courier Logistics */}
            <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2.5">
                <Truck className="w-4 h-4 text-charcoal-500" />
                <h4 className="font-bold text-charcoal-900">Carrier Logistics</h4>
              </div>
              {transaction ? (
                <div className="space-y-2 text-charcoal-600">
                  <div className="flex justify-between">
                    <span>Carrier</span>
                    <span className="font-medium text-charcoal-900">{transaction.shipping_carrier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracking AWB</span>
                    <span className="font-mono text-charcoal-900">{transaction.shipping_tracking_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item</span>
                    <span className="text-charcoal-900 font-medium truncate max-w-[130px]">{transaction.item_description}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-charcoal-400">Loading logistics facts...</div>
              )}
            </div>

            {/* Customer Risk */}
            <div className="bg-white p-5 rounded-3xl border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2.5">
                <User className="w-4 h-4 text-charcoal-500" />
                <h4 className="font-bold text-charcoal-900">Buyer Risk Profile</h4>
              </div>
              {userProfile ? (
                <div className="space-y-2 text-charcoal-600">
                  <div className="flex justify-between">
                    <span>Total Orders</span>
                    <span className="font-medium text-charcoal-900">{userProfile.total_orders_count} orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dispute History</span>
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
                <div className="py-4 text-center text-charcoal-400">Loading profile facts...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* STAGE 2: AFTER RUNNING AI (Calm & Unified View)      */}
      {/* ==================================================== */}
      {hasStartedInvestigation && (
        <div className="space-y-6 animate-fade-in">
          {/* Resolution Result Banner (Calm & Aesthetic) */}
          {currentRun && (
            <div
              className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                effectiveVerdict === 'REPRESENT_DISPUTE'
                  ? 'bg-lime-50/70 border-lime-300 ring-1 ring-lime-400/20'
                  : effectiveVerdict === 'ACCEPT_REFUND'
                  ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300/20'
                  : 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                    {isOverridden ? 'Operator Overridden Verdict' : 'Autonomous AI Recommendation'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal-950 tracking-tight">
                    {effectiveVerdict === 'REPRESENT_DISPUTE' && 'Represent Dispute (Contest Customer Claim)'}
                    {effectiveVerdict === 'ACCEPT_REFUND' && 'Accept Dispute (Issue Full Merchant Refund)'}
                    {effectiveVerdict === 'ESCALATE_TO_HUMAN' && 'Escalate to Manual Compliance Desk'}
                  </h3>
                  {isOverridden && currentRun.human_notes && (
                    <p className="text-xs text-charcoal-600 italic">
                      Supervisor Note: &quot;{currentRun.human_notes}&quot;
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-charcoal-200/60">
                  <span className="text-3xl font-extrabold text-charcoal-950 font-mono">
                    {currentRun.confidence_score}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                    Confidence
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Synthesis & Verification Highlights */}
          {currentRun?.evaluation && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                  Evidence Verification Checklist
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    currentRun.evaluation.evidence_strength === 'HIGH'
                      ? 'bg-lime-100 text-lime-800 border border-lime-300'
                      : currentRun.evaluation.evidence_strength === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  Evidence Strength: {currentRun.evaluation.evidence_strength}
                </span>
              </div>

              <p className="text-xs text-charcoal-700 leading-relaxed">
                {currentRun.evaluation.operational_summary}
              </p>

              {/* Corroborating Signals */}
              {currentRun.evaluation.corroborating_signals.length > 0 && (
                <div className="space-y-2 pt-1">
                  <ul className="space-y-2">
                    {currentRun.evaluation.corroborating_signals.map((sig, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-charcoal-800">
                        <div className="w-4 h-4 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{sig}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contradictory Flags */}
              {currentRun.evaluation.contradictory_signals.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-charcoal-100">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Risk Flags &amp; Discrepancies
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

          {/* Calm Execution Trace Timeline (Collapsible Details) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal-200 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-lime-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                  Autonomous Decision Trace
                </h4>
              </div>
              <button
                onClick={() => setShowRawTelemetry(!showRawTelemetry)}
                className="text-[11px] text-charcoal-500 hover:text-charcoal-950 font-medium flex items-center gap-1 transition-colors"
              >
                <span>{showRawTelemetry ? 'Hide Raw JSON' : 'Show Raw JSON'}</span>
                {showRawTelemetry ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Clean Timeline Steps */}
            <div className="space-y-2.5 font-mono text-xs">
              {steps.map((step, idx) => {
                const isCompleted = step.event_type === 'TOOL_COMPLETED';
                const isDecision = step.event_type === 'DECISION_READY';

                return (
                  <div key={step.id || idx} className="flex items-center justify-between p-3 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isDecision
                          ? 'bg-charcoal-950 text-lime-400'
                          : isCompleted
                          ? 'bg-lime-100 text-lime-700'
                          : 'bg-charcoal-200 text-charcoal-700'
                      }`}>
                        {isCompleted ? '✓' : isDecision ? '★' : '•'}
                      </div>
                      <span className="font-sans font-medium text-charcoal-900 text-xs">
                        {step.label}
                      </span>
                    </div>

                    {step.latency_ms > 0 && (
                      <span className="text-[10px] font-mono text-charcoal-400 bg-white px-2 py-0.5 rounded-lg border border-charcoal-200">
                        {step.latency_ms}ms
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Raw JSON Inspector (When Toggled) */}
            {showRawTelemetry && currentRun && (
              <div className="pt-3 border-t border-charcoal-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
                  Raw Agent Decision Package Payload
                </span>
                <JsonViewer title="Complete AgentRun State" data={currentRun} defaultExpanded={false} />
              </div>
            )}
          </div>

          {/* Formal Rebuttal Dossier Preview */}
          {currentRun && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-charcoal-200 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-charcoal-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
                    Formal Card Network Rebuttal Dossier
                  </h4>
                </div>

                <button
                  onClick={copyRebuttalToClipboard}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl text-charcoal-600 hover:text-charcoal-950 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-colors font-medium"
                >
                  {copiedRebuttal ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-lime-600" />
                      <span className="text-lime-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>Copy Letter</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={7}
                value={rebuttalText}
                onChange={(e) => setRebuttalText(e.target.value)}
                className="w-full p-4 font-mono text-xs text-charcoal-800 bg-charcoal-50/40 border border-charcoal-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white leading-relaxed"
              />
            </div>
          )}

          {/* Human Review Action Bar (Clean & Grounded) */}
          {currentRun && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-charcoal-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-charcoal-500">
                <span className="font-semibold text-charcoal-900">Human-in-the-Loop Safeguard:</span> Review the evidence and sign off to transmit resolution.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                  >
                    Override Verdict
                  </button>

                  {showOverrideMenu && (
                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-2xl border border-charcoal-200 shadow-2xl p-3.5 z-30 space-y-2 text-xs">
                      <p className="font-bold text-charcoal-900">
                        Manual Operator Override
                      </p>
                      <input
                        type="text"
                        placeholder="Reason for override..."
                        value={overrideNotes}
                        onChange={(e) => setOverrideNotes(e.target.value)}
                        className="w-full p-2 border border-charcoal-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-lime-400"
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
                          Escalate to Compliance
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
                      : 'bg-charcoal-950 hover:bg-charcoal-800 text-white hover:ring-2 hover:ring-lime-400/40 hover:scale-[1.01]'
                  }`}
                >
                  <Check className="w-4 h-4 text-lime-400" />
                  <span>{isApproved ? 'Approved & Submitted' : 'Approve & Submit'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
