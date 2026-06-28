import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-slate-100" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-5 bg-slate-100 rounded w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        
        {/* Button Skeleton */}
        <div className="pt-2">
          <div className="h-10 bg-slate-100 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
};
