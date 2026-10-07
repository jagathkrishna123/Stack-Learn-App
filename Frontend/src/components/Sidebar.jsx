import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiLayout, 
  FiLayers, 
  FiFolder, 
  FiBookOpen, 
  FiFileText, 
  FiUsers, 
  FiBookmark, 
  FiBarChart2, 
  FiLogOut, 
  FiX, 
  FiShield, 
  FiUserCheck 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, role = 'admin' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(role === 'admin' ? '/admin/login' : '/intern/login');
  };

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: FiLayout },
    { label: 'Stacks', path: '/admin/stacks', icon: FiLayers },
    { label: 'Modules', path: '/admin/modules', icon: FiFolder },
    { label: 'Topics', path: '/admin/topics', icon: FiBookOpen },
    { label: 'Note Editor', path: '/admin/notes', icon: FiFileText },
    { label: 'Interns', path: '/admin/interns', icon: FiUsers },
  ];

  const internNavItems = [
    { label: 'Dashboard', path: '/intern/dashboard', icon: FiLayout },
    { label: 'Learning Hub', path: '/intern/learning', icon: FiBookOpen },
    { label: 'Saved Bookmarks', path: '/intern/bookmarks', icon: FiBookmark },
    { label: 'My Progress', path: '/intern/progress', icon: FiBarChart2 },
  ];

  const navItems = role === 'admin' ? adminNavItems : internNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">Stack<span className="text-indigo-400">Learn</span></span>
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {role === 'admin' ? 'Admin Portal' : 'Intern Portal'}
              </span>
            </div>
          </NavLink>

          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card Badge */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</h4>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <div className="p-1 rounded bg-slate-700/50 text-slate-400">
            {role === 'admin' ? <FiShield className="w-3.5 h-3.5 text-amber-400" /> : <FiUserCheck className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const handleNav = () => {
              navigate(item.path);
              onClose();
            };
            return (
              <div
                key={item.path}
                onClick={handleNav}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  location.pathname === item.path
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/40 text-sm font-medium transition-all duration-200"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;