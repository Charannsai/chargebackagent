import React from 'react';

export function DisputeDetailSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Header Banner Skeleton */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-charcoal-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5 max-w-3xl flex-1">
          {/* Back button & tags */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-7 w-20 rounded-xl skeleton-shimmer" />
            <div className="h-5 w-24 rounded-md skeleton-shimmer" />
            <div className="h-5 w-36 rounded-full skeleton-shimmer" />
            <div className="h-5 w-28 rounded-full skeleton-shimmer" />
          </div>

          {/* Amount & Subtitle */}
          <div className="flex flex-wrap items-baseline gap-3">
            <div className="h-8 w-40 rounded-lg skeleton-shimmer" />
            <div className="h-4 w-64 rounded skeleton-shimmer" />
          </div>

          {/* Claim Box */}
          <div className="h-10 w-full rounded-2xl skeleton-shimmer" />
        </div>

        {/* Action Button Skeleton */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-10 w-36 rounded-2xl skeleton-shimmer" />
          <div className="h-10 w-24 rounded-2xl skeleton-shimmer" />
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Dossier Evidence (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Transaction Record */}
          <div className="bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 rounded skeleton-shimmer" />
              <div className="h-6 w-16 rounded-full skeleton-shimmer" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded skeleton-shimmer" />
              <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
              <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Card 2: Merchant Fulfillment Evidence */}
          <div className="bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-44 rounded skeleton-shimmer" />
              <div className="h-6 w-20 rounded-full skeleton-shimmer" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded skeleton-shimmer" />
              <div className="h-3.5 w-5/6 rounded skeleton-shimmer" />
              <div className="h-3.5 w-2/3 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Card 3: Customer History */}
          <div className="bg-white rounded-3xl p-5 border border-charcoal-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded skeleton-shimmer" />
              <div className="h-6 w-20 rounded-full skeleton-shimmer" />
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-3.5 w-full rounded skeleton-shimmer" />
              <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
            </div>
          </div>
        </div>

        {/* Right Column: AI Defense Verdict (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle overflow-hidden">
            {/* Verdict Header */}
            <div className="p-5 border-b border-charcoal-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md skeleton-shimmer" />
                <div className="h-5 w-44 rounded skeleton-shimmer" />
              </div>
              <div className="h-7 w-28 rounded-xl skeleton-shimmer" />
            </div>

            {/* Tabs */}
            <div className="px-5 pt-3 flex gap-2 border-b border-charcoal-100 pb-3">
              <div className="h-8 w-32 rounded-xl skeleton-shimmer" />
              <div className="h-8 w-36 rounded-xl skeleton-shimmer" />
              <div className="h-8 w-28 rounded-xl skeleton-shimmer" />
            </div>

            {/* Verdict Content Area */}
            <div className="p-6 space-y-4">
              <div className="h-20 w-full rounded-2xl skeleton-shimmer" />
              <div className="space-y-2.5">
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-5/6 rounded skeleton-shimmer" />
                <div className="h-4 w-4/6 rounded skeleton-shimmer" />
                <div className="h-4 w-full rounded skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              </div>

              {/* Action buttons footer */}
              <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
                <div className="h-9 w-32 rounded-xl skeleton-shimmer" />
                <div className="h-9 w-40 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
