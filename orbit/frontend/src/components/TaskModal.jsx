import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TaskModal({ project, task, onClose, onRefresh }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isAssignedToMe = task?.assignedTo === user?.id;
  const canEdit = isAdmin || isAssignedToMe;
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || '',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Todo'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.assignedTo === '') payload.assignedTo = null;
      if (payload.dueDate === '') payload.dueDate = null;

      if (task) {
        if (isAdmin) {
          await api.put(`/tasks/${task.id}`, payload);
        } else {
          await api.put(`/tasks/${task.id}`, { status: payload.status });
        }
      } else {
        await api.post(`/projects/${project.id}/tasks`, payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving task');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      onRefresh();
      onClose();
    } catch (err) { alert('Error deleting task'); }
  };

  return (
    <div className="fixed inset-0 bg-space/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md p-6 border-t-4 border-t-neon">
        <h2 className="text-xl font-bold mb-4">{task ? (isAdmin ? 'Edit Task' : 'Update Task Status') : 'New Task'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-white/50 mb-1">Title</label>
            <input required type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} disabled={!isAdmin} />
          </div>
          
          {isAdmin && (
            <>
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Description</label>
                <textarea className="input-field resize-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-white/50 mb-1">Assign To</label>
                  <select className="input-field [&>option]:bg-space" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-white/50 mb-1">Due Date</label>
                  <input type="date" className="input-field [&::-webkit-calendar-picker-indicator]:invert" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-white/50 mb-1">Priority</label>
                  <select className="input-field [&>option]:bg-space" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-white/50 mb-1">Status</label>
                  <select className="input-field [&>option]:bg-space" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {!isAdmin && task && (
            <div>
              <label className="block text-xs uppercase text-white/50 mb-1">Update Status</label>
              <select className="input-field [&>option]:bg-space disabled:opacity-50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={!canEdit}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              {!canEdit && <p className="text-xs text-red-400 mt-2">You can only edit tasks assigned to you.</p>}
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            {isAdmin && task ? (
              <button type="button" onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm">Delete Task</button>
            ) : <div></div>}
            <div className="space-x-3 flex items-center">
              <button type="button" onClick={onClose} className="px-4 py-2 text-white/70 hover:text-white">{canEdit ? 'Cancel' : 'Close'}</button>
              {canEdit && <button type="submit" className="btn-primary">Save Data</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
