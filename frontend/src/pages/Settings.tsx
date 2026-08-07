import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useToast } from '../components/ui/ToastProvider';
import { api } from '../services/api';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Settings as SettingsIcon, Sliders, User, Shield, Bell, Palette,
  Globe, Lock, Moon, Sun, Loader2, Save, Eye, EyeOff, Check,
  Monitor, Layers, Plus, CheckSquare, Square, Building2, Key,
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Cpu
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters')
    .regex(/[a-z]/, 'Need a lowercase letter')
    .regex(/[A-Z]/, 'Need an uppercase letter')
    .regex(/\d/, 'Need a number'),
  confirmPassword: z.string().min(1, 'Please confirm'),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileFields = z.infer<typeof profileSchema>;
type PasswordFields = z.infer<typeof passwordSchema>;

const TIMEZONES = [
  'UTC', 'Asia/Kolkata', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney',
];

const LANGUAGES = [
  { value: 'en', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
    leadAssignments: true,
    dealUpdates: true,
    taskReminders: true,
  });

  const [cacheExpiry, setCacheExpiry] = useState(300);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const [rateLimit, setRateLimit] = useState(60);
  const [companyName, setCompanyName] = useState('FlowCRM Enterprise');
  const [supportEmail, setSupportEmail] = useState('support@flowcrm.ai');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');

  // RBAC State
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);

  useEffect(() => {
    api.get('/settings')
      .then(res => {
        const d = res.data.data;
        if (d) {
          setCompanyName(d.companyName || user?.company?.name || 'FlowCRM Enterprise');
          setSupportEmail(d.supportEmail || 'support@flowcrm.ai');
          setDefaultCurrency(d.defaultCurrency || user?.company?.currency || 'INR');
          setCacheExpiry(d.cacheExpiry || 300);
          setRateLimit(d.rateLimit || 60);
          setWebhooksEnabled(d.webhooksEnabled ?? true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'rbac') {
      Promise.all([api.get('/roles'), api.get('/permissions')])
        .then(([rolesRes, permRes]) => {
          const rList = rolesRes.data.data || [];
          setRoles(rList);
          setPermissions(permRes.data.data || []);
          if (rList.length > 0 && !selectedRole) {
            setSelectedRole(rList[0]);
            const pIds = rList[0].permissions?.map((p: any) => p.permissionId || p.permission?.id) || [];
            setSelectedPermissions(pIds);
          }
        })
        .catch(() => toast.error('RBAC Load Failed', 'Could not load roles and permissions.'));
    } else if (activeTab === 'pipelines') {
      api.get('/pipelines')
        .then(res => setPipelines(res.data.data || []))
        .catch(() => toast.error('Pipeline Load Failed', 'Could not load pipeline configurations.'));
    }
  }, [activeTab]);

  const profileForm = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'Asia/Kolkata',
      language: user?.language || 'en',
      department: user?.department || 'Management',
      jobTitle: user?.jobTitle || 'Administrator',
    },
  });

  const passwordForm = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        timezone: user.timezone || 'Asia/Kolkata',
        language: user.language || 'en',
        department: user.department || 'Management',
        jobTitle: user.jobTitle || 'Administrator',
      });
    }
  }, [user]);

  const onSaveProfile = async (data: ProfileFields) => {
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', data);
      const updatedData = res.data.data;
      updateUser(updatedData);

      toast.success(
        'Profile Saved! 🎉',
        `Your name has been updated to ${updatedData.firstName} ${updatedData.lastName}`
      );
    } catch (err: any) {
      toast.error('Save Failed', err.response?.data?.message || 'Could not save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const onChangePassword = async (data: PasswordFields) => {
    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password Updated', 'Your security password has been changed.');
      passwordForm.reset();
    } catch (err: any) {
      toast.error('Update Failed', err.response?.data?.message || 'Could not change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings', {
        companyName,
        supportEmail,
        defaultCurrency,
        cacheExpiry,
        rateLimit,
        webhooksEnabled,
      });
      toast.success('System Settings Saved', 'Enterprise configuration saved successfully.');
    } catch (err: any) {
      toast.error('Save Failed', err.response?.data?.message || 'Could not save settings.');
    }
  };

  const breadcrumbs = [{ label: 'Settings & Configurations' }];

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Theme & Styling', icon: Palette },
    { id: 'security', label: 'Security & 2FA', icon: Lock },
    { id: 'system', label: 'Enterprise System', icon: SettingsIcon },
    { id: 'rbac', label: 'RBAC Matrix', icon: Shield },
    { id: 'pipelines', label: 'Sales Pipelines', icon: Layers },
  ];

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl bg-slate-50/80 focus:outline-none focus:bg-white focus:border-brand-550 focus:ring-4 focus:ring-brand-100/60 transition-all font-medium text-slate-800 shadow-sm ${
      hasError ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200/80'
    }`;

  return (
    <div className="space-y-8 select-none font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-glossy-sm">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-xl sm:text-3xl font-black text-slate-850 tracking-tight leading-none mt-1.5 font-display flex items-center gap-3">
            <span>Settings & Preferences</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-extrabold shadow-sm">
              <Building2 className="w-3.5 h-3.5" /> {companyName}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage your personal profile credentials, RBAC matrix, branding, and system defaults.
          </p>
        </div>
      </div>

      {/* Main Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-150">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'text-white bg-brand-550 shadow-glossy'
                  : 'text-slate-600 hover:text-slate-850 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-2xl bg-brand-550 -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {/* ─── 1. USER PROFILE TAB ──────────────────────────────────── */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Avatar Profile Preview */}
            <div className="lg:col-span-4 bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6 text-center">
              <div className="relative inline-block">
                <Avatar name={user?.fullName || 'User'} size="xl" className="mx-auto shadow-glossy border-4 border-white" />
                <div className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full border-2 border-white text-white shadow-md">
                  <CheckCircle2 size={12} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-850">{user?.fullName}</h3>
                <p className="text-xs text-brand-600 font-bold mt-0.5">{user?.jobTitle || 'Administrator'}</p>
                <p className="text-[11px] text-slate-450 font-medium">{user?.email}</p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-150 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Organization</span>
                  <span className="font-bold text-slate-850">{user?.company?.name || companyName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Currency</span>
                  <span className="font-mono font-bold text-brand-600">{user?.company?.currency || defaultCurrency}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Department</span>
                  <span className="font-bold text-slate-850">{user?.department || 'Management'}</span>
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="lg:col-span-8 bg-white/90 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-glossy-lg backdrop-blur-xl space-y-6">
              <div className="border-b border-slate-150 pb-4">
                <h3 className="text-lg font-black text-slate-850">Personal Identity Credentials</h3>
                <p className="text-xs text-slate-500 font-medium">Update your display name, contact phone, and timezone.</p>
              </div>

              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">First Name *</label>
                    <input
                      type="text"
                      {...profileForm.register('firstName')}
                      className={inputClass(!!profileForm.formState.errors.firstName)}
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-xs font-bold text-rose-500">{profileForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Last Name *</label>
                    <input
                      type="text"
                      {...profileForm.register('lastName')}
                      className={inputClass(!!profileForm.formState.errors.lastName)}
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-xs font-bold text-rose-500">{profileForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Mobile Phone</label>
                    <input
                      type="text"
                      {...profileForm.register('phone')}
                      className={inputClass(false)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Department</label>
                    <input
                      type="text"
                      {...profileForm.register('department')}
                      className={inputClass(false)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Timezone</label>
                    <select {...profileForm.register('timezone')} className={inputClass(false)}>
                      {TIMEZONES.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Language</label>
                    <select {...profileForm.register('language')} className={inputClass(false)}>
                      {LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-glossy flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>Save Profile Changes</span>
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ─── 2. APPEARANCE TAB ───────────────────────────────────── */}
        {activeTab === 'appearance' && (
          <motion.div
            key="appearance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/90 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-glossy-lg backdrop-blur-xl space-y-6"
          >
            <div className="border-b border-slate-150 pb-4">
              <h3 className="text-lg font-black text-slate-850">Visual Theme & Display Preferences</h3>
              <p className="text-xs text-slate-500 font-medium">Switch between White-Glossy Light and Dark theme accents.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                onClick={() => setTheme('white-glossy')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 ${
                  theme !== 'dark' ? 'border-brand-550 bg-brand-50/40 shadow-glossy-md' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-extrabold text-slate-850">Luminous White-Glossy Light</h4>
                  </div>
                  {theme !== 'dark' && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clean, bright glassmorphic layout optimized for maximum contrast, executive readability, and sharp visual polish.
                </p>
              </div>

              <div
                onClick={() => setTheme('dark')}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-4 ${
                  theme === 'dark' ? 'border-brand-550 bg-slate-900 text-white shadow-xl' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-extrabold">Midnight Dark Mode</h4>
                  </div>
                  {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-contrast dark slate palette designed for low-light environments and long engineering sessions.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 3. SECURITY TAB ─────────────────────────────────────── */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/90 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-glossy-lg backdrop-blur-xl space-y-6"
          >
            <div className="border-b border-slate-150 pb-4">
              <h3 className="text-lg font-black text-slate-850">Security & Authentication</h3>
              <p className="text-xs text-slate-500 font-medium">Update your account password and review multi-factor authentication.</p>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Current Password *</label>
                <input
                  type="password"
                  {...passwordForm.register('currentPassword')}
                  className={inputClass(!!passwordForm.formState.errors.currentPassword)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">New Password *</label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword')}
                  className={inputClass(!!passwordForm.formState.errors.newPassword)}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs font-bold text-rose-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Confirm New Password *</label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  className={inputClass(!!passwordForm.formState.errors.confirmPassword)}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-brand-550 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-glossy flex items-center gap-2 cursor-pointer"
                >
                  {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ─── 4. SYSTEM & BRANDING TAB ───────────────────────────── */}
        {activeTab === 'system' && (
          <motion.div
            key="system"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/90 border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-glossy-lg backdrop-blur-xl space-y-6"
          >
            <div className="border-b border-slate-150 pb-4">
              <h3 className="text-lg font-black text-slate-850">System Configurations & Enterprise Branding</h3>
              <p className="text-xs text-slate-500 font-medium">Configure company name, base currency, and API throttling limits.</p>
            </div>

            <form onSubmit={handleSaveSystem} className="space-y-5 max-w-xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Workspace Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass(false)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={inputClass(false)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className={inputClass(false)}
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-brand-550 text-white font-extrabold text-xs py-3 px-6 rounded-xl shadow-glossy flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Save System Settings</span>
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
