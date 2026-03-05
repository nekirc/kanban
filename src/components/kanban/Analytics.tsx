'use client';

import { BarChart2, TrendingUp, CheckCircle2, Clock, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface StatsProps {
  columns: any[];
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#FF4D4D',
  HIGH: '#FFA500',
  MEDIUM: '#5B6CFF',
  LOW: '#22C55E',
};

export function Analytics({ columns }: StatsProps) {
  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const doneTasks = columns.find(col => col.title.toLowerCase() === 'done')?.tasks.length || 0;
  const inProgressTasks = columns.find(col => col.title.toLowerCase() === 'in progress')?.tasks.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Data for Column Distribution
  const columnData = columns.map(col => ({
    name: col.title,
    tasks: col.tasks.length
  }));

  // Data for Priority Distribution
  const priorityMap: Record<string, number> = {};
  columns.forEach(col => {
    col.tasks.forEach((t: any) => {
      priorityMap[t.priority] = (priorityMap[t.priority] || 0) + 1;
    });
  });
  const priorityData = Object.entries(priorityMap).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate Story Points based burndown
  const totalPoints = columns.reduce((acc, col) => acc + col.tasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0), 0);
  const donePoints = columns.find(col => col.title.toLowerCase() === 'done')?.tasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0) || 0;

  // Simulated Burndown Data using Story Points
  const burndownData = [
    { day: 'Mon', remaining: totalPoints, ideal: totalPoints },
    { day: 'Tue', remaining: totalPoints * 0.9, ideal: totalPoints * 0.85 },
    { day: 'Wed', remaining: totalPoints * 0.8, ideal: totalPoints * 0.7 },
    { day: 'Thu', remaining: totalPoints * 0.6, ideal: totalPoints * 0.55 },
    { day: 'Fri', remaining: totalPoints * 0.45, ideal: totalPoints * 0.4 },
    { day: 'Sat', remaining: totalPoints * 0.3, ideal: totalPoints * 0.25 },
    { day: 'Sun', remaining: totalPoints - donePoints, ideal: 0 },
  ];

  return (
    <div className="space-y-6 mb-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <BarChart2 size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Tasks</span>
                </div>
                <p className="text-2xl font-bold">{totalTasks}</p>
            </div>

            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-status-progress/10 text-status-progress rounded-lg">
                        <Clock size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">In Progress</span>
                </div>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
            </div>

            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-status-done/10 text-status-done rounded-lg">
                        <CheckCircle2 size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Completed</span>
                </div>
                <p className="text-2xl font-bold">{doneTasks}</p>
            </div>

            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-status-review/10 text-status-review rounded-lg">
                        <TrendingUp size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Completion</span>
                </div>
                <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">{completionRate}%</p>
                    <div className="w-full h-1.5 bg-white/5 rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-status-done transition-all duration-1000" style={{ width: `${completionRate}%` }} />
                    </div>
                </div>
            </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column Distribution Bar Chart */}
            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">Task Distribution by Column</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={columnData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1C21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="tasks" fill="#5B6CFF" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Priority Distribution Pie Chart */}
            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">Tasks by Priority</h3>
                <div className="h-[250px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={priorityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1C21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2 ml-4">
                        {priorityData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[entry.name] }} />
                                <span className="text-[10px] opacity-60 uppercase font-bold">{entry.name}: {entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Burndown Chart */}
            <div className="bg-white/5 dark:bg-white/[0.02] p-6 rounded-2xl border border-white/5 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Sprint Burndown</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[9px] font-bold opacity-40 uppercase">Actual</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white/20" />
                            <span className="text-[9px] font-bold opacity-40 uppercase">Ideal</span>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={burndownData}>
                            <defs>
                                <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5B6CFF" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#5B6CFF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A1C21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="ideal" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="remaining" stroke="#5B6CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRemaining)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
}
