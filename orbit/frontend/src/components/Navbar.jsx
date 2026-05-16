import { useAuth } from '../context/AuthContext';
import { Rocket, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 glass-card border-x-0 border-t-0 flex items-center justify-between px-6 z-10">
      <div className="flex items-center space-x-2 text-neon">
        <Rocket className="w-6 h-6" />
        <span className="font-bold text-xl tracking-wider hidden md:block">ORBIT CONTROL</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-white/50">{user?.role}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-400 font-medium text-sm">
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
}
