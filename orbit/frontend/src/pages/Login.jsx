import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random() * canvas.width - canvas.width / 2,
      y: Math.random() * canvas.height - canvas.height / 2,
      z: Math.random() * 1000,
    }));

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 8, 16, 0.3)'; // Dark space background with trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      stars.forEach(star => {
        star.z -= 3; // Warp speed
        if (star.z <= 0) {
          star.z = 1000;
          star.x = Math.random() * canvas.width - cx;
          star.y = Math.random() * canvas.height - cy;
        }

        const x = (star.x / star.z) * 800 + cx;
        const y = (star.y / star.z) * 800 + cy;
        const size = (1 - star.z / 1000) * 3;
        const opacity = 1 - star.z / 1000;

        ctx.beginPath();
        // Mix of white and neon cyan stars
        ctx.fillStyle = Math.random() > 0.8 ? `rgba(0, 243, 255, ${opacity})` : `rgba(255, 255, 255, ${opacity})`;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    setMsg('');
    try {
      if (isForgotPassword) {
        const res = await api.post('/auth/forgot-password', { email: formData.email });
        setMsg(res.data.message);
      } else if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/dashboard');
      } else {
        await api.post('/auth/signup', formData);
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
        alert('Signup successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-space p-4">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-0"
        style={{ pointerEvents: 'none' }}
      />
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden animate-fade-in-up shadow-[0_0_50px_rgba(0,243,255,0.1)] z-10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="p-3 bg-white/5 rounded-full border border-white/10 mb-4 animate-pulse-glow">
            <Rocket className="w-8 h-8 text-neon" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-center">ORBIT SYSTEM</h2>
          <p className="text-white/50 text-sm mt-1">
            {isForgotPassword ? 'Reset your password' : (isLogin ? 'Enter your credentials' : 'Register new crew member')}
          </p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded mb-4 text-sm text-center relative z-10">{error}</div>}
        {msg && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded mb-4 text-sm text-center relative z-10">{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Full Name</label>
              <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Email Address</label>
            <input type="email" required className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="user@orbit.com" />
          </div>
          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setMsg(''); }} className="text-xs text-neon hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <input type="password" required className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" minLength={8} />
            </div>
          )}
          <button type="submit" className={`btn-primary w-full mt-6 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Login' : 'Register Member'))}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10 flex flex-col space-y-2">
          {isForgotPassword ? (
            <button onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(''); setMsg(''); }} className="text-sm text-neon/70 hover:text-neon transition-colors">
              Back to Login
            </button>
          ) : (
            <button onClick={() => { setIsLogin(!isLogin); setIsForgotPassword(false); setError(''); setMsg(''); }} className="text-sm text-neon/70 hover:text-neon transition-colors">
              {isLogin ? 'Need an account? Enlist here' : 'Already have an account? Login'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
