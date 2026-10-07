import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookmark,
  FiTrash2,
  FiClock,
  FiArrowRight,
  FiBookOpen,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { bookmarkApi } from "../../services/api";
import Loader from "../../components/Loader";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Error loading bookmarks:", err);
      toast.error("Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await bookmarkApi.remove(id);
      if (res.data && res.data.success) {
        toast.success("Bookmark removed.");
        setBookmarks(bookmarks.filter((b) => b._id !== id));
      }
    } catch (err) {
      console.error("Remove bookmark error:", err);
      toast.error(
        err.response?.data?.message || "Failed to remove bookmark."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Saved Bookmarks
        </h2>
        <p className="text-xs text-slate-400">
          Quick reference topics you have bookmarked during learning
        </p>
      </div>

      {/* Bookmarks Grid */}
      {loading ? (
        <Loader text="Loading your bookmarked topics..." />
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bkm) => {
            const topic = bkm.topicId;
            if (!topic) return null;

            return (
              <div
                key={bkm._id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {topic.difficulty || "Beginner"}
                    </span>

                    <button
                      onClick={() => handleRemove(bkm._id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Bookmark"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {topic.title}
                  </h3>

                  {topic.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {topic.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center space-x-1">
                    <FiClock className="w-3.5 h-3.5" />
                    <span>{topic.readingTime || "15 mins"}</span>
                  </span>

                  <Link
                    to={`/intern/learning?topicId=${topic._id}`}
                    className="flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Read Note</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FiBookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookmarks Saved</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When reading topics in the Learning Hub, click the "Bookmark" button
            to save topics here for quick access.
          </p>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
