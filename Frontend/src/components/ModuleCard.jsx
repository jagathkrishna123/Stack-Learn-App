import React from 'react';
import { FiFolder, FiClock, FiEdit2, FiTrash2, FiList } from 'react-icons/fi';

const ModuleCard = ({ module, onEdit, onDelete, onManageTopics }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
              #{module.order || 1}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase text-violet-400 tracking-wider">Module</span>
              {module.stackId?.name && (
                <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                  {module.stackId.name}
                </span>
              )}
            </div>
          </div>

          {module.estimatedDuration && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-400 text-xs">
              <FiClock className="w-3.5 h-3.5" />
              <span>{module.estimatedDuration}</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
          {module.title}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          {module.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        {onManageTopics ? (
          <button
            onClick={() => onManageTopics(module)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20 transition-all"
              title="Edit Module"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(module._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
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