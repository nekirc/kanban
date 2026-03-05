'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, AlignLeft, BarChart2, Tag as TagIcon, Check, CheckSquare, Plus, Trash2, History, Edit3, Eye, Paperclip, File as FileIcon, ExternalLink } from 'lucide-react';
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
  const [checklists, setChecklists] = useState(task.checklists || []);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [activities, setActivities] = useState([]);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetch(`/api/activities?entityId=${task.id}`)
        .then(res => res.json())
        .then(setActivities);
    }
  }, [activeTab, task.id]);

  const handleSave = () => {
    onUpdate(task.id, { title, description, priority });
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

      // In a real app, you'd upload to S3/Cloudinary here.
      // For this MVP, we'll simulate an upload with a local URL.
      const mockUrl = URL.createObjectURL(file);

      const res = await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              filename: file.name,
              url: mockUrl,
              size: file.size,
              type: file.type,
              taskId: task.id
          })
      });

      if (res.ok) {
          const attachment = await res.json();
          setAttachments([...attachments, attachment]);
      }
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
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1">Task Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl p-4 text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

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
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
