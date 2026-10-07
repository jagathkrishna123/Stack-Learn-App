import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiCheckCircle, 
  FiBookmark, 
  FiLayers, 
  FiArrowRight, 
  FiClock, 
  FiAward 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';
import Loader, { SkeletonCard } from '../../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getInternStats();
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading intern dashboard:', err);
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const stack = data?.assignedStack;
  const progressPercent = data?.progressPercentage || 0;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Enrolled Stack: {stack?.name || 'Assigned Stack'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2 tracking-tight">
            Welcome back, {user?.name || 'Intern'}! 👋
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Continue your learning journey in <span className="text-indigo-400 font-semibold">{stack?.name}</span>. You've completed {data?.completedTopicsCount || 0} out of {data?.totalTopicsCount || 0} topics.
          </p>

          <div className="max-w-md bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6 backdrop-blur-md">
            <ProgressBar progress={progressPercent} color="indigo" size="md" />
          </div>

          <Link
            to="/intern/learning"
            className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <FiBookOpen className="w-4 h-4" />
            <span>Continue Learning</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Topics</span>
            <h3 className="text-2xl font-extrabold text-white">{data?.totalTopicsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Completed Topics</span>
            <h3 className="text-2xl font-extrabold text-white">{data?.completedTopicsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
            <FiBookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Saved Bookmarks</span>
            <h3 className="text-2xl font-extrabold text-white">{data?.bookmarksCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Modules Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Modules in Your Stack</h3>
          <Link to="/intern/learning" className="text-xs font-semibold text-indigo-400 hover:underline">
            View All in Learning Hub
          </Link>
        </div>

        {data?.modules?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.modules.map((mod) => (
              <Link
                key={mod._id}
                to={`/intern/learning?moduleId=${mod._id}`}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Module #{mod.order || 1}
                    </span>
                    {mod.estimatedDuration && (
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1 bg-slate-800 px-2 py-0.5 rounded">
                        <FiClock className="w-3 h-3" />
                        <span>{mod.estimatedDuration}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors mb-2">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{mod.topicsCount || 0} Topics</span>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Start Module</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No modules assigned yet for this stack.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
