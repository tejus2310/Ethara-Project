import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen bg-space text-white overflow-hidden relative">
      
      {/* Ambient Planetary Silhouette Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Main large planet bottom right */}
        <div className="absolute -bottom-[40vh] -right-[20vw] w-[80vw] h-[80vw] rounded-full bg-[#020308] border border-neon/20 shadow-[0_0_120px_rgba(0,243,255,0.1),inset_20px_20px_100px_rgba(0,0,0,0.8)] opacity-70"></div>
        
        {/* Smaller distant moon top left */}
        <div className="absolute top-[10vh] -left-[10vw] w-[30vw] h-[30vw] rounded-full bg-[#020308] border border-indigo-500/20 shadow-[0_0_80px_rgba(99,102,241,0.1)] opacity-50 blur-[1px]"></div>
      </div>

      {/* Main App Content */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      
    </div>
  );
}
