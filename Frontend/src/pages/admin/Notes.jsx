import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFileText, FiSave, FiCheckCircle, FiBookOpen, FiFolder, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { stackApi, moduleApi, topicApi, noteApi } from '../../services/api';
import NoteEditor from '../../components/NoteEditor';
import Loader from '../../components/Loader';

const Notes = () => {
    const [stacks, setStacks] = useState([]);
    const [modules, setModules] = useState([]);
    const [topics, setTopics] = useState([]);

    const [selectedStackId, setSelectedStackId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');

    const [existingNote, setExistingNote] = useState(null);
    const [content, setContent] = useState('');
    const [loadingNote, setLoadingNote] = useState(false);
    const [saving, setSaving] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const topicIdParam = searchParams.get('topicId');

    useEffect(() => {
        fetchStacks();
    }, []);

    useEffect(() => {
        if (selectedStackId) {
            fetchModules(selectedStackId);
        } else {
            setModules([]);
            setTopics([]);
        }
    }, [selectedStackId]);

    useEffect(() => {
        if (selectedModuleId) {
            fetchTopics(selectedModuleId);
        } else {
            setTopics([]);
        }
    }, [selectedModuleId]);

    useEffect(() => {
        if (topicIdParam) {
            setSelectedTopicId(topicIdParam);
        }
    }, [topicIdParam]);

    useEffect(() => {
        if (selectedTopicId) {
            fetchNoteForTopic(selectedTopicId);
        } else {
            setExistingNote(null);
            setContent('');
        }
    }, [selectedTopicId]);

    const fetchStacks = async () => {
        try {
            const res = await stackApi.getAll();
            if (res.data && res.data.success) {
                setStacks(res.data.stacks);
            }
        } catch (err) {
            console.error('Error fetching stacks:', err);
        }
    };

    const fetchModules = async (stackId) => {
        try {
            const res = await moduleApi.getByStack(stackId);
            if (res.data && res.data.success) {
                setModules(res.data.modules);
            }
        } catch (err) {
            console.error('Error fetching modules:', err);
        }
    };

    const fetchTopics = async (moduleId) => {
        try {
            const res = await topicApi.getByModule(moduleId);
            if (res.data && res.data.success) {
                setTopics(res.data.topics);
            }
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    const fetchNoteForTopic = async (topicId) => {
        try {
            setLoadingNote(true);
            const res = await noteApi.getByTopic(topicId);
            if (res.data && res.data.success && res.data.note) {
                setExistingNote(res.data.note);
                setContent(res.data.note.content || '');
            } else {
                setExistingNote(null);
                setContent('');
            }
        } catch (err) {
            // 404 means note not found yet, which is fine
            setExistingNote(null);
            setContent('');
        } finally {
            setLoadingNote(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTopicId) {
            toast.error('Please select a topic first.');
            return;
        }
        if (!content.trim()) {
            toast.error('Note content cannot be empty.');
            return;
        }

        setSaving(true);
        try {
            if (existingNote) {
                const res = await noteApi.update(existingNote._id, { content });
                if (res.data && res.data.success) {
                    toast.success('Note content updated!');
                    setExistingNote(res.data.data);
                }
            } else {
                const res = await noteApi.create({ topicId: selectedTopicId, content });
                if (res.data && res.data.success) {
                    toast.success('Note content created!');
                    setExistingNote(res.data.data);
                }
            }
        } catch (err) {
            console.error('Save note error:', err);
            toast.error(err.response?.data?.message || 'Failed to save note content.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Master Note Editor</h2>
                    <p className="text-xs text-slate-400">Create & edit rich tutorial documentation for topics</p>
                </div>

                {selectedTopicId && (
                    <button
                        onClick={handleSave}
                        disabled={saving || loadingNote}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                    >
                        <FiSave className="w-4 h-4" />
                        <span>{saving ? 'Saving Note...' : 'Save Changes'}</span>
                    </button>
                )}
            </div>

            {/* Selectors Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <FiLayers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Select Stack</span>
                    </label>
                    <select
                        value={selectedStackId}
                        onChange={(e) => {
                            setSelectedStackId(e.target.value);
                            setSelectedModuleId('');
                            setSelectedTopicId('');
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">-- Choose Tech Stack --</option>
                        {(stacks || []).map((stack) => (
                            <option key={stack._id} value={stack._id}>
                                {stack.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <FiFolder className="w-3.5 h-3.5 text-violet-400" />
                        <span>Select Module</span>
                    </label>
                    <select
                        value={selectedModuleId}
                        onChange={(e) => {
                            setSelectedModuleId(e.target.value);
                            setSelectedTopicId('');
                        }}
                        disabled={!selectedStackId}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                        <option value="">-- Choose Module --</option>
                        {(modules || []).map((mod) => (
                            <option key={mod._id} value={mod._id}>
                                {mod.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <FiBookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Select Topic</span>
                    </label>
                    <select
                        value={selectedTopicId}
                        onChange={(e) => {
                            setSelectedTopicId(e.target.value);
                            setSearchParams({ topicId: e.target.value });
                        }}
                        disabled={!selectedModuleId && !topicIdParam}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                        <option value="">-- Choose Topic --</option>
                        {(topics || []).map((t) => (
                            <option key={t._id} value={t._id}>
                                {t.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Editor Area */}
            {selectedTopicId ? (
                loadingNote ? (
                    <Loader text="Loading note content for selected topic..." />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs text-slate-400 font-medium">
                                {existingNote ? (
                                    <span className="text-emerald-400 flex items-center space-x-1">
                                        <FiCheckCircle className="w-3.5 h-3.5" />
                                        <span>Existing note loaded (Version {existingNote.version || 1})</span>
                                    </span>
                                ) : (
                                    <span className="text-amber-400">Creating new note for this topic</span>
                                )}
                            </span>
                        </div>

                        <NoteEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Type rich note markdown, code examples, concepts..."
                        />
                    </div>
                )
            ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center space-y-3">
                    <FiFileText className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No Topic Selected</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Please select a stack, module, and topic from the dropdowns above to edit or compose learning documentation.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Notes;