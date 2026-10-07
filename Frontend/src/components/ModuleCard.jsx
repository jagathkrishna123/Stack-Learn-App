import React from 'react';
import { FiFolder, FiClock, FiEdit2, FiTrash2, FiList } from 'react-icons/fi';

const ModuleCard = ({ module, onEdit, onDelete, onManageTopics }) => {
  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-400 flex items-center justify-center font-bold text-sm">
              #{module.order || 1}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-violet-600 dark:text-violet-400 tracking-wider">Module</span>
              {module.stackId?.name && (
                <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400">
                  {module.stackId.name}
                </span>
              )}
            </div>
          </div>

          {module.estimatedDuration && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs">
              <FiClock className="w-3.5 h-3.5" />
              <span>{module.estimatedDuration}</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors mb-2">
          {module.title}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {module.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        {onManageTopics ? (
          <button
            onClick={() => onManageTopics(module)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
          >
            <FiList className="w-4 h-4" />
            <span>Manage Topics</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500 font-medium">
            Order: {module.order}
          </span>
        )}

        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(module)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:text-slate-400 dark:hover:text-violet-400 dark:hover:bg-violet-500/10 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20 transition-all cursor-pointer"
              title="Edit Module"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(module._id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all cursor-pointer"
              title="Delete Module"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;