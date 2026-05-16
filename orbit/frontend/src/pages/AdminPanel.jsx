import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const [editingUser, setEditingUser] = useState(null);
  const [editingPasswordUser, setEditingPasswordUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: '' });
  const [newPassword, setNewPassword] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, projRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/projects')
      ]);
      setUsers(usersRes.data);
      setProjects(projRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedUser) return alert('Select both project and user');
    try {
      await api.post(`/projects/${selectedProject}/members`, { userId: selectedUser });
      alert('Crew member assigned successfully');
      fetchData();
    } catch (err) { alert('Error assigning member'); }
  };

  const handleEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/admin/users/${editingUser.id}`, userForm);
      alert('User updated');
      setEditingUser(null);
      fetchData();
    } catch (err) { alert('Error updating user'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/auth/admin/users/${editingPasswordUser.id}/password`, { password: newPassword });
      alert('Password updated successfully');
      setEditingPasswordUser(null);
      setNewPassword('');
    } catch (err) { alert('Error updating password'); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-wide">ADMINISTRATIVE PANEL</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-neon">Assign Crew to Project</h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-white/50 mb-1">Project</label>
              <select className="input-field [&>option]:bg-space" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-white/50 mb-1">Crew Member</label>
              <select className="input-field [&>option]:bg-space" value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">Select Member</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Assign Command</button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 text-neon">Registered Personnel</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-white/50">{u.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded ${u.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-white/70'}`}>
                    {u.role}
                  </span>
                  <div className="flex flex-col space-y-1">
                    <button onClick={() => handleEditUser(u)} className="text-[10px] uppercase text-emerald-400 hover:text-white transition-colors">Edit</button>
                    <button onClick={() => setEditingPasswordUser(u)} className="text-[10px] uppercase text-neon hover:text-white transition-colors">Password</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-space/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit Crew Member</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Name</label>
                <input required className="input-field" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Email</label>
                <input required type="email" className="input-field" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">Role</label>
                <select className="input-field [&>option]:bg-space" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPasswordUser && (
        <div className="fixed inset-0 bg-space/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Change Password for {editingPasswordUser.name}</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-white/50 mb-1">New Password</label>
                <input required type="password" minLength={8} className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setEditingPasswordUser(null)} className="px-4 py-2 text-white/70 hover:text-white">Cancel</button>
                <button type="submit" className="btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
