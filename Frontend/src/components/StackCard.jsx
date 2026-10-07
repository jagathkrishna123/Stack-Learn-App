import React from 'react';
import { FiLayers, FiEdit2, FiTrash2, FiFolder, FiCheck, FiX } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

// const StackCard = ({ stack, onEdit, onDelete, onClick }) => {
//   console.log(stack.thumbnail);
//   const thumbnailSrc = stack.thumbnail
//     ? (stack.thumbnail.startsWith('http') ? stack.thumbnail : `${API_BASE_URL}/${stack.thumbnail.replace(/\\/g, '/')}`)
//     : null;

const StackCard = ({ stack, onEdit, onDelete, onClick }) => {
  console.log("thumbnail:", stack.thumbnail);

  const thumbnailSrc = stack.thumbnail
    ? (
        stack.thumbnail.startsWith("http")
          ? stack.thumbnail
          : `${API_BASE_URL}/uploads/${stack.thumbnail.replace(/\\/g, "/")}`
      )
    : null;

  console.log("thumbnail URL:", thumbnailSrc);
  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center overflow-hidden">
            {thumbnailSrc ? (
              <img src={thumbnailSrc} alt={stack.name} className="w-full h-full object-cover" />
            ) : (
              <FiLayers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                stack.status
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
              }`}
            >
              {stack.status ? <FiCheck className="w-3 h-3 mr-1" /> : <FiX className="w-3 h-3 mr-1" />}
              {stack.status ? 'Active' : 'Disabled'}
            </span>
          </div>
        </div>

        <h3 
          onClick={onClick}
          className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer mb-2"
        >
          {stack.name}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {stack.description || 'No description provided.'}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          Added {new Date(stack.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(stack)}
              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all cursor-pointer"
              title="Edit Stack"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(stack._id)}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all cursor-pointer"
              title="Delete Stack"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StackCard;