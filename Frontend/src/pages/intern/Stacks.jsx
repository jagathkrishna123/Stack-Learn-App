import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiLayers, 
  FiSearch, 
  FiBookOpen, 
  FiCheckCircle, 
  FiArrowRight, 
  FiZap,
  FiCheck,
  FiAward
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { stackApi, moduleApi, progressApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader, { SkeletonCard } from '../../components/Loader';

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const Stacks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stacks, setStacks] = useState([]);
  const [modulesCountByStack, setModulesCountByStack] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const userAssignedStackId = typeof user?.assignedStack === 'object' ? user.assignedStack?._id : user?.assignedStack;

  useEffect(() => {
    fetchStacksAndCurriculum();
  }, []);

  const fetchStacksAndCurriculum = async () => {
    try {
      setLoading(true);
      const res = await stackApi.getAll();
      let stacksList = [];
      if (res?.data?.success) {
        stacksList = res.data.stacks || res.data.data || [];
      }
      setStacks(stacksList);

      // Fetch modules count per stack in background
      const counts = {};
      await Promise.all(
        stacksList.map(async (st) => {
          try {
            const mRes = await moduleApi.getByStack(st._id);
            const mList = mRes?.data?.success ? (mRes.data.modules || mRes.data.data || []) : [];
            counts[st._id] = mList.length;
          } catch {
            counts[st._id] = 0;
          }
        })
      );
      setModulesCountByStack(counts);
    } catch (err) {
      console.error('Error fetching stacks for intern catalog:', err);
      toast.error('Failed to load technology stacks.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchStack = (stackId) => {
    navigate(`/intern/learning?stackId=${stackId}`);
  };

  const filteredStacks = stacks.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-white dark:from-indigo-900/50 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 mb-3">
            <FiZap className="w-3.5 h-3.5" />
            <span>Developer Curriculum Catalog</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore All Technology Stacks
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            Switch between full-stack frameworks, backend architectures, mobile development, and cloud DevOps tracks.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tech stacks by name or topic..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {filteredStacks.length} of {stacks.length} Stacks
        </span>
      </div>

      {/* Stacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStacks.map((st) => {
          const isEnrolled = st._id === userAssignedStackId;
          const modCount = modulesCountByStack[st._id] ?? 0;

          const thumbnailSrc = st.thumbnail
            ? (st.thumbnail.startsWith('http')
                ? st.thumbnail
                : `${API_BASE_URL}/uploads/${st.thumbnail.replace(/\\/g, '/')}`)
            : null;

          return (
            <div
              key={st._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 flex items-center justify-center overflow-hidden">
                    {thumbnailSrc ? (
                      <img src={thumbnailSrc} alt={st.name} className="w-full h-full object-cover" />
                    ) : (
                      <FiLayers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>

                  {isEnrolled && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30">
                      <FiCheck className="w-3 h-3 mr-1" />
                      Enrolled
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                  {st.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                  {st.description || 'Comprehensive modular curriculum covering core principles, real-world examples, and tutorial notes.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <FiBookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{modCount} Modules</span>
                </div>

                <button
                  onClick={() => handleLaunchStack(st._id)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all cursor-pointer group-hover:scale-105"
                >
                  <span>Learn Stack</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stacks;
