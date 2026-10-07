import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiX, FiUpload, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { stackApi } from '../../services/api';
import StackCard from '../../components/StackCard';
import Loader from '../../components/Loader';

const Stacks = () => {
    const [stacks, setStacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStack, setEditingStack] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: true,
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStacks();
    }, []);

    const fetchStacks = async () => {
        try {
            setLoading(true);
            const res = await stackApi.getAll();
            console.log('fetchStacks response', res);
            if (res.data && res.data.success) {
                setStacks(res.data.stacks);
            }
        } catch (error) {
            console.error('Error fetching stacks:', error);
            toast.error('Failed to load stacks.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingStack(null);
        setFormData({ name: '', description: '', status: true });
        setThumbnailFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (stack) => {
        setEditingStack(stack);
        setFormData({
            name: stack.name,
            description: stack.description || '',
            status: stack.status,
        });
        setThumbnailFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this stack? All associated modules and topics may be affected.')) {
            return;
        }

        try {
            const res = await stackApi.delete(id);
            if (res.data && res.data.success) {
                toast.success('Stack deleted successfully.');
                setStacks((stacks || []).filter((s) => s._id !== id));
            }
        } catch (error) {
            console.error('Delete stack error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete stack.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error('Stack name and description are required.');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('status', formData.status);
            if (thumbnailFile) {
                data.append('thumbnail', thumbnailFile);
            }

            if (editingStack) {
                const res = await stackApi.update(editingStack._id, data);
                if (res.data && res.data.success) {
                    // Replace the updated stack in state
                    setStacks(prev => (prev || []).map(s => s._id === editingStack._id ? res.data.stack : s));
                    toast.success('Stack updated successfully!');
                    setIsModalOpen(false);
                }
            } else {
                const res = await stackApi.create(data);
                if (res.data && res.data.success) {
                    // Optimistically add the new stack to the list
                    setStacks(prev => [res.data.stack, ...(prev || [])]);
                    toast.success('Stack created successfully!');
                    setIsModalOpen(false);
                }
            }
        } catch (error) {
            console.error('Stack save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save stack.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStacks = (stacks || []).filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Technology Stacks</h2>
                    <p className="text-xs text-slate-400">Manage curriculum learning tracks & technologies</p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Add New Stack</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search stacks by name or description..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
            </div>

            {/* Stacks Grid */}
            {loading ? (
                <Loader text="Loading technology stacks..." />
            ) : filteredStacks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStacks.map((stack) => (
                        <StackCard
                            key={stack._id}
                            stack={stack}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDelete}
                            onClick={() => navigate(`/admin/modules?stackId=${stack._id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <FiLayers className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No Stacks Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {searchTerm ? 'No stacks match your search term.' : 'Get started by creating your first tech stack.'}
                    </p>
                </div>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-base font-bold text-white">
                                {editingStack ? 'Edit Stack' : 'Create New Stack'}
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
                                    Stack Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., MERN Stack, React Native, DevOps"
                                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Description *
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Provide a comprehensive summary of this technology stack..."
                                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Thumbnail Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="statusToggle"
                                    checked={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="statusToggle" className="text-xs text-slate-300 font-medium">
                                    Active Stack (Visible to assigned interns)
                                </label>
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
                                    {submitting ? 'Saving...' : editingStack ? 'Update Stack' : 'Create Stack'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stacks;