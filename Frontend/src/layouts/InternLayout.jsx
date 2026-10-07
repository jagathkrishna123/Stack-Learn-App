import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const InternLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/intern/learning')) return 'Learning Workspace';
    if (path.includes('/intern/bookmarks')) return 'Saved Bookmarks';
    if (path.includes('/intern/progress')) return 'My Progress Overview';
    return 'Intern Learning Portal';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        role="intern"
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InternLayout;