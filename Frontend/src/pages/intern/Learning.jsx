import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiCheckCircle,
  FiBookmark,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiAward,
  FiMenu,
  FiLayers,
  FiSearch,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiX,
  FiExternalLink,
  FiGrid,
  FiBarChart2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { moduleApi, topicApi, noteApi, progressApi, bookmarkApi, stackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import ProgressBar from '../../components/ProgressBar';

const API_BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const Learning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // All Stacks State
  const [allStacks, setAllStacks] = useState([]);
  const [selectedStackId, setSelectedStackId] = useState('');
  const [selectedStack, setSelectedStack] = useState(null);
  const [showStackModal, setShowStackModal] = useState(false);
  const [stackSearchQuery, setStackSearchQuery] = useState('');

  // Curriculum Data
  const [modules, setModules] = useState([]);
  const [topicsByModule, setTopicsByModule] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [completedTopicIds, setCompletedTopicIds] = useState(new Set());

  // Active Topic & Note State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStackCurriculum, setLoadingStackCurriculum] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const urlTopicId = searchParams.get('topicId');
  const urlStackId = searchParams.get('stackId');

  // 1. Initial Load: Fetch All Stacks & User Progress
  useEffect(() => {
    initializeWorkspace();
  }, []);

  // 2. When selectedStackId changes or URL stackId changes, reload curriculum
  useEffect(() => {
    if (selectedStackId) {
      loadStackCurriculum(selectedStackId, urlTopicId);
    }
  }, [selectedStackId]);

  const initializeWorkspace = async () => {
    try {
      setLoadingInitial(true);

      // Fetch all stacks
      const stackRes = await stackApi.getAll().catch(() => null);
      let stacksList = [];
      if (stackRes?.data?.success) {
        stacksList = stackRes.data.stacks || stackRes.data.data || [];
      }
      setAllStacks(stacksList);

      // Fetch user's completed progress set
      const progRes = await progressApi.getInternProgress().catch(() => null);
      if (progRes?.data?.success && Array.isArray(progRes.data.progress)) {
        const completedSet = new Set(
          progRes.data.progress.filter(p => p.completed).map(p => (typeof p.topicId === 'object' ? p.topicId?._id : p.topicId))
        );
        setCompletedTopicIds(completedSet);
      }

      // Determine initial stack ID:
      // 1. From URL param ?stackId=...
      // 2. From user's assignedStack
      // 3. Fallback to first available stack
      let targetStackId = urlStackId;
      if (!targetStackId && user?.assignedStack) {
        targetStackId = typeof user.assignedStack === 'object' ? user.assignedStack._id : user.assignedStack;
      }
      if (!targetStackId && stacksList.length > 0) {
        targetStackId = stacksList[0]._id;
      }

      if (targetStackId) {
        setSelectedStackId(targetStackId);
        const match = stacksList.find(s => s._id === targetStackId);
        if (match) setSelectedStack(match);
      }
    } catch (err) {
      console.error('Error initializing learning workspace:', err);
      toast.error('Failed to initialize learning hub.');
    } finally {
      setLoadingInitial(false);
    }
  };

  const loadStackCurriculum = async (stackId, autoSelectTopicId = null) => {
    try {
      setLoadingStackCurriculum(true);
      const currentStackObj = allStacks.find(s => s._id === stackId);
      if (currentStackObj) setSelectedStack(currentStackObj);

      // Fetch modules for this stack
      const modRes = await moduleApi.getByStack(stackId);
      const rawMods = modRes?.data?.success ? (modRes.data.modules || modRes.data.data || []) : [];
      const modsList = Array.isArray(rawMods) ? rawMods : [];
      setModules(modsList);

      // Fetch topics for each module
      const topicsMap = {};
      const expandMap = {};

      for (const mod of modsList) {
        expandMap[mod._id] = true; // Auto expand all modules
        const topRes = await topicApi.getByModule(mod._id).catch(() => null);
        if (topRes?.data?.success) {
          topicsMap[mod._id] = topRes.data.topics || topRes.data.data || [];
        } else {
          topicsMap[mod._id] = [];
        }
      }

      setTopicsByModule(topicsMap);
      setExpandedModules(expandMap);

      // Topic Selection Logic:
      const allTopicsFlat = Object.values(topicsMap).flat();

      if (autoSelectTopicId) {
        const match = allTopicsFlat.find(t => t._id === autoSelectTopicId);
        if (match) {
          const parentMod = modsList.find(m => topicsMap[m._id]?.some(t => t._id === match._id));
          handleSelectTopic(match, parentMod);
          return;
        }
      }

      // Default: select first topic of first module with topics
      if (modsList.length > 0) {
        for (const mod of modsList) {
          if (topicsMap[mod._id]?.length > 0) {
            handleSelectTopic(topicsMap[mod._id][0], mod);
            break;
          }
        }
      } else {
        setSelectedTopic(null);
        setSelectedModule(null);
        setCurrentNote(null);
      }
    } catch (err) {
      console.error('Failed to load stack curriculum:', err);
      toast.error('Could not load modules for selected stack.');
    } finally {
      setLoadingStackCurriculum(false);
    }
  };

  const handleSwitchStack = (stackId) => {
    setSelectedStackId(stackId);
    const stackObj = allStacks.find(s => s._id === stackId);
    if (stackObj) setSelectedStack(stackObj);
    setSearchParams({ stackId });
    setShowStackModal(false);
    toast.success(`Switched to ${stackObj?.name || 'Stack'}!`);
  };

  const handleSelectTopic = async (topic, parentModule = null) => {
    setSelectedTopic(topic);
    if (parentModule) {
      setSelectedModule(parentModule);
    } else {
      const foundMod = modules.find(m => topicsByModule[m._id]?.some(t => t._id === topic._id));
      setSelectedModule(foundMod || null);
    }

    setSearchParams({ stackId: selectedStackId, topicId: topic._id });
    setSidebarOpenMobile(false);

    setLoadingNote(true);
    try {
      // 1. Fetch topic Note
      const noteRes = await noteApi.getByTopic(topic._id).catch(() => null);
      if (noteRes && noteRes.data && noteRes.data.success) {
        setCurrentNote(noteRes.data.note || noteRes.data.data || null);
      } else {
        setCurrentNote(null);
      }

      // 2. Fetch completion status
      const progRes = await progressApi.getTopicProgress(topic._id).catch(() => null);
      if (progRes?.data?.success) {
        setIsCompleted(progRes.data.data?.completed || progRes.data.progress?.completed || false);
      } else {
        setIsCompleted(completedTopicIds.has(topic._id));
      }

      // 3. Fetch bookmark status
      const bkmRes = await bookmarkApi.check(topic._id).catch(() => null);
      if (bkmRes && bkmRes.data && bkmRes.data.success) {
        setIsBookmarked(bkmRes.data.isBookmarked || false);
      } else {
        setIsBookmarked(false);
      }
    } catch (err) {
      console.error('Error fetching topic note & meta:', err);
    } finally {
      setLoadingNote(false);
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleToggleComplete = async () => {
    if (!selectedTopic) return;
    setActionLoading(true);
    try {
      if (isCompleted) {
        const res = await progressApi.markIncomplete(selectedTopic._id);
        if (res.data && res.data.success) {
          setIsCompleted(false);
          setCompletedTopicIds(prev => {
            const next = new Set(prev);
            next.delete(selectedTopic._id);
            return next;
          });
          toast.success('Marked topic as incomplete.');
        }
      } else {
        const res = await progressApi.markComplete(selectedTopic._id);
        if (res.data && res.data.success) {
          setIsCompleted(true);
          setCompletedTopicIds(prev => new Set(prev).add(selectedTopic._id));
          toast.success('Topic marked as completed! 🎉');
        }
      }
    } catch (err) {
      console.error('Toggle complete error:', err);
      toast.error('Failed to update progress.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!selectedTopic) return;
    setActionLoading(true);
    try {
      if (isBookmarked) {
        const res = await bookmarkApi.removeByTopic(selectedTopic._id);
        if (res.data && res.data.success) {
          setIsBookmarked(false);
          toast.success('Removed from bookmarks.');
        }
      } else {
        const res = await bookmarkApi.add(selectedTopic._id);
        if (res.data && res.data.success) {
          setIsBookmarked(true);
          toast.success('Topic saved to bookmarks!');
        }
      }
    } catch (err) {
      console.error('Toggle bookmark error:', err);
      toast.error('Failed to update bookmark.');
    } finally {
      setActionLoading(false);
    }
  };

  // Ordered list of all topics in current curriculum for Prev/Next navigation
  const flatTopicSequence = useMemo(() => {
    const list = [];
    modules.forEach(mod => {
      const tops = topicsByModule[mod._id] || [];
      tops.forEach(top => {
        list.push({ ...top, module: mod });
      });
    });
    return list;
  }, [modules, topicsByModule]);

  const currentTopicIndex = flatTopicSequence.findIndex(t => t._id === selectedTopic?._id);
  const prevTopic = currentTopicIndex > 0 ? flatTopicSequence[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex >= 0 && currentTopicIndex < flatTopicSequence.length - 1 ? flatTopicSequence[currentTopicIndex + 1] : null;

  // Total topics & completed stats for current stack
  const totalStackTopicsCount = flatTopicSequence.length;
  const completedInCurrentStack = flatTopicSequence.filter(t => completedTopicIds.has(t._id)).length;
  const currentStackProgressPercent = totalStackTopicsCount > 0 ? Math.round((completedInCurrentStack / totalStackTopicsCount) * 100) : 0;

  // Filtered topics by search keyword
  const filteredTopicsByModule = useMemo(() => {
    if (!topicSearchTerm.trim()) return topicsByModule;
    const term = topicSearchTerm.toLowerCase();
    const result = {};
    modules.forEach(mod => {
      const rawList = topicsByModule[mod._id] || [];
      result[mod._id] = rawList.filter(t => t.title.toLowerCase().includes(term) || (t.difficulty && t.difficulty.toLowerCase().includes(term)));
    });
    return result;
  }, [topicsByModule, modules, topicSearchTerm]);

  // Filtered stacks for modal
  const filteredStacks = useMemo(() => {
    if (!stackSearchQuery.trim()) return allStacks;
    const q = stackSearchQuery.toLowerCase();
    return allStacks.filter(s => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)));
  }, [allStacks, stackSearchQuery]);

  if (loadingInitial) {
    return <Loader text="Initializing your developer learning workspace..." />;
  }

  const userAssignedStackId = typeof user?.assignedStack === 'object' ? user.assignedStack?._id : user?.assignedStack;

  return (
    <div className="space-y-5">
      {/* Top Stack Selector & Hub Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <FiLayers className="w-7 h-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                Current Stack
              </span>
              {selectedStackId === userAssignedStackId && (
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center space-x-1">
                  <FiCheck className="w-3 h-3" />
                  <span>Your Enrolled Stack</span>
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedStack?.name || 'Curriculum Workspace'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
              {selectedStack?.description || 'Select a topic from the curriculum outline to start learning.'}
            </p>
          </div>
        </div>

        {/* Stack Switcher Button & Progress Mini Card */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden xl:flex flex-col items-end pr-3 border-r border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Stack Completion</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{currentStackProgressPercent}%</span>
              <span className="text-xs text-slate-400">({completedInCurrentStack}/{totalStackTopicsCount})</span>
            </div>
          </div>

          <button
            onClick={() => setShowStackModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center space-x-2 transition-all cursor-pointer group"
          >
            <FiGrid className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Switch Stack ({allStacks.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar + Topic Reader) */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-14rem)] gap-6 relative">
        {/* Mobile Curriculum Toggle */}
        <button
          onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
          className="lg:hidden w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between shadow-sm cursor-pointer"
        >
          <span className="flex items-center space-x-2">
            <FiMenu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Curriculum Modules ({modules.length})</span>
          </span>
          <FiChevronDown className={`w-4 h-4 transition-transform ${sidebarOpenMobile ? 'rotate-180' : ''}`} />
        </button>

        {/* Curriculum Outline Sidebar */}
        <aside
          className={`w-full lg:w-80 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col space-y-3 shadow-sm transition-all ${
            sidebarOpenMobile ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Header with Search & Stats */}
          <div className="px-2 pt-1 pb-2 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Curriculum Outline</h3>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {modules.length} Modules • {totalStackTopicsCount} Topics
                </span>
              </div>

              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {currentStackProgressPercent}%
              </span>
            </div>

            {/* Quick Topic Search Filter */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={topicSearchTerm}
                onChange={(e) => setTopicSearchTerm(e.target.value)}
                placeholder="Search topics in stack..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {topicSearchTerm && (
                <button
                  onClick={() => setTopicSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <FiX className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Module & Topic Accordion List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[72vh] pr-1">
            {loadingStackCurriculum ? (
              <div className="py-12 text-center">
                <span className="inline-block w-6 h-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></span>
                <p className="text-xs text-slate-400 mt-2">Loading modules...</p>
              </div>
            ) : modules.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <FiLayers className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Modules in this Stack</h4>
                <p className="text-[11px] text-slate-500">Try switching to another technology stack.</p>
                <button
                  onClick={() => setShowStackModal(true)}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Switch Stack
                </button>
              </div>
            ) : (
              modules.map((mod, modIdx) => {
                const isExpanded = expandedModules[mod._id];
                const topicsList = filteredTopicsByModule[mod._id] || [];
                const rawTopicsList = topicsByModule[mod._id] || [];
                const completedInMod = rawTopicsList.filter(t => completedTopicIds.has(t._id)).length;
                const isModDone = rawTopicsList.length > 0 && completedInMod === rawTopicsList.length;

                return (
                  <div
                    key={mod._id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/60 dark:bg-slate-950/40 shadow-xs"
                  >
                    <button
                      onClick={() => toggleModuleExpand(mod._id)}
                      className="w-full px-3.5 py-2.5 bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 overflow-hidden pr-2">
                        {isExpanded ? (
                          <FiChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        ) : (
                          <FiChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {modIdx + 1}. {mod.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        {isModDone ? (
                          <span className="p-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
                            <FiCheck className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                            {completedInMod}/{rawTopicsList.length}
                          </span>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-1.5 space-y-1">
                        {topicsList.length === 0 ? (
                          <p className="text-[11px] text-slate-400 py-2 px-3 italic">
                            {topicSearchTerm ? 'No matching topics' : 'No topics added yet'}
                          </p>
                        ) : (
                          topicsList.map((top) => {
                            const isSelected = selectedTopic?._id === top._id;
                            const isTopCompleted = completedTopicIds.has(top._id);

                            return (
                              <button
                                key={top._id}
                                onClick={() => handleSelectTopic(top, mod)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/25 dark:text-indigo-200 dark:border-indigo-500/40 font-bold shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate pr-2">
                                  {isTopCompleted ? (
                                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                  ) : (
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                  )}
                                  <span className="truncate">{top.title}</span>
                                </div>

                                {top.readingTime && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 font-medium">
                                    {top.readingTime}
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Topic Reader Workspace */}
        <main className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm transition-all">
          {selectedTopic ? (
            <div className="space-y-6">
              {/* Breadcrumbs & Meta Bar */}
              <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStack?.name}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-xs">{selectedModule?.title || 'Curriculum'}</span>
                  <FiChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-xs">
                    {selectedTopic.title}
                  </span>
                </div>

                {/* Topic Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                        {selectedTopic.difficulty || 'Beginner'}
                      </span>
                      {selectedTopic.readingTime && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-medium">
                          <FiClock className="w-3.5 h-3.5" />
                          <span>{selectedTopic.readingTime}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {selectedTopic.title}
                    </h2>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <button
                      onClick={handleToggleBookmark}
                      disabled={actionLoading}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                      }`}
                    >
                      <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                      <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>

                    <button
                      onClick={handleToggleComplete}
                      disabled={actionLoading}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all shadow-sm cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 dark:hover:bg-indigo-500 shadow-indigo-600/20'
                      }`}
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>{isCompleted ? 'Completed ✓' : 'Mark as Completed'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Content View */}
              {loadingNote ? (
                <div className="py-20">
                  <Loader text="Loading topic documentation..." />
                </div>
              ) : currentNote?.content ? (
                <div
                  className="prose-dark leading-relaxed text-sm min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: currentNote.content }}
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 my-8">
                  <FiFileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">No Notes Published Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    The instructors have not published tutorial notes for this topic yet. You can still mark it as completed or proceed to the next topic.
                  </p>
                </div>
              )}

              {/* Bottom Next / Prev Navigation Bar */}
              <div className="pt-8 mt-12 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {prevTopic ? (
                  <button
                    onClick={() => handleSelectTopic(prevTopic, prevTopic.module)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <div className="text-left">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Previous Topic</span>
                      <span className="line-clamp-1 max-w-[200px]">{prevTopic.title}</span>
                    </div>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextTopic ? (
                  <button
                    onClick={() => handleSelectTopic(nextTopic, nextTopic.module)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-between sm:justify-start space-x-3 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] text-indigo-200 font-semibold uppercase">Next Topic</span>
                      <span className="line-clamp-1 max-w-[200px]">{nextTopic.title}</span>
                    </div>
                    <FiArrowRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-center sm:text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                      <FiAward className="w-4 h-4" />
                      <span>Curriculum Complete! Great job.</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <FiBookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Choose a Topic to Begin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Select any topic from the curriculum outline on the left or switch to another technology stack to explore and master new skills.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* STACK SWITCHER MODAL */}
      {showStackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-all">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <FiLayers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select Technology Stack</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose a curriculum stack to explore and master</p>
                </div>
              </div>

              <button
                onClick={() => setShowStackModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={stackSearchQuery}
                onChange={(e) => setStackSearchQuery(e.target.value)}
                placeholder="Search technology stacks (e.g., MERN, DevOps, Python)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Stacks Grid / List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
              {filteredStacks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No stacks match "{stackSearchQuery}"
                </div>
              ) : (
                filteredStacks.map((st) => {
                  const isCurrent = st._id === selectedStackId;
                  const isEnrolled = st._id === userAssignedStackId;

                  return (
                    <div
                      key={st._id}
                      onClick={() => handleSwitchStack(st._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isCurrent
                          ? 'bg-indigo-50/80 border-indigo-300 dark:bg-indigo-600/20 dark:border-indigo-500/40 shadow-sm'
                          : 'bg-slate-50/60 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                        }`}>
                          <FiLayers className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {st.name}
                            </h4>
                            {isEnrolled && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                Enrolled
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {st.description || 'Full curriculum modules and tutorial notes.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                        }`}>
                          {isCurrent ? 'Viewing Now' : 'Select Stack →'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learning;
