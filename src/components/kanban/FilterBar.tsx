'use client';

import { Filter, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const handlePrioritySelect = (p: string | null) => {
    setSelectedPriority(p);
    onFilterChange({ priority: p });
  };

  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isOpen ? 'bg-primary text-white shadow-medium' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          <Filter size={14} />
          <span>Filters</span>
          {selectedPriority && <div className="w-1.5 h-1.5 rounded-full bg-white ml-1" />}
          <ChevronDown size={12} className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {selectedPriority && (
            <button
                onClick={() => handlePrioritySelect(null)}
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
                Priority: {selectedPriority}
                <X size={12} />
            </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 left-0 z-30 w-64 bg-white dark:bg-[#1E222B] rounded-2xl shadow-card p-4 border border-gray-100 dark:border-white/5"
          >
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1 text-foreground">Priority</label>
                    <div className="grid grid-cols-2 gap-2">
                        {priorities.map(p => (
                            <button
                                key={p}
                                onClick={() => handlePrioritySelect(p)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${selectedPriority === p ? 'bg-primary text-white' : 'bg-[#F6F8FB] dark:bg-[#171A21] text-foreground/40 hover:text-foreground'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => {
                            handlePrioritySelect(null);
                            setIsOpen(false);
                        }}
                        className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-500 opacity-60 hover:opacity-100"
                    >
                        Clear All Filters
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
