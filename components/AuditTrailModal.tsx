'use client';

import React, { useState, useEffect } from 'react';
import { Dispute, AgentRun } from '@/lib/types';
import { formatINR, formatDateTime } from '@/lib/utils';
import { JsonViewer } from './JsonViewer';
import {
  X,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Cpu,
  UserCheck,
  Layers,
} from 'lucide-react';

interface AuditTrailModalProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditTrailModal({
  dispute,
  isOpen,
  onClose,
}: AuditTrailModalProps) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dispute) {
      fetchAuditLogs(dispute.id);
    }
  }, [isOpen, dispute?.id]);

  const fetchAuditLogs = async (disputeId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/audit?disputeId=${disputeId}`);
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
        if (data.runs && data.runs.length > 0) {
          setSelectedRun(data.runs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !dispute) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-950/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl border border-charcoal-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-charcoal-200 flex items-center justify-between bg-charcoal-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-charcoal-950 flex items-center justify-center text-white">
              <History className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-charcoal-950 text-base">
                  Immutable Operational Audit Trail
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-charcoal-200/70 text-charcoal-800">
                  {dispute.id}
                </span>
              </div>
              <p className="text-xs text-charcoal-500">
                Verifiable event log of every LLM tool invocation, parameter, and human review decision.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-950 hover:bg-charcoal-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-charcoal-200">
          {/* Left: Runs List (4 cols) */}
          <div className="md:col-span-4 p-4 overflow-y-auto bg-charcoal-50/30 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 block mb-2">
              Investigation Runs ({runs.length})
            </span>

            {isLoading && (
              <div className="py-8 text-center text-xs text-charcoal-400">
                Loading audit logs...
              </div>
            )}

            {!isLoading && runs.length === 0 && (
              <div className="py-8 text-center text-xs text-charcoal-400">
                No investigation runs recorded for this dispute yet.
              </div>
            )}

            {runs.map((run) => {
              const isSelected = selectedRun?.id === run.id;
              return (
                <div
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-charcoal-950 ring-1 ring-charcoal-950 shadow-sm'
                      : 'bg-white border-charcoal-200 hover:border-charcoal-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-charcoal-900">
                      {run.id.slice(0, 16)}...
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        run.final_verdict === 'REPRESENT_DISPUTE'
                          ? 'bg-lime-100 text-lime-800'
                          : run.final_verdict === 'ACCEPT_REFUND'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {run.final_verdict === 'REPRESENT_DISPUTE' ? 'REPRESENT' : run.final_verdict}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-500">
                    <span>{run.steps.length} tool steps</span>
                    <span>{formatDateTime(run.started_at)}</span>
                  </div>

                  {run.human_action && (
                    <div className="mt-1.5 pt-1.5 border-t border-charcoal-100 flex items-center gap-1 text-[11px] text-charcoal-700">
                      <UserCheck className="w-3 h-3 text-lime-600" />
                      <span>Review: {run.human_action}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Detailed Steps Trace & Metadata (8 cols) */}
          <div className="md:col-span-8 p-6 overflow-y-auto bg-white space-y-5">
            {selectedRun ? (
              <>
                {/* Run Summary Meta */}
                <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">AI Engine</span>
                    <span className="font-medium text-charcoal-900 truncate block">
                      {selectedRun.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">Iterations</span>
                    <span className="font-medium text-charcoal-900 font-mono">
                      {selectedRun.iterations} cycles
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">Confidence</span>
                    <span className="font-medium text-charcoal-900 font-mono">
                      {selectedRun.confidence_score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">Operator Action</span>
                    <span className="font-medium text-charcoal-900 font-mono">
                      {selectedRun.human_action || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Step Sequences */}
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500 block">
                    Execution Steps ({selectedRun.steps.length})
                  </span>

                  {selectedRun.steps.map((step) => (
                    <div
                      key={step.id}
                      className="p-3 bg-white rounded-xl border border-charcoal-200 shadow-subtle space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-charcoal-100 text-charcoal-700 font-mono text-[11px] flex items-center justify-center font-bold">
                            {step.sequence}
                          </span>
                          <span className="font-semibold text-charcoal-900">
                            {step.label}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-charcoal-400">
                          {step.latency_ms > 0 ? `${step.latency_ms}ms • ` : ''}
                          {formatDateTime(step.timestamp)}
                        </span>
                      </div>

                      {step.arguments && Object.keys(step.arguments).length > 0 && (
                        <JsonViewer
                          title={`Tool Arguments: ${step.tool_name}`}
                          data={step.arguments}
                          defaultExpanded={false}
                        />
                      )}

                      {step.result && Object.keys(step.result).length > 0 && (
                        <JsonViewer
                          title={`Tool Execution Result: ${step.tool_name}`}
                          data={step.result}
                          defaultExpanded={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-charcoal-400">
                Select an investigation run to inspect its audit records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
