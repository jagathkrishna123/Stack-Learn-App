import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiPlus, FiFolder, FiX, FiFilter, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { moduleApi, stackApi } from "../../services/api";
import ModuleCard from "../../components/ModuleCard";
import Loader from "../../components/Loader";

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStackId = searchParams.get("stackId") || "";

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    stackId: "",
    title: "",
    description: "",
    order: 1,
    estimatedDuration: "",
    status: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStacks();
  }, []);

  useEffect(() => {
    fetchModules();
  }, [selectedStackId]);

  const fetchStacks = async () => {
    try {
      const res = await stackApi.getAll();
      if (res.data && res.data.success) {
        setStacks(res.data.stacks);
      }
    } catch (err) {
      console.error("Error fetching stacks:", err);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = selectedStackId
        ? await moduleApi.getByStack(selectedStackId)
        : await moduleApi.getAll();
      console.log("fetchModules response", res);
      if (res.data && res.data.success) {
        setModules(res.data.modules);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
      toast.error("Failed to load modules.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingModule(null);
    setFormData({
      stackId:
        selectedStackId || (stacks && stacks.length > 0 ? stacks[0]._id : ""),
      title: "",
      description: "",
      order: (modules ? modules.length : 0) + 1,
      estimatedDuration: "2 Hours",
      status: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (module) => {
    setEditingModule(module);
    setFormData({
      stackId: module.stackId?._id || module.stackId || "",
      title: module.title,
      description: module.description || "",
      order: module.order || 1,
      estimatedDuration: module.estimatedDuration || "",
      status: module.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingModuleId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await moduleApi.delete(deletingModuleId);

      if (res.data && res.data.success) {
        toast.success("Module deleted successfully.");

        setModules(modules.filter((m) => m._id !== deletingModuleId));

        setIsDeleteModalOpen(false);
        setDeletingModuleId(null);
      }
    } catch (err) {
      console.error("Delete module error:", err);

      toast.error(err.response?.data?.message || "Failed to delete module.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.stackId ||
      !formData.title.trim() ||
      !formData.description.trim()
    ) {
      toast.error("Stack, title, and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingModule) {
        const res = await moduleApi.update(editingModule._id, formData);
        if (res.data && res.data.success) {
          toast.success("Module updated successfully!");
          fetchModules();
          setIsModalOpen(false);
        }
      } else {
        const res = await moduleApi.create(formData);
        if (res.data && res.data.success) {
          toast.success("Module created successfully!");
          fetchModules();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Save module error:", err);
      toast.error(err.response?.data?.message || "Failed to save module.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStackFilterChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ stackId: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Curriculum Modules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize modules inside learning stacks
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Module</span>
        </button>
      </div>

      {/* Filter by Stack */}
      <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl max-w-md shadow-sm">
        <FiFilter className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Filter by Stack:
        </label>
        <select
          value={selectedStackId}
          onChange={handleStackFilterChange}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
        >
          <option value="">All Stacks</option>
          {(stacks || []).map((stack) => (
            <option key={stack._id} value={stack._id}>
              {stack.name}
            </option>
          ))}
        </select>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <Loader text="Loading modules..." />
      ) : (modules || []).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(modules || []).map((module) => (
            <ModuleCard
              key={module._id}
              module={module}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              onManageTopics={(mod) =>
                navigate(`/admin/topics?moduleId=${mod._id}`)
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <FiFolder className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Modules Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {selectedStackId
              ? "No modules added to this stack yet."
              : "Get started by creating your first module."}
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingModule ? "Edit Module" : "Create New Module"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Technology Stack *
                </label>
                <select
                  value={formData.stackId}
                  onChange={(e) =>
                    setFormData({ ...formData, stackId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  required
                >
                  <option value="" disabled>
                    Select a Stack
                  </option>
                  {(stacks || []).map((stack) => (
                    <option key={stack._id} value={stack._id}>
                      {stack.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Module 1: Introduction to Node.js"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What will interns learn in this module?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Display Order
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Est. Duration
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedDuration: e.target.value,
                      })
                    }
                    placeholder="e.g., 3 Hours"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? "Saving..."
                    : editingModule
                      ? "Update Module"
                      : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Module?</h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Are you sure you want to delete this module? This action cannot
                be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingModuleId(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
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

export default Modules;
