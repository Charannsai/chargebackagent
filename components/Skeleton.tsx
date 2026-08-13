import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'light' | 'dark';
}

export function Skeleton({
  className = '',
  variant = 'light',
  ...props
}: SkeletonProps) {
  const shimmerClass =
    variant === 'dark' ? 'skeleton-shimmer-darker' : 'skeleton-shimmer';

  return (
    <div
      className={`rounded-md ${shimmerClass} ${className}`}
      {...props}
    />
  );
}
