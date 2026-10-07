import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiBookOpen,
  FiX,
  FiFilter,
  FiTrash2
} from 'react-icons/fi';import toast from "react-hot-toast";
import { topicApi, moduleApi } from "../../services/api";
import TopicCard from "../../components/TopicCard";
import Loader from "../../components/Loader";

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedModuleId = searchParams.get("moduleId") || "";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    moduleId: "",
    title: "",
    description: "",
    difficulty: "Beginner",
    readingTime: "15 mins",
    order: 1,
    status: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [selectedModuleId]);

  const fetchModules = async () => {
    try {
      const res = await moduleApi.getAll();
      if (res.data && res.data.success) {
        setModules(res.data.modules);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = selectedModuleId
        ? await topicApi.getByModule(selectedModuleId)
        : await topicApi.getAll();
      if (res.data && res.data.success) {
        setTopics(res.data.topics);
      }
    } catch (err) {
      console.error("Error fetching topics:", err);
      toast.error("Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTopic(null);
    setFormData({
      moduleId:
        selectedModuleId ||
        (modules && modules.length > 0 ? modules[0]._id : ""),
      title: "",
      description: "",
      difficulty: "Beginner",
      readingTime: "15 mins",
      order: (topics ? topics.length : 0) + 1,
      status: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic) => {
    setEditingTopic(topic);
    setFormData({
      moduleId: topic.moduleId?._id || topic.moduleId || "",
      title: topic.title,
      description: topic.description || "",
      difficulty: topic.difficulty || "Beginner",
      readingTime: topic.readingTime || "",
      order: topic.order || 1,
      status: topic.status,
    });
    setIsModalOpen(true);
  };

const handleDelete = (id) => {
  setDeletingTopicId(id);
  setIsDeleteModalOpen(true);
};

const confirmDelete = async () => {
  try {
    const res = await topicApi.delete(deletingTopicId);

    if (res.data && res.data.success) {
      toast.success('Topic deleted successfully.');

      setTopics(
        topics.filter((t) => t._id !== deletingTopicId)
      );

      setIsDeleteModalOpen(false);
      setDeletingTopicId(null);
    }
  } catch (err) {
    console.error('Delete topic error:', err);

    toast.error(
      err.response?.data?.message || 'Failed to delete topic.'
    );
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.moduleId || !formData.title.trim()) {
      toast.error("Module and title are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTopic) {
        const res = await topicApi.update(editingTopic._id, formData);
        if (res.data && res.data.success) {
          toast.success("Topic updated successfully!");
          fetchTopics();
          setIsModalOpen(false);
        }
      } else {
        const res = await topicApi.create(formData);
        if (res.data && res.data.success) {
          toast.success("Topic created successfully!");
          fetchTopics();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Save topic error:", err);
      toast.error(err.response?.data?.message || "Failed to save topic.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModuleFilterChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ moduleId: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Curriculum Topics
          </h2>
          <p className="text-xs text-slate-400">
            Manage individual topics & learning objectives
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Filter by Module */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-3 rounded-xl max-w-md">
        <FiFilter className="w-4 h-4 text-indigo-400" />
        <label className="text-xs font-semibold text-slate-300">
          Filter by Module:
        </label>
        <select
          value={selectedModuleId}
          onChange={handleModuleFilterChange}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Modules</option>
          {(modules || []).map((mod) => (
            <option key={mod._id} value={mod._id}>
              {mod.title}
            </option>
          ))}
        </select>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <Loader text="Loading topics..." />
      ) : (topics || []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(topics || []).map((topic) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              onEditNote={(t) => navigate(`/admin/notes?topicId=${t._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <FiBookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Topics Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {selectedModuleId
              ? "No topics created in this module yet."
              : "Get started by creating your first topic."}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingTopic ? "Edit Topic" : "Create New Topic"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Module *
                </label>
                <select
                  value={formData.moduleId}
                  onChange={(e) =>
                    setFormData({ ...formData, moduleId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>
                    Select a Module
                  </option>
                  {(modules || []).map((mod) => (
                    <option key={mod._id} value={mod._id}>
                      {mod.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Async/Await and Promises in Depth"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief overview of topic content..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Reading Time
                  </label>
                  <input
                    type="text"
                    value={formData.readingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readingTime: e.target.value })
                    }
                    placeholder="e.g., 20 mins"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingTopic
                      ? "Update Topic"
                      : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
{isDeleteModalOpen && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">

      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
        <FiTrash2 className="w-6 h-6 text-rose-400" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-white">
          Delete Topic?
        </h3>

        <p className="text-sm text-slate-400 mt-2">
          Are you sure you want to delete this topic?
          This action cannot be undone.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">

        <button
          type="button"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setDeletingTopicId(null);
          }}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={confirmDelete}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all"
        >
          Delete
        </button>

      </div>
    </div>
  </div>
)}
    </div>
    
  );
};

export default Topics;
