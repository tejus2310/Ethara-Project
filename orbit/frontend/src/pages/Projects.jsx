import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '' });
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ title: '', description: '', deadline: '' });
      fetchProjects();
    } catch (err) { alert(err.response?.data?.message || 'Error creating project'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-wide">ACTIVE PROJECTS</h1>
        {user?.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" /> <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p, i) => {
          const totalTasks = p.Tasks?.length || 0;
          const doneTasks = p.Tasks?.filter(t => t.status === 'Done').length || 0;
          const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

          return (
            <Link key={p.id} to={`/projects/${p.id}`} className="glass-card p-6 block group animate-fade-in-up hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,243,255,0.15)]" style={{ animationDelay: `${i * 0.1}s` }}>
              <h3 className="text-xl font-bold group-hover:text-neon transition-colors duration-300">{p.title}</h3>
              <p className="text-sm text-white/60 mt-2 line-clamp-2">{p.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span className="text-neon">{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-neon h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 text-xs text-white/50">
                <span>{p.members?.length || 0} Crew Members</span>
                <span className={p.deadline && new Date(p.deadline) < new Date() ? 'text-red-400' : ''}>
                  Deadline: {p.deadline ? format(new Date(p.deadline), 'MMM dd, yyyy') : 'None'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-space/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Initialize New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Title</label>
                <input required type="text" className="input-field" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Description</label>
                <textarea className="input-field h-24 resize-none" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Deadline</label>
                <input type="date" className="input-field [&::-webkit-calendar-picker-indicator]:invert" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
