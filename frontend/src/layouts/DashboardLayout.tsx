import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  Contact2,
  Building2,
  Briefcase,
  Activity,
  Calendar,
  CheckSquare,
  Package,
  FileText,
  Receipt,
  BarChart3,
  TrendingUp,
  Users,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Moon,
  Building,
  LogOut,
  User,
  X
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { settings, toggleSidebar } = useSettingsStore();
  const { profile } = useUserStore();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const activeCompany = 'Acme Enterprise';

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { label: 'Leads', icon: <Users2 size={18} />, path: '/leads' },
    { label: 'Contacts', icon: <Contact2 size={18} />, path: '/contacts' },
    { label: 'Companies', icon: <Building2 size={18} />, path: '/companies' },
    { label: 'Deals', icon: <Briefcase size={18} />, path: '/deals' },
    { label: 'Activities', icon: <Activity size={18} />, path: '/activities' },
    { label: 'Calendar', icon: <Calendar size={18} />, path: '/calendar' },
    { label: 'Tasks', icon: <CheckSquare size={18} />, path: '/tasks' },
    { label: 'Products', icon: <Package size={18} />, path: '/products' },
    { label: 'Quotes', icon: <FileText size={18} />, path: '/quotes' },
    { label: 'Invoices', icon: <Receipt size={18} />, path: '/invoices' },
    { label: 'Reports', icon: <BarChart3 size={18} />, path: '/reports' },
    { label: 'Analytics', icon: <TrendingUp size={18} />, path: '/analytics' },
    { label: 'Team', icon: <Users size={18} />, path: '/team' },
    { label: 'Notifications', icon: <Bell size={18} />, path: '/notifications' },
    { label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-r border-slate-100/60 p-4">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-100/60 mb-6">
        <div className="w-8 h-8 rounded-xl bg-brand-550 flex items-center justify-center text-white font-bold shadow-glossy shadow-brand-200">
          F
        </div>
        {!settings.sidebarCollapsed && (
          <span className="font-bold text-slate-800 text-lg tracking-tight select-none">
            FlowCRM <span className="text-brand-550">AI</span>
          </span>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-brand-50 text-brand-700 border-l-[3px] border-brand-550 pl-[9px]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
              title={settings.sidebarCollapsed ? item.label : undefined}
            >
              <div className={active ? 'text-brand-550' : 'text-slate-400'}>
                {item.icon}
              </div>
              {!settings.sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!settings.sidebarCollapsed && profile && (
        <div className="mt-auto border-t border-slate-100/60 pt-4 flex items-center gap-3">
          <Avatar name={profile.name} size="sm" />
          <div className="flex-grow min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{profile.name}</p>
            <p className="text-[10px] font-semibold text-slate-400 truncate">{profile.email}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-25 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          settings.sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex-grow max-w-xs w-80 h-full flex flex-col z-10 animate-slide-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100"
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-grow flex flex-col min-w-0 transition-all duration-300 ${
          settings.sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white/70 backdrop-blur-xl border-b border-slate-100/60">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-50 border border-slate-100/50"
            >
              <Menu size={20} />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden md:flex text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 border border-slate-100/50 transition-colors"
            >
              {settings.sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Company Selector Placeholder */}
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100/60 hover:bg-slate-50 text-xs font-semibold text-slate-600 bg-white/60 shadow-glossy-sm">
                <Building size={14} className="text-brand-550" />
                <span>{activeCompany}</span>
              </button>
            </div>
          </div>

          {/* Center search bar */}
          <div className="hidden lg:flex items-center relative max-w-sm w-full mx-8">
            <Search className="absolute left-3.5 text-slate-450 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads, deals, contacts..."
              className="w-full pl-10 pr-4 py-1.5 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:border-brand-550 focus:ring-4 focus:ring-brand-100/80 transition-all font-medium text-slate-600"
            />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Quick Create Placeholder */}
            <Button size="sm" variant="glass" className="hidden sm:flex items-center gap-1.5 border-slate-200/80">
              <Plus size={14} className="text-brand-550" />
              <span>Create</span>
            </Button>

            {/* Disabled Dark Mode Placeholder */}
            <button
              disabled
              title="Dark Mode is currently disabled in this phase"
              className="text-slate-300 cursor-not-allowed p-2 rounded-xl border border-transparent/5"
            >
              <Moon size={18} />
            </button>

            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-50 border border-slate-100/50 transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-550" />
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-100 shadow-glossy-md p-4 z-20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
                      <Badge variant="info">New</Badge>
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="space-y-3 py-1">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-550 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight">New lead assigned</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Bruce Wayne from Wayne Enterprises has been added.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 leading-tight">Deal Proposal Qualified</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Cyberdyne Systems pipeline value updated.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown Placeholder */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50/80 transition-colors"
              >
                {profile && <Avatar name={profile.name} size="sm" />}
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-glossy-md p-2 z-20">
                    {profile && (
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{profile.name}</p>
                        <p className="text-[10px] font-semibold text-slate-450 truncate">{profile.role}</p>
                      </div>
                    )}
                    <div className="py-1">
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <User size={14} className="text-slate-400" />
                        <span>My Profile</span>
                      </button>
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Settings size={14} className="text-slate-400" />
                        <span>Account Settings</span>
                      </button>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="p-1">
                      <button className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={14} className="text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
