import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-violet-500/10 border-b-violet-500 animate-spin opacity-70" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {text && <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4 animate-pulse">
    <div className="h-6 bg-slate-700/50 rounded w-1/3"></div>
    <div className="h-4 bg-slate-700/30 rounded w-2/3"></div>
    <div className="h-4 bg-slate-700/30 rounded w-1/2"></div>
  </div>
);

export const SkeletonTable = ({ rows = 4 }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-800 border-b border-slate-700/50"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 border-b border-slate-700/30 px-6 py-4 flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-slate-700/40"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700/40 rounded w-1/4"></div>
          <div className="h-3 bg-slate-700/20 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export default Loader;