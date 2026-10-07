import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookmark,
  FiTrash2,
  FiClock,
  FiArrowRight,
  FiBookOpen,
  FiLayers,
  FiSearch,
  FiX,
  FiFolder,
  FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { bookmarkApi } from '../../services/api';
import Loader from '../../components/Loader';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStackTab, setActiveStackTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await bookmarkApi.getAll();
      if (res && res.data && res.data.success) {
        setBookmarks(res.data.bookmarks || []);
      } else {
        setBookmarks([]);
      }
    } catch (err) {
      console.error('Error loading bookmarks:', err);
      toast.error('Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await bookmarkApi.remove(id);
      if (res.data && res.data.success) {
        toast.success('Bookmark removed.');
        setBookmarks(prev => prev.filter(b => b._id !== id));
      }
    } catch (err) {
      console.error('Remove bookmark error:', err);
      toast.error(err.response?.data?.message || 'Failed to remove bookmark.');
    }
  };

  // Group bookmarks by Stack
  const { stackGroups, stackTabs, totalValidCount } = useMemo(() => {
    const groups = {};
    let count = 0;

    bookmarks.forEach(bkm => {
      const topic = bkm.topicId;
      if (!topic) return;
      count++;

      const moduleObj = topic.moduleId;
      const stackObj = moduleObj && typeof moduleObj === 'object' ? moduleObj.stackId : null;

      const stackId = stackObj?._id || 'general';
      const stackName = stackObj?.name || 'General Curriculum';
      const stackDesc = stackObj?.description || '';

      if (!groups[stackId]) {
        groups[stackId] = {
          stackId,
          stackName,
          stackDesc,
          items: [],
        };
      }

      groups[stackId].items.push(bkm);
    });

    const tabs = Object.values(groups).map(g => ({
      id: g.stackId,
      name: g.stackName,
      count: g.items.length,
    }));

    return { stackGroups: groups, stackTabs: tabs, totalValidCount: count };
  }, [bookmarks]);

  // Filter bookmarks by active tab and search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = {};

    Object.entries(stackGroups).forEach(([stackId, group]) => {
      if (activeStackTab !== 'ALL' && activeStackTab !== stackId) {
        return;
      }

      const matchingItems = group.items.filter(bkm => {
        const topic = bkm.topicId;
        if (!topic) return false;
        if (!q) return true;

        const titleMatch = topic.title?.toLowerCase().includes(q);
        const descMatch = topic.description?.toLowerCase().includes(q);
        const modTitleMatch = topic.moduleId?.title?.toLowerCase().includes(q);
        return titleMatch || descMatch || modTitleMatch;
      });

      if (matchingItems.length > 0) {
        result[stackId] = {
          ...group,
          items: matchingItems,
        };
      }
    });

    return result;
  }, [stackGroups, activeStackTab, searchQuery]);

  const displayedCount = Object.values(filteredGroups).reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-white dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border border-amber-200/80 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 mb-2">
              <FiBookmark className="w-3.5 h-3.5" />
              <span>Saved Knowledge Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Saved Bookmarks
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Quick access to all topics bookmarked across different technology tracks
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
              <FiBookmark className="w-5 h-5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Saved</span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{totalValidCount} Topics</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Stack Filter Tabs */}
      {totalValidCount > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookmarked topics..."
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {displayedCount} {displayedCount === 1 ? 'bookmark' : 'bookmarks'}
            </span>
          </div>

          {/* Stack Filter Pills */}
          {stackTabs.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveStackTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  activeStackTab === 'ALL'
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>All Stacks</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeStackTab === 'ALL' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {totalValidCount}
                </span>
              </button>

              {stackTabs.map((tab) => {
                const isActive = activeStackTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStackTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <FiLayers className="w-3.5 h-3.5" />
                    <span>{tab.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <Loader text="Loading your bookmarked topics..." />
      ) : totalValidCount === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto">
            <FiBookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Bookmarks Saved Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When exploring topics in the Learning Hub, click the "Bookmark" button to save topics here for rapid reference and revision.
          </p>
          <Link
            to="/intern/learning"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all"
          >
            <FiBookOpen className="w-4 h-4" />
            <span>Go to Learning Hub</span>
          </Link>
        </div>
      ) : displayedCount === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <FiSearch className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching bookmarks</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No saved topics match "{searchQuery}" in this view.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveStackTab('ALL'); }}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Grouped Sections by Stack */
        <div className="space-y-10">
          {Object.values(filteredGroups).map((group) => {
            const stackUrlParam = group.stackId !== 'general' ? `stackId=${group.stackId}&` : '';

            return (
              <div key={group.stackId} className="space-y-4">
                {/* Stack Group Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-amber-500/25">
                      <FiLayers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {group.stackName}
                      </h2>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {group.items.length} {group.items.length === 1 ? 'saved topic' : 'saved topics'}
                      </span>
                    </div>
                  </div>

                  {group.stackId !== 'general' && (
                    <Link
                      to={`/intern/learning?stackId=${group.stackId}`}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center space-x-1 transition-colors"
                    >
                      <span>Open Stack Hub</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Bookmarks Grid for This Stack */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.items.map((bkm) => {
                    const topic = bkm.topicId;
                    if (!topic) return null;
                    const moduleTitle = topic.moduleId?.title;

                    return (
                      <div
                        key={bkm._id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                {topic.difficulty || 'Beginner'}
                              </span>

                              {moduleTitle && (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 max-w-[140px] truncate">
                                  <FiFolder className="w-3 h-3 flex-shrink-0 text-slate-400" />
                                  <span className="truncate">{moduleTitle}</span>
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleRemove(bkm._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer flex-shrink-0"
                              title="Remove Bookmark"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Topic Title */}
                          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">
                            {topic.title}
                          </h3>

                          {/* Topic Description snippet */}
                          {topic.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                              {topic.description}
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-medium">
                            <FiClock className="w-3.5 h-3.5" />
                            <span>{topic.readingTime || '15 mins'}</span>
                          </span>

                          <Link
                            to={`/intern/learning?${stackUrlParam}topicId=${topic._id}`}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 transition-all group-hover:translate-x-0.5"
                          >
                            <span>Read Note</span>
                            <FiArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
