import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiCheckCircle, 
  FiBookmark, 
  FiLayers, 
  FiArrowRight, 
  FiClock, 
  FiAward,
  FiZap,
  FiGrid,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { dashboardApi, stackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';
import Loader, { SkeletonCard } from '../../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [allStacks, setAllStacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardAndStacks();
  }, []);

  const fetchDashboardAndStacks = async () => {
    try {
      setLoading(true);
      const [dashRes, stacksRes] = await Promise.all([
        dashboardApi.getInternStats().catch(() => null),
        stackApi.getAll().catch(() => null),
      ]);

      if (dashRes?.data && dashRes.data.success) {
        setData(dashRes.data.data);
      }

      if (stacksRes?.data && stacksRes.data.success) {
        setAllStacks(stacksRes.data.stacks || stacksRes.data.data || []);
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
  const userAssignedStackId = typeof user?.assignedStack === 'object' ? user.assignedStack?._id : user?.assignedStack;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-white dark:from-indigo-900/60 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
              Enrolled: {stack?.name || 'Technology Stack'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome back, {user?.name || 'Intern'}! 👋
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Continue mastering <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{stack?.name}</span>. You've completed {data?.completedTopicsCount || 0} out of {data?.totalTopicsCount || 0} topics in this stack.
          </p>

          <div className="max-w-md bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-6 shadow-sm backdrop-blur-md">
            <ProgressBar progress={progressPercent} color="indigo" size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={stack?._id ? `/intern/learning?stackId=${stack._id}` : '/intern/learning'}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              <FiBookOpen className="w-4 h-4" />
              <span>Continue Learning</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/intern/stacks"
              className="inline-flex items-center space-x-2 px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <FiGrid className="w-4 h-4" />
              <span>Browse All Stacks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
            <FiBookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Topics</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.totalTopicsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Completed Topics</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.completedTopicsCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
            <FiBookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Saved Bookmarks</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{data?.bookmarksCount || 0}</h3>
          </div>
        </div>
      </div>

      {/* Modules Overview Grid for Enrolled Stack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Modules in Your Enrolled Stack</h3>
          <Link
            to={stack?._id ? `/intern/learning?stackId=${stack._id}` : '/intern/learning'}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View in Learning Hub →
          </Link>
        </div>

        {data?.modules?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.modules.map((mod) => (
              <Link
                key={mod._id}
                to={`/intern/learning?stackId=${stack?._id || ''}&moduleId=${mod._id}`}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Module #{mod.order || 1}
                    </span>
                    {mod.estimatedDuration && (
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>{mod.estimatedDuration}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>{mod.topicsCount || 0} Topics</span>
                  <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-semibold">
                    <span>Start Module</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 text-xs shadow-sm">
            No modules assigned yet for this stack.
          </div>
        )}
      </div>

      {/* Explore All Stacks Section */}
      {allStacks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <FiLayers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Explore Other Technology Tracks</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Jump into any tech curriculum stack at any time</p>
            </div>
            <Link to="/intern/stacks" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All ({allStacks.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allStacks.slice(0, 3).map((st) => {
              const isCurrent = st._id === userAssignedStackId;
              return (
                <div
                  key={st._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        <FiLayers className="w-5 h-5" />
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          Enrolled
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                      {st.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {st.description || 'Interactive curriculum modules and structured tutorial notes.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Curriculum Track</span>
                    <button
                      onClick={() => navigate(`/intern/learning?stackId=${st._id}`)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <span>Learn Now</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
