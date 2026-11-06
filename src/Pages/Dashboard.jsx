import { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Projects from './dashboard/Projects';
import Certificates from './dashboard/Certificates';
import Comments from './dashboard/Comments';
import ProfileSettings from './dashboard/ProfileSettings';
import TechStackManager from './dashboard/TechStackManager';
import DirectChannelsManager from './dashboard/DirectChannelsManager';
import { FolderGit2, Award, MessageSquare, LogOut, LayoutDashboard, Menu, ArrowUpRight, User, Code2, Share2 } from 'lucide-react';
import { useProfile } from '../utils/profileData';

const NAV_ITEMS = [
  { to: 'projects', label: 'Projects', icon: FolderGit2 },
  { to: 'certificates', label: 'Certificates', icon: Award },
  { to: 'tech-stack', label: 'Tech Stack', icon: Code2 },
  { to: 'direct-channels', label: 'Direct Channels', icon: Share2 },
  { to: 'comments', label: 'Comments', icon: MessageSquare },
  { to: 'profile', label: 'Profile & Display', icon: User },
];

export default function Dashboard() {
  const profile = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-5 gap-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-1 shrink-0">
        <div className="w-9 h-9 bg-[#1E3B2F] rounded-xl flex items-center justify-center text-[#F5F0E6] shadow-2xs">
          <LayoutDashboard className="w-4 h-4 text-[#C8B48A]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1E3B2F] font-mono">{profile?.name || 'Ahmad Jordan'}</p>
          <p className="text-xs text-[#5A6650]">Admin Dashboard</p>
        </div>
      </div>

      {/* Badge */}
      <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#EDE7DA] border border-[#D8CFBE] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#7F8C6A] animate-pulse" />
        <span className="text-[#1E3B2F] text-xs font-mono font-medium">Portfolio Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5 flex-1 min-h-0">
        <p className="text-[10px] text-[#5A6650] uppercase tracking-widest px-3 mb-1 shrink-0 font-mono font-semibold">Management</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.includes(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shrink-0 ${
                active
                  ? 'bg-[#1E3B2F] text-[#F5F0E6] shadow-xs'
                  : 'text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C8B48A]' : 'text-[#7F8C6A]'}`} />
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8B48A]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions: View Site & Sign Out */}
      <div className="pt-3 border-t border-[#D8CFBE] space-y-1 shrink-0">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-[#5A6650] hover:text-[#1E3B2F] hover:bg-[#EDE7DA] transition-all"
        >
          <span>View Live Site</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#7F8C6A]" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium text-[#B4442E] hover:bg-[#EDE7DA] transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#B4442E]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F5F0E6] text-[#1E3B2F]" style={{ height: '100dvh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#D8CFBE] bg-[#FFFFFF]"
        style={{ height: '100dvh', position: 'sticky', top: 0 }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col border-r border-[#D8CFBE] bg-[#FFFFFF] transition-transform duration-300 lg:hidden shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#F5F0E6]">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#D8CFBE] bg-[#FFFFFF] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-[#D8CFBE] text-[#1E3B2F] hover:bg-[#EDE7DA] transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-[#1E3B2F] font-mono">Dashboard</span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<Navigate to="projects" replace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="tech-stack" element={<TechStackManager />} />
            <Route path="direct-channels" element={<DirectChannelsManager />} />
            <Route path="comments" element={<Comments />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
