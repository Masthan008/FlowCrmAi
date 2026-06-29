import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import {
  Settings as SettingsIcon, Sliders, User, Shield, Bell, Palette,
  Globe, Lock, Moon, Sun, Loader2, Save, Eye, EyeOff, Check,
  Monitor, Smartphone
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
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
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata',
  'Australia/Sydney', 'Pacific/Auckland',
];

const LANGUAGES = [
  { value: 'en', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

const Settings: React.FC = () => {
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
    marketingEmails: false,
  });

  const profileForm = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'UTC',
      language: user?.language || 'en',
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
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
      });
    }
  }, [user]);

  const onSaveProfile = async (data: ProfileFields) => {
    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', data);
      updateUser(res.data.data);
      toast.success('Profile Updated', 'Your profile has been saved successfully.');
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
      toast.success('Password Changed', 'Your password has been updated successfully.');
      passwordForm.reset();
    } catch (err: any) {
      toast.error('Update Failed', err.response?.data?.message || 'Could not change password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveNotifications = async () => {
    toast.success('Preferences Saved', 'Notification preferences updated locally.');
  };

  const breadcrumbs = [{ label: 'Settings' }];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'system', label: 'System', icon: SettingsIcon },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account, preferences, and system configuration</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-550 text-white shadow-glossy-sm'
                : 'text-slate-400 hover:text-slate-700 bg-transparent'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-brand-50 rounded-xl"><User size={18} className="text-brand-600" /></div>
              <h2 className="text-base font-semibold text-slate-800">Personal Information</h2>
            </div>
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">First Name</label>
                  <input {...profileForm.register('firstName')} className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium" />
                  {profileForm.formState.errors.firstName && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Last Name</label>
                  <input {...profileForm.register('lastName')} className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium" />
                  {profileForm.formState.errors.lastName && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input {...profileForm.register('phone')} placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Timezone</label>
                  <select {...profileForm.register('timezone')} className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium">
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Language</label>
                  <select {...profileForm.register('language')} className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSaving} variant="primary" size="md">
                  {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-amber-50 rounded-xl"><Bell size={18} className="text-amber-600" /></div>
              <h2 className="text-base font-semibold text-slate-800">Notification Preferences</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50/60 cursor-pointer transition-all">
                  <span className="text-sm font-semibold text-slate-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  </span>
                  <div
                    onClick={() => toggleNotification(key as keyof typeof notifications)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? 'bg-brand-550' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-glossy-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={saveNotifications} variant="primary" size="sm">
                <Save size={14} className="mr-1.5" /> Save Preferences
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-violet-50 rounded-xl"><Palette size={18} className="text-violet-600" /></div>
              <h2 className="text-base font-semibold text-slate-800">Theme & Appearance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'white-glossy', label: 'White Glossy', icon: Sun, desc: 'Clean light theme with glossy accents' },
                { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Easy on the eyes, low-light optimized' },
                { id: 'system', label: 'System Default', icon: Monitor, desc: 'Follows your device theme setting' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme?.(t.id); localStorage.setItem('flowcrm_theme', t.id); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    theme === t.id
                      ? 'border-brand-550 bg-brand-50/30 shadow-glossy-sm'
                      : 'border-slate-150 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl inline-block mb-3 ${theme === t.id ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                    <t.icon size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{t.label}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{t.desc}</p>
                  {theme === t.id && <Check size={14} className="text-brand-550 mt-2" />}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-rose-50 rounded-xl"><Lock size={18} className="text-rose-600" /></div>
              <h2 className="text-base font-semibold text-slate-800">Change Password</h2>
            </div>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Current Password</label>
                <input type="password" {...passwordForm.register('currentPassword')} className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium" />
                {passwordForm.formState.errors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>}
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">New Password</label>
                <input type={showPassword ? 'text' : 'password'} {...passwordForm.register('newPassword')} className="w-full px-4 py-2.5 pr-10 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
                <input type="password" {...passwordForm.register('confirmPassword')} className="w-full px-4 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60 transition-all font-medium" />
                {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isUpdatingPassword} variant="primary" size="md">
                  {isUpdatingPassword ? <Loader2 size={16} className="animate-spin mr-2" /> : <Lock size={16} className="mr-2" />}
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <motion.div key="system" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-cyan-50 rounded-xl"><Sliders size={18} className="text-cyan-600" /></div>
              <h2 className="text-base font-semibold text-slate-800">System Configuration</h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              System parameter modules, workspace preferences, API keys management,
              and advanced database indexes will be available in future updates.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl"><Globe size={18} className="text-indigo-600" /></div>
              <h2 className="text-base font-semibold text-slate-800">Company Preferences</h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Branding options, email connection engines, localization settings,
              and team-wide rules will be configurable here in upcoming releases.
            </p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Settings;
