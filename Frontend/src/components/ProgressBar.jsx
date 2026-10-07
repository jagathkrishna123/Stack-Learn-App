import React from 'react';

const ProgressBar = ({ progress = 0, size = 'md', showLabel = true, color = 'indigo' }) => {
  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    indigo: 'bg-gradient-to-r from-indigo-600 to-violet-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-400',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>Completion Progress</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{roundedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size]} p-0.5 border border-slate-300/60 dark:border-slate-700/50`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${roundedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;