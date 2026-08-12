'use client';

import React, { useState } from 'react';
import { DisputeReason } from '@/lib/types';
import { X, Plus, Sparkles } from 'lucide-react';

interface CreateDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateDisputeModal({
  isOpen,
  onClose,
  onCreated,
}: CreateDisputeModalProps) {
  const [amount, setAmount] = useState('24999');
  const [reason, setReason] = useState<DisputeReason>('PRODUCT_NOT_RECEIVED');
  const [customerName, setCustomerName] = useState('Alok Verma');
  const [customerEmail, setCustomerEmail] = useState('alok.verma@fintechmail.com');
  const [merchantName, setMerchantName] = useState('Apex Gear Store');
  const [deliveryStatus, setDeliveryStatus] = useState<'DELIVERED' | 'IN_TRANSIT' | 'RETURNED_TO_ORIGIN'>('DELIVERED');
  const [threeDsStatus, setThreeDsStatus] = useState<'AUTHENTICATED' | 'NOT_ENROLLED'>('AUTHENTICATED');
  const [isVpnProxy, setIsVpnProxy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount) || 19999,
          reason,
          customer_name: customerName,
          customer_email: customerEmail,
          merchant_name: merchantName,
          delivery_status: deliveryStatus,
          three_ds_status: threeDsStatus,
          is_vpn_or_proxy: isVpnProxy,
        }),
      });

      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to simulate dispute:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-charcoal-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-charcoal-200 flex items-center justify-between bg-charcoal-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-charcoal-950 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-lime-400" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-950 text-sm">
                Simulate Inbound Dispute Webhook
              </h3>
              <p className="text-xs text-charcoal-500">
                Trigger intake of a synthetic payment chargeback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-950 hover:bg-charcoal-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-charcoal-700 mb-1">
                Disputed Amount (INR ₹)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs focus:ring-2 focus:ring-lime-400 focus:bg-white text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-medium text-charcoal-700 mb-1">
                Dispute Reason Code
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DisputeReason)}
                className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs focus:ring-2 focus:ring-lime-400 focus:bg-white text-charcoal-900"
              >
                <option value="PRODUCT_NOT_RECEIVED">Product Not Received</option>
                <option value="FRAUDULENT_TRANSACTION">Fraudulent Transaction</option>
                <option value="SUBSCRIPTION_UNRECOGNIZED">Subscription Unrecognized</option>
                <option value="DUPLICATE_CHARGE">Duplicate Charge</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-charcoal-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs focus:ring-2 focus:ring-lime-400 focus:bg-white text-charcoal-900"
              />
            </div>

            <div>
              <label className="block font-medium text-charcoal-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs focus:ring-2 focus:ring-lime-400 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-charcoal-700 mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs focus:ring-2 focus:ring-lime-400 focus:bg-white text-charcoal-900"
            />
          </div>

          {/* Scenario Simulation Settings */}
          <div className="pt-2 border-t border-charcoal-200 grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-charcoal-700 mb-1">
                Courier Telemetry Status
              </label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value as any)}
                className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs"
              >
                <option value="DELIVERED">Delivered with Signature & OTP</option>
                <option value="IN_TRANSIT">In Transit / Delayed</option>
                <option value="RETURNED_TO_ORIGIN">Returned to Origin (Failed)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-charcoal-700 mb-1">
                3DS Authentication
              </label>
              <select
                value={threeDsStatus}
                onChange={(e) => setThreeDsStatus(e.target.value as any)}
                className="w-full p-2.5 bg-charcoal-50 border border-charcoal-300 rounded-lg text-xs"
              >
                <option value="AUTHENTICATED">3DS 2.0 Authenticated</option>
                <option value="NOT_ENROLLED">3DS Bypassed / Not Enrolled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="vpn_checkbox"
              checked={isVpnProxy}
              onChange={(e) => setIsVpnProxy(e.target.checked)}
              className="rounded text-lime-600 focus:ring-lime-400"
            />
            <label htmlFor="vpn_checkbox" className="text-xs text-charcoal-700 cursor-pointer">
              Simulate flagged foreign VPN / Proxy IP address
            </label>
          </div>

          <div className="pt-3 border-t border-charcoal-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-charcoal-600 hover:text-charcoal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-charcoal-950 hover:bg-charcoal-800 text-white rounded-lg text-xs font-medium shadow-subtle hover:ring-2 hover:ring-lime-400/40"
            >
              <Plus className="w-3.5 h-3.5 text-lime-400" />
              <span>{isSubmitting ? 'Simulating...' : 'Create & Ingest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
