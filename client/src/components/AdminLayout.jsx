import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  GraduationCap, 
  Award, 
  QrCode, 
  Image, 
  MessageSquare, 
  Calendar,
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Professors', path: '/admin/professors', icon: Award },
    { name: 'Team Members', path: '/admin/team', icon: Users },
    { name: 'Alumni Network', path: '/admin/alumni', icon: GraduationCap },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-slate-300 border-r border-slate-800 shrink-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-serif font-bold text-sm text-amber-100">
              N
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-sm text-white block truncate font-serif">
                NIRVANA
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Officer Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Quick Links */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="truncate">
              <p className="font-semibold text-white truncate">{admin?.name || 'Administrator'}</p>
              <p className="text-[11px] text-slate-500 truncate">{admin?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm truncate">{settings.club_name || 'Admin'}</span>
          <span className="text-[10px] bg-indigo-600 px-1.5 py-0.5 rounded text-white font-mono">PORTAL</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileSidebarOpen && (
        <div className="md:hidden bg-slate-950 text-slate-300 p-4 border-b border-slate-800 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/"
              target="_blank"
              onClick={() => setMobileSidebarOpen(false)}
              className="text-xs text-indigo-400 font-medium flex items-center gap-1"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 font-medium flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

    </div>
  );
}
