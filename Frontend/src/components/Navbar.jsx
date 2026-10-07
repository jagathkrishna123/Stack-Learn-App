import React from 'react';
import { FiMenu, FiBell, FiSearch, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onMenuClick, title = 'Dashboard' }) => {
  const { user, role } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Left section: Hamburger button & page title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right section: Search / User Info */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs focus-within:border-indigo-500 transition-all">
          <FiSearch className="w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search topics, stacks..."
            className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-36 lg:w-48 text-xs"
          />
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>

        {/* User Pill */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-semibold text-white">{user?.name || 'User'}</span>
            <span className="block text-[10px] text-indigo-400 font-medium capitalize">{role}</span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;