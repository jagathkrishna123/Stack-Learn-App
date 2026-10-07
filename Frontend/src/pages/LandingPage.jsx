import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiBookOpen, 
  FiLayers, 
  FiShield, 
  FiUserCheck, 
  FiUserPlus, 
  FiLogIn, 
  FiMail, 
  FiLock, 
  FiUser, 
  FiArrowRight, 
  FiCheckCircle, 
  FiBookmark, 
  FiBarChart2, 
  FiZap,
  FiCode
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { stackApi } from '../services/api';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('userLogin'); // 'userLogin', 'userRegister', 'adminLogin'
  const [stacks, setStacks] = useState([]);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [selectedStack, setSelectedStack] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const { adminLogin, internLogin, internRegister, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicStacks();
  }, []);

  const fetchPublicStacks = async () => {
    try {
      const res = await stackApi.getAll().catch(() => null);
      if (res && res.data && res.data.success) {
        setStacks(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStack(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load stacks for landing page:', err);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await internLogin(loginEmail, loginPassword);
      toast.success('Login Successful! Welcome to StackLearn.');
      navigate('/intern/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid user login credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await adminLogin(loginEmail, loginPassword);
      toast.success('Admin Login Successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await internRegister(regName, regEmail, regPassword, selectedStack);
      toast.success('Registration successful! Welcome to your learning portal.');
      navigate('/intern/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToAuth = (tabName = 'userLogin') => {
    setActiveTab(tabName);
    const element = document.getElementById('auth-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight">Stack<span className="text-indigo-400">Learn</span></span>
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest">LMS Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stacks" className="hover:text-white transition-colors">Tech Stacks</a>
            <a href="#auth-section" className="hover:text-white transition-colors">Portal Access</a>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={role === 'admin' ? '/admin/dashboard' : '/intern/dashboard'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <span>Go to Dashboard</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => scrollToAuth('userLogin')}
                  className="px-3.5 py-2 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Log In
                </button>
                <button
                  onClick={() => scrollToAuth('userRegister')}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <FiZap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Generation Developer Learning & Curriculum LMS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
          Master Modern Tech Stacks with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">Interactive Learning</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-10">
          Empowering software engineers and interns through structured curriculum modules, rich documentation notes, progress analytics, and saved bookmarks.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => scrollToAuth('userRegister')}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <span>Start Learning Now</span>
            <FiArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollToAuth('adminLogin')}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 font-bold text-sm rounded-2xl flex items-center space-x-2 transition-all"
          >
            <FiShield className="w-4 h-4 text-amber-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Floating Quick Stat Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <h3 className="text-2xl font-black text-white">Structured</h3>
            <p className="text-xs text-slate-400 mt-0.5">Stack Curriculum</p>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <h3 className="text-2xl font-black text-indigo-400">Rich Notes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quill Text Editor</p>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <h3 className="text-2xl font-black text-emerald-400">Real-Time</h3>
            <p className="text-xs text-slate-400 mt-0.5">Progress Analytics</p>
          </div>
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <h3 className="text-2xl font-black text-amber-400">Bookmarks</h3>
            <p className="text-xs text-slate-400 mt-0.5">Saved Quick Links</p>
          </div>
        </div>
      </section>

      {/* Auth Portal Section (Login & Signup Tabs) */}
      <section id="auth-section" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto z-10">
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tab Selection Headers */}
          <div className="flex items-center justify-between p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab('userLogin')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'userLogin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiLogIn className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>

            <button
              onClick={() => setActiveTab('userRegister')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'userRegister'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiUserPlus className="w-3.5 h-3.5" />
              <span>User Signup</span>
            </button>

            <button
              onClick={() => setActiveTab('adminLogin')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'adminLogin'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>

          {/* TAB 1: USER LOGIN */}
          {activeTab === 'userLogin' && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white">Learner / Intern Sign In</h3>
                <p className="text-xs text-slate-400">Access your assigned stack and progress workspace</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? 'Authenticating...' : 'Sign In as Learner'}
              </button>
            </form>
          )}

          {/* TAB 2: USER SIGNUP */}
          {activeTab === 'userRegister' && (
            <form onSubmit={handleUserRegister} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white">Create New Learner Account</h3>
                <p className="text-xs text-slate-400">Join StackLearn and start mastering technology modules</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {stacks.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Select Technology Stack
                  </label>
                  <select
                    value={selectedStack}
                    onChange={(e) => setSelectedStack(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {stacks.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? 'Creating Account...' : 'Register & Start Learning'}
              </button>
            </form>
          )}

          {/* TAB 3: ADMIN LOGIN */}
          {activeTab === 'adminLogin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white">Admin System Sign In</h3>
                <p className="text-xs text-slate-400">Manage stacks, modules, notes, and intern accounts</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@stacklearn.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Password
                </label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Admin Portal'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Everything You Need for Developer Education</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FiLayers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Stack-Based Curriculum</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize topics into structured modules and stacks like MERN, DevOps, React Native, and Backend Engineering.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <FiCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Quill Rich Note Editor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admins write rich tutorial notes with code blocks, headings, lists, and links; learners read with clean dark-mode typography.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FiBarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learners toggle topics complete/incomplete, track percentage completion bars per module, and view recent activity.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">S</div>
            <span className="font-bold text-white">StackLearn LMS</span>
          </div>
          <p>© {new Date().getFullYear()} StackLearn LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
