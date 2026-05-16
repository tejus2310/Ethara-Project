import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Target, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div className="text-neon animate-pulse">Scanning systems...</div>;

  const stats = [
    { title: 'Total Projects', value: data.projectsCount, icon: <Target className="w-6 h-6 text-indigo-400" />, color: 'border-indigo-500/30' },
    { title: 'Tasks Done', value: data.tasksByStatus.Done, icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />, color: 'border-emerald-500/30' },
    { title: 'In Progress', value: data.tasksByStatus['In Progress'], icon: <Clock className="w-6 h-6 text-amber-400" />, color: 'border-amber-500/30' },
    { title: 'Overdue', value: data.tasksByStatus.Overdue, icon: <AlertTriangle className="w-6 h-6 text-red-400" />, color: 'border-red-500/30' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-wide animate-fade-in-up">MISSION DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`glass-card p-6 border-b-4 ${s.color} animate-fade-in-up hover:-translate-y-1`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/50 text-sm font-medium uppercase">{s.title}</p>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg group-hover:animate-pulse-glow transition-all">{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Critical: Overdue Tasks</h2>
          {data.overdueTasks.length === 0 ? (
            <p className="text-white/50 text-sm">No overdue tasks. All systems nominal.</p>
          ) : (
            <div className="space-y-3">
              {data.overdueTasks.map(t => (
                <div key={t.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-red-300/70">{t.Project?.title} - Assigned to: {t.assignee?.name}</p>
                  </div>
                  <span className="text-xs text-red-400 border border-red-400/50 px-2 py-1 rounded">Overdue</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-lg font-semibold mb-4 text-neon">My Tasks</h2>
          {data.myTasks.length === 0 ? (
            <p className="text-white/50 text-sm">No tasks assigned to you.</p>
          ) : (
            <div className="space-y-3">
              {data.myTasks.map(t => (
                <div key={t.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-white/50">Due: {t.dueDate ? format(new Date(t.dueDate), 'MMM dd, yyyy') : 'No date'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${
                    t.status === 'Done' ? 'border-emerald-500/50 text-emerald-400' :
                    t.status === 'In Progress' ? 'border-amber-500/50 text-amber-400' :
                    t.status === 'Overdue' ? 'border-red-500/50 text-red-400' :
                    'border-white/20 text-white/70'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {user?.role === 'Admin' && data.recentActivity && (
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-lg font-semibold mb-4 text-indigo-400">Recent Mission Activity</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {data.recentActivity.map(act => (
              <div key={act.id} className="border-l-2 border-indigo-500/50 pl-4 py-1">
                <p className="text-sm font-medium text-white/90">{act.user?.name} <span className="text-white/50 font-normal ml-2">{format(new Date(act.createdAt), 'MMM dd, HH:mm')}</span></p>
                <p className="text-xs text-white/70 mt-1">{act.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
