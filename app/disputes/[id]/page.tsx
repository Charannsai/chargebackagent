'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Dispute } from '@/lib/types';
import { Header } from '@/components/Header';
import { DisputeDetailView } from '@/components/DisputeDetailView';
import { AuditTrailModal } from '@/components/AuditTrailModal';
import { CreateDisputeModal } from '@/components/CreateDisputeModal';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params?.id as string;

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auditDispute, setAuditDispute] = useState<Dispute | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (disputeId) {
      fetchDispute(disputeId);
    }
  }, [disputeId]);

  const fetchDispute = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/disputes?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setDispute(data.dispute || null);
      }
    } catch (err) {
      console.error('Failed to load dispute:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-lime-200 selection:text-lime-950">
      {/* Sleek Floating Header */}
      <Header onOpenCreateModal={() => setIsCreateModalOpen(false)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-charcoal-400">
            <Loader2 className="w-6 h-6 animate-spin text-charcoal-600" />
            <p className="text-xs font-mono">Loading dispute case file...</p>
          </div>
        ) : !dispute ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200 shadow-subtle space-y-4 max-w-md mx-auto my-12">
            <p className="text-sm font-bold text-charcoal-900">Dispute Not Found</p>
            <p className="text-xs text-charcoal-500">
              The dispute with ID <code className="font-mono bg-charcoal-50 px-1.5 py-0.5 rounded">{disputeId}</code> does not exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-950 text-white rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        ) : (
          <DisputeDetailView
            dispute={dispute}
            onBack={() => router.push('/')}
            engineMode="groq"
            onRunComplete={() => fetchDispute(disputeId)}
            onViewAudit={(d) => setAuditDispute(d)}
          />
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="w-full bg-white border-t border-charcoal-100 py-6 mt-12 text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
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
              <span>Charan Sai</span>
            </a>
            <span className="text-charcoal-400">(pathurisai31@gmail.com)</span>
          </div>
        </div>
      </footer>

      {/* Audit Trail Modal */}
      <AuditTrailModal
        dispute={auditDispute}
        isOpen={Boolean(auditDispute)}
        onClose={() => setAuditDispute(null)}
      />

      {/* Webhook Modal */}
      <CreateDisputeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {}}
      />
    </div>
  );
}
