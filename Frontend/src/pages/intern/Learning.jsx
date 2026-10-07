import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiBookOpen,
  FiCheckCircle,
  FiBookmark,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiAward,
  FiMenu
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { moduleApi, topicApi, noteApi, progressApi, bookmarkApi, stackApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const Learning = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [topicsByModule, setTopicsByModule] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [loadingNote, setLoadingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTopicIdParam = searchParams.get('topicId');
  const activeModuleIdParam = searchParams.get('moduleId');

  useEffect(() => {
    fetchModulesAndTopics();
  }, []);

  const fetchModulesAndTopics = async () => {
    try {
      setLoadingWorkspace(true);

      // Determine the stack ID to use:
      // 1) Use intern's assignedStack (could be an object with _id or a plain string ID)
      // 2) Fall back to first stack from API
      let targetStackId = null;

      if (user?.assignedStack) {
        targetStackId = typeof user.assignedStack === 'object'
          ? user.assignedStack._id
          : user.assignedStack;
      }

      if (!targetStackId) {
        const stackRes = await stackApi.getAll();
        const stacks = (stackRes?.data?.success) ? (stackRes.data.stacks || []) : [];
        if (stacks.length === 0) {
          setModules([]);
          setTopicsByModule({});
          setExpandedModules({});
          return;
        }
        targetStackId = stacks[0]._id;
      }

      console.log("Using stack ID:", targetStackId);

      // Fetch modules for the target stack
      const modRes = await moduleApi.getByStack(targetStackId);
      console.log("MODULE RESPONSE:", modRes.data);
      const rawMods = (modRes?.data?.success) ? (modRes.data.modules || []) : [];
      const modsList = Array.isArray(rawMods) ? rawMods : [];
      setModules(modsList);

      // Fetch topics for each module
      const topicsMap = {};
      const expandMap = {};
      for (const mod of modsList) {
        expandMap[mod._id] = true;
        const topRes = await topicApi.getByModule(mod._id);
        console.log("TOPIC RESPONSE for", mod.title, ":", topRes.data);
        if (topRes?.data?.success) {
          topicsMap[mod._id] = topRes.data.topics || [];
        } else {
          topicsMap[mod._id] = [];
        }
      }
      setTopicsByModule(topicsMap);
      setExpandedModules(expandMap);

      // Auto-select topic from param or first available
      if (activeTopicIdParam) {
        const foundTopic = Object.values(topicsMap).flat().find((t) => t._id === activeTopicIdParam);
        if (foundTopic) {
          handleSelectTopic(foundTopic);
        }
      } else if (modsList.length > 0 && topicsMap[modsList[0]._id]?.length > 0) {
        handleSelectTopic(topicsMap[modsList[0]._id][0]);
      }
    } catch (err) {
      console.error('Error initializing workspace:', err);
      toast.error('Failed to load learning workspace.');
    } finally {
      setLoadingWorkspace(false);
    }
  };


  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setSearchParams({ topicId: topic._id });
    setSidebarOpenMobile(false);

    // Fetch Note, Completion status, Bookmark status
    setLoadingNote(true);
    try {
      // 1. Fetch note
      const noteRes = await noteApi.getByTopic(topic._id).catch(() => null);
      console.log("NOTE RESPONSE:", noteRes?.data);
      if (noteRes && noteRes.data && noteRes.data.success) {
        setCurrentNote(noteRes.data.note);
      } else {
        setCurrentNote(null);
      }

      // 2. Fetch completion status
      const progRes = await progressApi.getTopicProgress(topic._id).catch(() => null);
      if (progRes && progRes.data && progRes.data.success) {
        setIsCompleted(progRes.data.data?.completed || false);
      } else {
        setIsCompleted(false);
      }

      // 3. Fetch bookmark status
      const bkmRes = await bookmarkApi.check(topic._id).catch(() => null);
      if (bkmRes && bkmRes.data && bkmRes.data.success) {
        setIsBookmarked(bkmRes.data.isBookmarked || false);
      } else {
        setIsBookmarked(false);
      }
    } catch (err) {
      console.error('Error fetching topic details:', err);
    } finally {
      setLoadingNote(false);
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleToggleComplete = async () => {
    if (!selectedTopic) return;
    setActionLoading(true);
    try {
      if (isCompleted) {
        const res = await progressApi.markIncomplete(selectedTopic._id);
        if (res.data && res.data.success) {
          setIsCompleted(false);
          toast.success('Marked topic as incomplete.');
        }
      } else {
        const res = await progressApi.markComplete(selectedTopic._id);
        if (res.data && res.data.success) {
          setIsCompleted(true);
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

  if (loadingWorkspace) {
    return <Loader text="Loading modules and topics workspace..." />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] gap-6 relative">
      {/* Mobile Toggle Button for Curriculum Sidebar */}
      <button
        onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
        className="lg:hidden w-full py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-between"
      >
        <span className="flex items-center space-x-2">
          <FiMenu className="w-4 h-4 text-indigo-400" />
          <span>Curriculum Modules Navigation</span>
        </span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${sidebarOpenMobile ? 'rotate-180' : ''}`} />
      </button>

      {/* Curriculum Accordion Sidebar */}
      <aside
        className={`w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 transition-all ${sidebarOpenMobile ? 'block' : 'hidden lg:block'
          }`}
      >
        <div className="px-2 py-1 border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curriculum Outline</h3>
          <span className="text-[11px] font-semibold text-indigo-400">{modules.length} Modules</span>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto max-h-[70vh]">
          {modules.map((mod) => {
            const isExpanded = expandedModules[mod._id];
            const topicsList = topicsByModule[mod._id] || [];

            return (
              <div key={mod._id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <button
                  onClick={() => toggleModuleExpand(mod._id)}
                  className="w-full px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <FiChevronDown className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    ) : (
                      <FiChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white line-clamp-1">{mod.title}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                    {topicsList.length}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-1 space-y-1 divide-y divide-slate-900/40">
                    {topicsList.map((top) => {
                      const isSelected = selectedTopic?._id === top._id;
                      return (
                        <button
                          key={top._id}
                          onClick={() => handleSelectTopic(top)}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all ${isSelected
                              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                        >
                          <span className="truncate pr-2">{top.title}</span>
                          <span className="text-[10px] text-slate-500 flex-shrink-0">{top.readingTime || ''}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Topic Reader Panel */}
      <div className="flex-1 bg-black border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
        {selectedTopic ? (
          <div className="space-y-6">
            {/* Header / Meta Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {selectedTopic.difficulty || 'Beginner'}
                  </span>
                  {selectedTopic.readingTime && (
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>{selectedTopic.readingTime}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  {selectedTopic.title}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleBookmark}
                  disabled={actionLoading}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${isBookmarked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                >
                  <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>

                <button
                  onClick={handleToggleComplete}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all shadow-md ${isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-indigo-600/30'
                    }`}
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{isCompleted ? 'Completed ✓' : 'Mark as Completed'}</span>
                </button>
              </div>
            </div>

            {/* Note Content View */}
            {loadingNote ? (
              <Loader text="Loading topic documentation..." />
            ) : currentNote?.content ? (
              <div
                className="prose-dark leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: currentNote.content }}
              />
            ) : (
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <FiFileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">No Notes Published Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The admin has not added tutorial notes for this topic yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-16 text-center space-y-3 my-auto">
            <FiBookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Select a Topic</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Choose a topic from the curriculum sidebar on the left to start reading notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
