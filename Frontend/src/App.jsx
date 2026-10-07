import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import InternLayout from './layouts/InternLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Landing & Auth Pages
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import InternLogin from './pages/InternLogin';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStacks from './pages/admin/Stacks';
import AdminModules from './pages/admin/Modules';
import AdminTopics from './pages/admin/Topics';
import AdminNotes from './pages/admin/Notes';
import AdminInterns from './pages/admin/Interns';

// Intern Pages
import InternDashboard from './pages/intern/Dashboard';
import InternLearning from './pages/intern/Learning';
import InternBookmarks from './pages/intern/Bookmarks';
import InternProgress from './pages/intern/Progress';

const App = () => {
  return (
    <AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
          }}
        />

        <Routes>
          {/* Landing & Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/intern/login" element={<InternLogin />} />


          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="stacks" element={<AdminStacks />} />
              <Route path="modules" element={<AdminModules />} />
              <Route path="topics" element={<AdminTopics />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="interns" element={<AdminInterns />} />
            </Route>
          </Route>

          {/* Intern Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="intern" />}>
            <Route path="/intern" element={<InternLayout />}>
              <Route index element={<Navigate to="/intern/dashboard" replace />} />
              <Route path="dashboard" element={<InternDashboard />} />
              <Route path="learning" element={<InternLearning />} />
              <Route path="bookmarks" element={<InternBookmarks />} />
              <Route path="progress" element={<InternProgress />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

    </AuthProvider>
  );
};

export default App;