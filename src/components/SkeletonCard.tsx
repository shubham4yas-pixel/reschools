/**
 * SkeletonCard.tsx
 * Lightweight skeleton shimmer components for progressive loading.
 * Used across dashboards to replace the global full-screen spinner.
 */

import React from 'react';

const shimmer =
  'animate-pulse bg-muted/60 rounded-lg';

// ─── Generic block ────────────────────────────────────────────────────────────
export const SkeletonBlock = ({
  className = '',
}: {
  className?: string;
}) => <div className={`${shimmer} ${className}`} />;

// ─── Stat card skeleton (matches StatCard dimensions) ─────────────────────────
export const SkeletonStatCard = () => (
  <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
    <div className={`${shimmer} h-4 w-24`} />
    <div className={`${shimmer} h-8 w-16`} />
  </div>
);

// ─── Row skeleton (student list, marks rows) ──────────────────────────────────
export const SkeletonRow = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
        <div className={`${shimmer} w-8 h-8 rounded-lg flex-shrink-0`} />
        <div className="flex-1 space-y-1.5">
          <div className={`${shimmer} h-3.5 w-36`} />
          <div className={`${shimmer} h-3 w-24`} />
        </div>
        <div className={`${shimmer} h-4 w-10`} />
      </div>
    ))}
  </div>
);

// ─── Chart area skeleton ──────────────────────────────────────────────────────
export const SkeletonChart = ({ height = 250 }: { height?: number }) => (
  <div
    className={`${shimmer} w-full rounded-xl`}
    style={{ height }}
  />
);

// ─── Full overview skeleton (matches TeacherOverviewTab layout) ───────────────
export const SkeletonOverview = () => (
  <>
    {/* Stat cards row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[0, 1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
    </div>

    {/* Chart */}
    <div className="bg-card rounded-xl border border-border p-5 mb-6">
      <div className={`${shimmer} h-4 w-48 mb-4`} />
      <SkeletonChart />
    </div>

    {/* Student list */}
    <div className="bg-card rounded-xl border border-border p-5">
      <div className={`${shimmer} h-4 w-32 mb-4`} />
      <SkeletonRow rows={6} />
    </div>
  </>
);
