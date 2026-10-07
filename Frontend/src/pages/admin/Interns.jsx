import React, { useEffect, useState } from 'react';
import { FiUsers, FiPlus, FiX, FiKey, FiEdit2, FiTrash2, FiSearch, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { internApi, stackApi } from '../../services/api';
import Loader from '../../components/Loader';

const Interns = () => {
    const [interns, setInterns] = useState([]);
    const [stacks, setStacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
    const [editingIntern, setEditingIntern] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        assignedStack: '',
        isActive: true,
    });

    const [resetPassData, setResetPassData] = useState({
        internId: '',
        internName: '',
        newPassword: '',
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInterns();
        fetchStacks();
    }, []);

    const fetchInterns = async () => {
        try {
            setLoading(true);
            const res = await internApi.getAll();
            console.log(res, "intern response");
            
            if (res.data && res.data.success) {
                setInterns(res.data.interns);
            }
        } catch (err) {
            console.error('Error fetching interns:', err);
            toast.error('Failed to load interns.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStacks = async () => {
        try {
            const res = await stackApi.getAll();
            console.log(res.data, "stack response");
            
            if (res.data && res.data.success) {
                setStacks(res.data.stacks);
            }
        } catch (err) {
            console.error('Error fetching stacks:', err);
        }
    };

    const handleOpenAddModal = () => {
        setEditingIntern(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            assignedStack: stacks[0]?._id || '',
            isActive: true,
        });
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (intern) => {
        setEditingIntern(intern);
        setFormData({
            name: intern.name,
            email: intern.email,
            password: '', // blank unless updating
            assignedStack: intern.assignedStack?._id || intern.assignedStack || '',
            isActive: intern.isActive,
        });
        setIsAddEditModalOpen(true);
    };

    const handleOpenResetPassModal = (intern) => {
        setResetPassData({
            internId: intern._id,
            internName: intern.name,
            newPassword: '',
        });
        setIsResetPassModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this intern account?')) return;
        try {
            const res = await internApi.delete(id);
            console.log(res, "delete response");
            
            if (res.data && res.data.success) {
                toast.success('Intern deleted successfully.');
                setInterns(interns.filter((i) => i._id !== id));
            }
        } catch (err) {
            console.error('Delete intern error:', err);
            toast.error(err.response?.data?.message || 'Failed to delete intern.');
        }
    };

    const handleAddEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.assignedStack) {
            toast.error('Name, email, and assigned stack are required.');
            return;
        }

        if (!editingIntern && !formData.password) {
            toast.error('Password is required for new intern accounts.');
            return;
        }

        setSubmitting(true);
        try {
            if (editingIntern) {
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    assignedStack: formData.assignedStack,
                    isActive: formData.isActive,
                };
                const res = await internApi.update(editingIntern._id, payload);
                if (res.data && res.data.success) {
                    toast.success('Intern details updated!');
                    fetchInterns();
                    setIsAddEditModalOpen(false);
                }
            } else {
                const res = await internApi.create(formData);
                if (res.data && res.data.success) {
                    toast.success('Intern account created successfully!');
                    fetchInterns();
                    setIsAddEditModalOpen(false);
                }
            }
        } catch (err) {
            console.error('Save intern error:', err);
            toast.error(err.response?.data?.message || 'Failed to save intern.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassSubmit = async (e) => {
        e.preventDefault();
        if (!resetPassData.newPassword || resetPassData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await internApi.resetPassword(resetPassData.internId, {
    password: resetPassData.newPassword,
});
            if (res.data && res.data.success) {
                toast.success(`Password reset for ${resetPassData.internName}`);
                setIsResetPassModalOpen(false);
            }
        } catch (err) {
            console.error('Reset password error:', err);
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredInterns = (interns || []).filter((i) =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("Stacks:", stacks);
console.log("Type:", typeof stacks);

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Intern Accounts</h2>
                    <p className="text-xs text-slate-400">Manage intern enrollments & assigned tech stacks</p>
                </div>

                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
                >
                    <FiPlus className="w-4 h-4" />
                    <span>Register New Intern</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search interns by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
            </div>

            {/* Interns Table */}
            {loading ? (
                <Loader text="Loading intern accounts..." />
            ) : filteredInterns.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-3.5">Intern Name</th>
                                    <th className="px-6 py-3.5">Assigned Stack</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Last Login</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredInterns.map((intern) => (
                                    <tr key={intern._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center justify-center">
                                                    {intern.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-xs">{intern.name}</div>
                                                    <div className="text-slate-400 text-[11px]">{intern.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold text-[11px]">
                                                {intern.assignedStack?.name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${intern.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    }`}
                                            >
                                                {intern.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-[11px]">
                                            {intern.lastLogin ? new Date(intern.lastLogin).toLocaleString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenResetPassModal(intern)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
                                                    title="Reset Password"
                                                >
                                                    <FiKey className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEditModal(intern)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20"
                                                    title="Edit Details"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(intern._id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
                                                    title="Delete Account"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                    <FiUsers className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No Intern Accounts</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {searchTerm ? 'No interns match your search filter.' : 'Register new intern accounts to give them access to curriculum stacks.'}
                    </p>
                </div>
            )}

            {/* Add / Edit Intern Modal */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-base font-bold text-white">
                                {editingIntern ? 'Edit Intern Details' : 'Register New Intern'}
                            </h3>
                            <button
                                onClick={() => setIsAddEditModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Alex Johnson"
                                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="alex@example.com"
                                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            {!editingIntern && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                        Initial Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="At least 6 characters"
                                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    Assigned Technology Stack *
                                </label>
                                <select
                                    value={formData.assignedStack}
                                    onChange={(e) => setFormData({ ...formData, assignedStack: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                                    required
                                >
                                    <option value="" disabled>Select Stack</option>
                                    {stacks.map((stack) => (
                                        <option key={stack._id} value={stack._id}>
                                            {stack.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {editingIntern && (
                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="internActiveToggle"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <label htmlFor="internActiveToggle" className="text-xs text-slate-300 font-medium">
                                        Account Active (Allowed to login)
                                    </label>
                                </div>
                            )}

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddEditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingIntern ? 'Update Details' : 'Create Intern'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {isResetPassModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                            <h3 className="text-base font-bold text-white">
                                Reset Password for {resetPassData.internName}
                            </h3>
                            <button
                                onClick={() => setIsResetPassModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    value={resetPassData.newPassword}
                                    onChange={(e) => setResetPassData({ ...resetPassData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 6 chars)"
                                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsResetPassModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 disabled:opacity-50"
                                >
                                    {submitting ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Interns;