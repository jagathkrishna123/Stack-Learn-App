import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiBookOpen, FiClock, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { progressApi } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import Loader from '../../components/Loader';

const Progress = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressSummary();
  }, []);

  const fetchProgressSummary = async () => {
    try {
      setLoading(true);
      const res = await progressApi.getSummary();
      console.log("progress", res.data);
    if (res.data && res.data.success) {
  setSummary(res.data.summary);
}
    } catch (err) {
      console.error('Error fetching progress summary:', err);
      toast.error('Failed to load progress summary.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Calculating your curriculum completion stats..." />;
  }

const overallProgress = summary?.percentage || 0;
  return (
    <div className="space-y-8">
      {/* Header Overview Card */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Overall Stack Progress
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-3 tracking-tight">
              {summary?.assignedStack?.name || 'Assigned Curriculum Stack'}
            </h2>
           <p className="text-xs text-slate-400 mt-1">
  Completed {summary?.completedTopics || 0} out of {summary?.totalTopics || 0} topics
</p>
          </div>

          <div className="w-full md:w-80 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <ProgressBar progress={overallProgress} size="lg" color="emerald" />
          </div>
        </div>
      </div>

      {/* Module Breakdown Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <FiBarChart2 className="w-5 h-5 text-indigo-400" />
          <span>Module Progress Breakdown</span>
        </h3>

        {summary?.moduleBreakdown?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summary.moduleBreakdown.map((mod) => {
              const modProgress = mod.totalTopics > 0 
                ? Math.round((mod.completedTopics / mod.totalTopics) * 100) 
                : 0;

              return (
                <div key={mod.moduleId} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Module #{mod.order}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{mod.moduleTitle}</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                      {mod.completedTopics} / {mod.totalTopics} Topics
                    </span>
                  </div>

                  <ProgressBar progress={modProgress} showLabel={false} color="indigo" size="md" />

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>{modProgress}% Completed</span>
                    {modProgress === 100 && (
                      <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        <span>Module Mastered!</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No module progress data recorded yet.
          </div>
        )}
      </div>

      {/* Recent Completed Topics Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <FiAward className="w-5 h-5 text-emerald-400" />
          <span>Recently Completed Topics</span>
        </h3>

        {summary?.recentCompletions?.length > 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            {summary.recentCompletions.map((comp) => (
              <div key={comp._id} className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{comp.topicId?.title || 'Topic Completed'}</h4>
                    <p className="text-[11px] text-slate-400">
                      Completed on {new Date(comp.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-300 font-semibold">
                  Done
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No topics completed yet. Head to the Learning Hub to start studying!
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
