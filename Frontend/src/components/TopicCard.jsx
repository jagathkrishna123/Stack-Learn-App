import React from 'react';
import { FiBookOpen, FiClock, FiFileText, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';

const TopicCard = ({ topic, onEdit, onDelete, onEditNote }) => {
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Intermediate':
        return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'Advanced':
        return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyBadge(topic.difficulty)}`}>
            {topic.difficulty || 'Beginner'}
          </span>

          {topic.readingTime && (
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
              <FiClock className="w-3.5 h-3.5" />
              <span>{topic.readingTime}</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
          {topic.title}
        </h3>

        {topic.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {topic.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        {onEditNote ? (
          <button
            onClick={() => onEditNote(topic)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/15 dark:hover:bg-indigo-600/25 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>Edit Note</span>
          </button>
        ) : (
          <span className="text-xs text-slate-500">Topic #{topic.order}</span>
        )}

        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(topic)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all cursor-pointer"
              title="Edit Topic"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(topic._id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all cursor-pointer"
              title="Delete Topic"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCard;