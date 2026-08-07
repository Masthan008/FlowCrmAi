import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Shield,
  Clock,
  X,
  Megaphone,
  TicketCheck,
  BookOpen,
  FileSignature,
  ShoppingCart,
  FolderKanban,
  Repeat,
  Mail,
  FormInput,
  Globe,
  MessageSquare,
  Wallet,
  HardDrive,
  ShieldCheck,
  ClipboardCheck,
  DollarSign
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useToast } from '../components/ui/ToastProvider';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import ChatWidget from '../components/chat/ChatWidget';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { AmbientAura } from '../components/ui/MotionComponents';

export const DashboardLayout: React.FC = () => {
  const { settings, toggleSidebar, fetchCompanySettings, updateCompanyName } = useSettingsStore();
  const { user, role, permissions, logout: storeLogout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { systemNotifications, markAsRead, fetchSystemNotifications } = useNotificationStore();
  const unreadNotifications = systemNotifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState('');

  useEffect(() => {
    fetchCompanySettings();
  }, [fetchCompanySettings]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    leads: any[];
    contacts: any[];
    deals: any[];
    companies: any[];
  }>({ leads: [], contacts: [], deals: [], companies: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ leads: [], contacts: [], deals: [], companies: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get('/global-search', {
          params: { query: searchQuery }
        });
        if (response.data?.success) {
          setSearchResults(response.data.data);
        }
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSystemNotifications();
  }, [fetchSystemNotifications]);

  useEffect(() => {
    if (theme === 'dark' || theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'white-glossy' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('flowcrm_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success('Theme Toggled', `Switched to ${nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}.`);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { label: 'Leads', icon: <Users2 size={18} />, path: '/leads', requiredPermission: 'leads:view' },
    { label: 'Contacts', icon: <Contact2 size={18} />, path: '/contacts', requiredPermission: 'contacts:view' },
    { label: 'Accounts (KYC/CVR)', icon: <Building2 size={18} />, path: '/companies', requiredPermission: 'companies:view' },
    { label: 'Deals', icon: <Briefcase size={18} />, path: '/deals', requiredPermission: 'deals:view' },
    { label: 'Activities', icon: <Activity size={18} />, path: '/activities' },
    { label: 'Calendar', icon: <Calendar size={18} />, path: '/calendar' },
    { label: 'Tasks', icon: <CheckSquare size={18} />, path: '/tasks' },
    { label: 'Products', icon: <Package size={18} />, path: '/products' },
    { label: 'Quotes', icon: <FileText size={18} />, path: '/quotes' },
    { label: 'Invoices', icon: <Receipt size={18} />, path: '/invoices' },
    { label: 'Reports', icon: <BarChart3 size={18} />, path: '/reports', requiredPermission: 'reports:view' },
    { label: 'Analytics', icon: <TrendingUp size={18} />, path: '/analytics' },
    { label: 'Team', icon: <Users size={18} />, path: '/team' },
    { label: 'Notifications', icon: <Bell size={18} />, path: '/notifications' },
    { label: 'Settings', icon: <Settings size={18} />, path: '/settings', requiredPermission: 'settings:access' },
    // New Features
    { label: 'Campaigns', icon: <Megaphone size={18} />, path: '/campaigns', requiredPermission: 'campaigns:view' },
    { label: 'Support Tickets', icon: <TicketCheck size={18} />, path: '/tickets', requiredPermission: 'tickets:view' },
    { label: 'Knowledge Base', icon: <BookOpen size={18} />, path: '/knowledge', requiredPermission: 'knowledge:view' },
    { label: 'Contracts', icon: <FileSignature size={18} />, path: '/contracts', requiredPermission: 'contracts:view' },
    { label: 'Orders', icon: <ShoppingCart size={18} />, path: '/orders', requiredPermission: 'orders:view' },
    { label: 'Projects', icon: <FolderKanban size={18} />, path: '/projects', requiredPermission: 'projects:view' },
    { label: 'Subscriptions', icon: <Repeat size={18} />, path: '/subscriptions', requiredPermission: 'subscriptions:view' },
    { label: 'Email', icon: <Mail size={18} />, path: '/email' },
    { label: 'Web Forms', icon: <FormInput size={18} />, path: '/webforms', requiredPermission: 'webforms:view' },
    { label: 'Customer Portal', icon: <Globe size={18} />, path: '/portal', requiredPermission: 'portal:view' },
    { label: 'Live Chat', icon: <MessageSquare size={18} />, path: '/chat' },
    { label: 'Expenses', icon: <Wallet size={18} />, path: '/expenses', requiredPermission: 'expenses:view' },
    { label: 'Assets', icon: <HardDrive size={18} />, path: '/assets', requiredPermission: 'assets:view' },
    { label: 'GDPR & Privacy', icon: <ShieldCheck size={18} />, path: '/gdpr', requiredPermission: 'gdpr:view' },
    { label: 'Surveys (NPS)', icon: <ClipboardCheck size={18} />, path: '/surveys', requiredPermission: 'surveys:view' },
    { label: 'Commissions', icon: <DollarSign size={18} />, path: '/commissions', requiredPermission: 'commissions:view' },
  ];

  // Dynamically filter menu items based on assigned user permissions
  const filteredMenuItems = menuItems.filter((item) => {
    if (role === 'Super Admin') return true;
    if (!item.requiredPermission) return true;
    return permissions.includes(item.requiredPermission) || permissions.includes('*');
  });

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      // Ignore network failures on logout
    } finally {
      storeLogout();
      toast.success('Logged Out', 'You have been successfully signed out.');
      navigate('/login');
    }
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
        <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-glossy shadow-brand-200">
          <img src="/favicon.png" alt="FlowCRM AI" className="w-full h-full object-cover" />
        </div>
        {!settings.sidebarCollapsed && (
          <span className="font-bold text-slate-800 text-lg tracking-tight select-none">
            FlowCRM <span className="text-brand-550">AI</span>
          </span>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow space-y-1 overflow-y-auto pr-1">
        {filteredMenuItems.map((item, idx) => {
          const active = isActive(item.path);
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand-50 text-brand-700 border-l-[3px] border-brand-550 pl-[9px]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`}
                title={settings.sidebarCollapsed ? item.label : undefined}
              >
                <motion.div
                  animate={active ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={active ? 'text-brand-550' : 'text-slate-400'}
                >
                  {item.icon}
                </motion.div>
                {!settings.sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!settings.sidebarCollapsed && user && (
        <div className="mt-auto border-t border-slate-100/60 pt-4 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
          <Avatar name={user.fullName} size="sm" />
          <div className="flex-grow min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{user.fullName}</p>
            <p className="text-[10px] font-semibold text-slate-400 truncate">{role || 'Viewer'}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-25 flex relative">
      <AmbientAura />
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

            {/* Interactive Company Workspace Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setEditingCompanyName(settings.companyName || 'FlowCRM Enterprise');
                  setShowCompanyModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-brand-400 hover:bg-brand-50/50 text-xs font-bold text-slate-700 bg-white/80 shadow-glossy-sm transition-all cursor-pointer group"
                title="Click to manage Workspace Company Branding"
              >
                <Building size={14} className="text-brand-550 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[140px] md:max-w-[200px]">{settings.companyName || 'FlowCRM Enterprise'}</span>
                <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Center search bar */}
          <div ref={searchRef} className="hidden lg:flex items-center relative max-w-sm w-full mx-8">
            <Search className="absolute left-3.5 text-slate-455 w-4 h-4 animate-pulse-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                }
              }}
              placeholder="Search leads, deals, contacts, accounts..."
              className="w-full pl-10 pr-10 py-1.5 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:border-brand-550 focus:ring-4 focus:ring-brand-100/80 transition-all font-medium text-slate-600 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-900"
            />
            {isSearching && (
              <div className="absolute right-3.5 flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-brand-550 border-t-transparent"></div>
              </div>
            )}

            {/* Global Search Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-150 dark:border-slate-800 rounded-2xl shadow-glossy-lg max-h-96 overflow-y-auto z-50 p-2 py-3">
                {/* No results placeholder */}
                {Object.values(searchResults).every((arr) => arr.length === 0) && !isSearching && (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                    No results found for "{searchQuery}"
                  </div>
                )}

                {/* Leads Category */}
                {searchResults.leads && searchResults.leads.length > 0 && (
                  <div className="mb-3">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads</div>
                    {searchResults.leads.map((lead) => (
                      <Link
                        key={lead.id}
                        to={`/leads/${lead.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User size={14} className="text-amber-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{lead.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {lead.leadNumber} {lead.companyName ? `• ${lead.companyName}` : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Contacts Category */}
                {searchResults.contacts && searchResults.contacts.length > 0 && (
                  <div className="mb-3">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contacts</div>
                    {searchResults.contacts.map((contact) => (
                      <Link
                        key={contact.id}
                        to={`/contacts/${contact.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Contact2 size={14} className="text-indigo-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{contact.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {contact.contactNumber} {contact.email ? `• ${contact.email}` : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Deals Category */}
                {searchResults.deals && searchResults.deals.length > 0 && (
                  <div className="mb-3">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deals</div>
                    {searchResults.deals.map((deal) => (
                      <Link
                        key={deal.id}
                        to={`/deals/${deal.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Briefcase size={14} className="text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{deal.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {deal.dealNumber} • ${deal.value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          deal.status === 'Won' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' :
                          deal.status === 'Lost' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' :
                          'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {deal.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Accounts Category */}
                {searchResults.companies && searchResults.companies.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accounts</div>
                    {searchResults.companies.map((company) => (
                      <Link
                        key={company.id}
                        to={`/companies/${company.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Building size={14} className="text-blue-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{company.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {company.companyNumber} {company.primaryEmail ? `• ${company.primaryEmail}` : ''}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                onClick={() => setCreateMenuOpen(!createMenuOpen)}
                size="sm"
                variant="glass"
                className="hidden sm:flex items-center gap-1.5 border-slate-200/80"
              >
                <Plus size={14} className="text-brand-550" />
                <span>Create</span>
              </Button>
              {createMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-2xl shadow-glossy-lg py-2 z-50 animate-fade-in dark:bg-slate-900 dark:border-slate-800">
                  <Link
                    to="/leads/new"
                    onClick={() => setCreateMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    New Lead
                  </Link>
                  <Link
                    to="/contacts"
                    onClick={() => setCreateMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    New Contact
                  </Link>
                  <Link
                    to="/companies"
                    onClick={() => setCreateMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    New Company
                  </Link>
                  <Link
                    to="/deals"
                    onClick={() => setCreateMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    New Deal
                  </Link>
                  <Link
                    to="/tasks/new"
                    onClick={() => setCreateMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    New Task
                  </Link>
                </div>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              title="Toggle Dark/Light Mode"
              className="text-slate-500 hover:text-slate-850 p-2 rounded-xl hover:bg-slate-50 border border-slate-100/50 transition-colors"
            >
              <Moon size={18} className={theme === 'dark' ? 'text-amber-500 fill-amber-500' : 'text-slate-550'} />
            </button>

            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-50 border border-slate-100/50 transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-550" />
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-100 shadow-glossy-md p-4 z-20 text-left">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</h4>
                      {unreadCount > 0 ? (
                        <Badge variant="info">{unreadCount} New</Badge>
                      ) : (
                        <Badge variant="neutral">All Read</Badge>
                      )}
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="space-y-3 py-1 max-h-60 overflow-y-auto">
                      {systemNotifications.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-2">No notifications found.</p>
                      ) : (
                        systemNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              toast.info(n.title, n.description);
                            }}
                            className={`flex gap-3 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-50 ${
                              !n.read ? 'bg-slate-50/50' : ''
                            }`}
                          >
                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                              !n.read
                                ? n.type === 'lead' ? 'bg-brand-550' : n.type === 'deal' ? 'bg-emerald-500' : 'bg-indigo-500'
                                : 'bg-slate-200'
                            }`} />
                            <div>
                              <p className={`text-xs leading-tight ${!n.read ? 'font-bold text-slate-850' : 'font-medium text-slate-500'}`}>
                                {n.title}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{n.description}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="h-px bg-slate-100 my-2" />
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block text-center text-[10px] font-bold text-brand-600 hover:underline pt-1"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-50/80 transition-colors"
              >
                {user && <Avatar name={user.fullName} size="sm" />}
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-glossy-md p-2 z-20">
                    {user && (
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{user.fullName}</p>
                        <p className="text-[10px] font-semibold text-slate-450 truncate">{role || 'Viewer'}</p>
                      </div>
                    )}
                    <div className="py-1">
                      <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-650 hover:bg-slate-50 rounded-lg transition-colors">
                        <User size={14} className="text-slate-400" />
                        <span>My Profile</span>
                      </button>
                      <button onClick={() => { setProfileOpen(false); navigate('/account-settings'); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-650 hover:bg-slate-50 rounded-lg transition-colors">
                        <Settings size={14} className="text-slate-400" />
                        <span>Account Settings</span>
                      </button>
                      <button onClick={() => { setProfileOpen(false); navigate('/sessions'); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-650 hover:bg-slate-50 rounded-lg transition-colors">
                        <Clock size={14} className="text-slate-400" />
                        <span>My Sessions</span>
                      </button>
                      {permissions.includes('settings:access') && (
                        <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-650 hover:bg-slate-50 rounded-lg transition-colors border-t border-slate-100/60 mt-1 pt-2">
                          <Shield size={14} className="text-slate-400" />
                          <span>System Settings</span>
                        </button>
                      )}
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="p-1">
                      <button onClick={() => { setProfileOpen(false); handleLogout(); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <LogOut size={14} className="text-rose-500" />
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
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.995 }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 24,
              mass: 0.8,
            }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Company Workspace Branding Modal */}
      <Modal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title="Workspace & Company Branding"
        size="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center gap-3">
            <Building size={20} className="text-brand-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Active Workspace Branding</h4>
              <p className="text-[11px] text-slate-500">Update company name shown across the header, navigation, and system reports.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Company Name</label>
            <input
              type="text"
              value={editingCompanyName}
              onChange={(e) => setEditingCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full px-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCompanyModal(false);
                navigate('/settings');
              }}
            >
              Full System Settings
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowCompanyModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  if (!editingCompanyName.trim()) return;
                  try {
                    await updateCompanyName(editingCompanyName);
                    toast.success('Workspace Updated', `Company name set to "${editingCompanyName}".`);
                    setShowCompanyModal(false);
                  } catch (err: any) {
                    toast.error('Update Failed', err.response?.data?.message || 'Failed to update company name.');
                  }
                }}
              >
                Save Branding
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Floating Live Chat Concierge Widget */}
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;
