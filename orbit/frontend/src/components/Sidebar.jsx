import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Crew (Admin)', path: '/admin', icon: <Users className="w-5 h-5" /> });
  }

  return (
    <aside className="w-64 glass-card border-y-0 border-l-0 hidden md:flex flex-col pt-6 z-10">
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? 'bg-indigo-600/20 text-neon border border-neon/30' : 'hover:bg-white/5 text-white/70 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
