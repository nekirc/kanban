'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, AlignLeft, BarChart2, Tag as TagIcon, Check, CheckSquare, Plus, Trash2, History, Edit3, Eye, Paperclip, File as FileIcon, ExternalLink, Zap } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaskModalProps {
  task: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

export function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY'>('DETAILS');
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [storyPoints, setStoryPoints] = useState(task.storyPoints || 0);
  const [checklists, setChecklists] = useState(task.checklists || []);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [tags, setTags] = useState(task.tags || []);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [activities, setActivities] = useState([]);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#5B6CFF');
  const [showTagInput, setShowTagInput] = useState(false);

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetch(`/api/activities?entityId=${task.id}`)
        .then(res => res.json())
        .then(setActivities);
    }
  }, [activeTab, task.id]);

  const handleSave = () => {
    onUpdate(task.id, { title, description, priority, storyPoints, tags });
    onClose();
  };

  const addCheckItem = async () => {
    if (!newCheckItem) return;
    const res = await fetch('/api/checklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newCheckItem, taskId: task.id })
    });
    if (res.ok) {
      const item = await res.json();
      setChecklists([...checklists, item]);
      setNewCheckItem('');
    }
  };

  const toggleCheckItem = async (id: string, isDone: boolean) => {
    const res = await fetch(`/api/checklists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone: !isDone })
    });
    if (res.ok) {
      setChecklists(checklists.map((c: any) => c.id === id ? { ...c, isDone: !isDone } : c));
    }
  };

  const deleteCheckItem = async (id: string) => {
    const res = await fetch(`/api/checklists/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setChecklists(checklists.filter((c: any) => c.id !== id));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', task.id);

      const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
      });

      if (res.ok) {
          const attachment = await res.json();
          setAttachments([...attachments, attachment]);
      }
  };

  const handleAddTag = () => {
      if (!newTagName) return;
      const newTag = { name: newTagName, color: newTagColor };
      setTags([...tags, newTag]);
      setNewTagName('');
      setShowTagInput(false);
  };

  const handleRemoveTag = (tagName: string) => {
      setTags(tags.filter((t: any) => t.name !== tagName));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#1E222B] w-full max-w-2xl rounded-3xl shadow-card overflow-hidden text-foreground flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('DETAILS')}
                className={`flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'DETAILS' ? 'text-primary' : 'opacity-30'}`}
              >
                <Type size={14} />
                <span>Details</span>
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'HISTORY' ? 'text-primary' : 'opacity-30'}`}
              >
                <History size={14} />
                <span>History</span>
              </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar min-h-[400px]">
          {activeTab === 'DETAILS' ? (
            <>
              {/* Title and Creator */}
              <div>
                <div className="flex justify-between items-end mb-3">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-30 ml-1">Task Title</label>
                    {task.creator && (
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                            Created by: {task.creator.name}
                        </div>
                    )}
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl p-4 text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                  {/* Criticality */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                        <BarChart2 size={12} /> Criticality
                    </label>
                    <div className="flex flex-wrap gap-2">
                    {priorities.map((p) => (
                        <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                            priority === p
                            ? 'bg-primary text-white shadow-medium scale-105'
                            : 'bg-[#F6F8FB] dark:bg-[#171A21] opacity-40 hover:opacity-100'
                        }`}
                        >
                        {p}
                        </button>
                    ))}
                    </div>
                  </div>

                  {/* Story Points */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                        <Zap size={12} /> Story Points
                    </label>
                    <input
                        type="number"
                        value={storyPoints}
                        onChange={(e) => setStoryPoints(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                    <TagIcon size={12} /> Labels
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag: any) => (
                        <div
                            key={tag.name}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold text-white shadow-sm transition-all hover:brightness-110"
                            style={{ backgroundColor: tag.color }}
                        >
                            {tag.name}
                            <button onClick={() => handleRemoveTag(tag.name)} className="hover:text-black/50"><X size={10} /></button>
                        </div>
                    ))}
                    <button
                        onClick={() => setShowTagInput(true)}
                        className="w-8 h-8 rounded-full bg-[#F6F8FB] dark:bg-[#171A21] flex items-center justify-center opacity-40 hover:opacity-100 transition-all"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                <AnimatePresence>
                    {showTagInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2 overflow-hidden"
                        >
                            <input
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="Label name..."
                                className="flex-1 bg-[#F6F8FB] dark:bg-[#171A21] rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <input
                                type="color"
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                className="w-10 h-10 border-none bg-transparent cursor-pointer"
                            />
                            <button onClick={handleAddTag} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Add</button>
                            <button onClick={() => setShowTagInput(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-xs font-bold">Cancel</button>
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* Attachments */}
              <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-30 ml-1 flex items-center gap-2">
                        <Paperclip size={12} /> Attachments
                    </label>
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary cursor-pointer hover:underline">
                        + Upload File
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   {attachments.map((file: any) => (
                     <div key={file.id} className="flex items-center gap-3 p-3 bg-[#F6F8FB] dark:bg-[#171A21] rounded-xl border border-gray-100 dark:border-white/5 group">
                        <div className="p-2 bg-white dark:bg-white/5 rounded-lg">
                            <FileIcon size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate tracking-tight">{file.filename}</p>
                            <p className="text-[9px] opacity-40 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity">
                            <ExternalLink size={14} />
                        </a>
                     </div>
                   ))}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                    <CheckSquare size={12} /> Checklist
                </label>
                <div className="space-y-2 mb-4">
                  {checklists.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-[#F6F8FB] dark:bg-[#171A21] rounded-xl group transition-all">
                      <button
                        onClick={() => toggleCheckItem(item.id, item.isDone)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${item.isDone ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-white/10'}`}
                      >
                        {item.isDone && <Check size={12} />}
                      </button>
                      <span className={`text-sm font-medium flex-1 ${item.isDone ? 'opacity-30 line-through' : ''}`}>
                        {item.content}
                      </span>
                      <button
                        onClick={() => deleteCheckItem(item.id)}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 text-red-500 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCheckItem()}
                    placeholder="Add an item..."
                    className="flex-1 bg-transparent border-b border-gray-100 dark:border-white/5 py-2 px-1 text-sm outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={addCheckItem}
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Description with Markdown */}
              <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-30 ml-1 flex items-center gap-2">
                        <AlignLeft size={12} /> Description
                    </label>
                    <button
                        onClick={() => setIsEditingDesc(!isEditingDesc)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                    >
                        {isEditingDesc ? <><Eye size={12} /> Preview</> : <><Edit3 size={12} /> Edit</>}
                    </button>
                </div>

                {isEditingDesc ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="w-full bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        placeholder="Support Markdown: **bold**, *italic*, # Heading"
                    />
                ) : (
                    <div className="w-full bg-[#F6F8FB] dark:bg-[#171A21] rounded-2xl p-4 min-h-[100px] prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {description || '*No description provided.*'}
                        </ReactMarkdown>
                    </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
               {activities.map((log: any) => (
                 <div key={log.id} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                        <p className="text-sm font-bold tracking-tight">{log.details || log.action}</p>
                        <p className="text-[10px] opacity-40 font-medium">
                            {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                        </p>
                    </div>
                 </div>
               ))}
               {activities.length === 0 && (
                 <div className="py-20 text-center opacity-20">
                    <History size={48} className="mx-auto mb-4" />
                    <p className="font-bold tracking-tight">No activity recorded yet</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {activeTab === 'DETAILS' && (
          <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-4">
              <button onClick={onClose} className="px-6 py-3 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity">Cancel</button>
              <button onClick={handleSave} className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-medium hover:bg-primary-hover transition-all flex items-center gap-2 active:scale-95">
                  <Check size={18} /> Save Changes
              </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
