import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Map route pathname to Page Title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/stacks')) return 'Manage Stacks';
    if (path.includes('/admin/modules')) return 'Manage Modules';
    if (path.includes('/admin/topics')) return 'Manage Topics';
    if (path.includes('/admin/notes')) return 'Note Editor';
    if (path.includes('/admin/interns')) return 'Manage Interns';
    return 'Admin Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        role="admin"
      />

      {/* Main Content Area */}
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

export default AdminLayout;