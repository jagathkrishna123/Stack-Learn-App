import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiLayers, 
  FiFolder, 
  FiBookOpen, 
  FiTrendingUp, 
  FiPlus, 
  FiChevronRight,
  FiAward
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { dashboardApi } from '../../services/api';
import Loader, { SkeletonCard } from '../../components/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getAdminStats();
      console.log(res.data, "dashboard response,,,,,");
      
      if (res.data?.success) {
        setStats(res.data.dashboard);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Stacks',
      count: stats?.statistics?.totalStacks || 0,
      icon: FiLayers,
      color: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
      link: '/admin/stacks',
    },
    {
      title: 'Total Modules',
      count: stats?.statistics?.totalModules || 0,
      icon: FiFolder,
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      link: '/admin/modules',
    },
    {
      title: 'Total Topics',
      count: stats?.statistics?.totalTopics || 0,
      icon: FiBookOpen,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      link: '/admin/topics',
    },
    {
      title: 'Active Interns',
      count: stats?.statistics?.totalInterns || 0,
      icon: FiUsers,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      link: '/admin/interns',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            System Control Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2 tracking-tight">
            Welcome to StackLearn Admin Portal
          </h2>
          <p className="text-sm text-slate-300">
            Manage your learning stacks, organize course modules and topics, edit rich note content, and monitor intern completion progress in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/admin/stacks"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create New Stack</span>
            </Link>

            <Link
              to="/admin/interns"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all"
            >
              <FiUsers className="w-4 h-4" />
              <span>Add Intern</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <FiChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">{card.count}</h3>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Intern Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FiUsers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Registered Interns</h3>
            </div>
            <Link to="/admin/interns" className="text-xs font-semibold text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          {stats?.recentInterns?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInterns.map((intern) => (
                <div key={intern._id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                      {intern.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{intern.name}</h4>
                      <p className="text-[11px] text-slate-400">{intern.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {intern.assignedStack?.name || 'Unassigned'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No registered interns found. Click "Add Intern" to create accounts.
            </div>
          )}
        </div>

        {/* Stack Progress Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FiAward className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">Curriculum Stacks</h3>
            </div>
            <Link to="/admin/stacks" className="text-xs font-semibold text-indigo-400 hover:underline">
              Manage Stacks
            </Link>
          </div>

          {stats?.recentStacks?.length > 0 ? (
            <div className="space-y-3">
              {stats?.recentStacks?.map((stack) => (
                <div key={stack._id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                      <FiLayers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{stack?.name}</h4>
                      <p className="text-[11px] text-slate-400">{stack.modulesCount || 0} Modules</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    {stack.internsCount || 0} Interns
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              No stacks created yet. Create a stack to organize modules and topics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;