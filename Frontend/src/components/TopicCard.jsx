import React from 'react';
import { FiBookOpen, FiClock, FiFileText, FiEdit2, FiTrash2, FiAward } from 'react-icons/fi';

const TopicCard = ({ topic, onEdit, onDelete, onEditNote }) => {
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Advanced':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyBadge(topic.difficulty)}`}>
            {topic.difficulty || 'Beginner'}
          </span>

          {topic.readingTime && (
            <div className="flex items-center space-x-1 text-slate-400 text-xs">
              <FiClock className="w-3.5 h-3.5" />
              <span>{topic.readingTime}</span>
            </div>
          )}
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
          {topic.title}
        </h3>

        {topic.description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {topic.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        {onEditNote ? (
          <button
            onClick={() => onEditNote(topic)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 text-xs font-semibold transition-all"
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
              title="Edit Topic"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(topic._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
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