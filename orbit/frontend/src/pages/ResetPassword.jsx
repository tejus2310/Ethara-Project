import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import api from '../api/axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      setMsg(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-space p-4">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden animate-fade-in-up shadow-[0_0_50px_rgba(0,243,255,0.1)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="p-3 bg-white/5 rounded-full border border-white/10 mb-4 animate-pulse-glow">
            <Rocket className="w-8 h-8 text-neon" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-center">ORBIT SYSTEM</h2>
          <p className="text-white/50 text-sm mt-1">Set a new password</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-4 text-sm text-center relative z-10">{error}</div>}
        {msg && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded mb-4 text-sm text-center relative z-10">{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">New Password</label>
            <input type="password" required className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={8} disabled={!token || msg !== ''} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Confirm Password</label>
            <input type="password" required className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={8} disabled={!token || msg !== ''} />
          </div>
          <button type="submit" className="btn-primary w-full mt-6 py-3" disabled={!token || msg !== ''}>
            Save New Password
          </button>
        </form>

        <div className="mt-6 text-center relative z-10 flex flex-col space-y-2">
          <button onClick={() => navigate('/login')} className="text-sm text-neon/70 hover:text-neon transition-colors">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
