import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';
import { ArrowLeft, Plus } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      alert('Error fetching project');
      navigate('/projects');
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  if (!project) return <div className="text-neon animate-pulse">Loading project data...</div>;

  const isAdmin = user?.role === 'Admin';
  const statuses = ['Todo', 'In Progress', 'Done', 'Overdue'];

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const getPriorityColor = (p) => {
    if (p === 'High') return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (p === 'Medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  };

  return (
    <div className="space-y-6 h-full flex flex-col min-w-0">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-wide">{project.title}</h1>
          <p className="text-white/50 text-sm">{project.description}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex space-x-4">
          <button onClick={() => { setSelectedTask(null); setShowModal(true); }} className="btn-primary flex items-center text-sm">
            <Plus className="w-4 h-4 mr-1" /> Add Task
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-x-auto gap-6 pb-4">
        {statuses.map(status => {
          const columnTasks = project.Tasks?.filter(t => t.status === status) || [];
          return (
            <div key={status} className="flex-none w-80 glass-card bg-black/20 flex flex-col h-full max-h-[70vh]">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-semibold">{status}</h3>
                <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{columnTasks.length}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {columnTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => handleTaskClick(task)}
                    className="glass-card p-4 cursor-pointer hover:border-neon/50 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="font-medium text-sm group-hover:text-neon transition-colors">{task.title}</p>
                    {task.assignee && <p className="text-xs text-white/50 mt-2">Assignee: {task.assignee.name}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <TaskModal 
          project={project} 
          task={selectedTask} 
          onClose={() => setShowModal(false)} 
          onRefresh={fetchProject} 
        />
      )}
    </div>
  );
}
