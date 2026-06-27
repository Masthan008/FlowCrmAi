import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, KeyRound, Globe, User } from 'lucide-react';

// Profile fields validation
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
});

// Password modal validation
const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters long')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/\d/, 'Must contain at least one number')
    .regex(/[@$!%*?&_#]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFields = z.infer<typeof passwordSchema>;

export const AccountSettings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<any>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'UTC',
      language: user?.language || 'en',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
  });

  // Submit Profile Edits
  const onProfileSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const response = await api.put('/auth/profile', data);
      const updatedUser = response.data.data;
      
      // Update store
      updateUser(updatedUser);
      toast.success('Profile Updated', 'Personal settings saved successfully.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile settings.';
      toast.error('Update Failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Password Change
  const onPasswordSubmit = async (data: PasswordFields) => {
    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      toast.success('Password Changed', 'Credentials updated. Older sessions have been invalidated.');
      setModalOpen(false);
      resetPasswordForm();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password update failed. Double-check your credentials.';
      toast.error('Update Failed', message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 leading-none mb-1">Account Settings</h1>
        <p className="text-xs text-slate-450 font-medium">Update your account configuration profile parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Navigation Links / Password Action Card */}
        <div className="space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-xl border-slate-100 shadow-glossy-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider mb-2">
              Quick Actions
            </h3>
            
            <button
              onClick={() => setModalOpen(true)}
              className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-150/70 bg-white shadow-glossy-sm rounded-xl transition-all"
            >
              <span className="flex items-center gap-2">
                <KeyRound size={14} className="text-slate-400" />
                <span>Change Password</span>
              </span>
              <span className="text-[10px] text-brand-550 font-bold uppercase tracking-wider">Configure</span>
            </button>
          </Card>
        </div>

        {/* Right Side: Account settings form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 bg-white/70 backdrop-blur-xl border-slate-100 shadow-glossy-sm">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
              <User size={16} className="text-brand-550" />
              <span>Personal Information</span>
            </h2>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">First Name</label>
                  <input
                    type="text"
                    {...registerProfile('firstName')}
                    className={`w-full px-3.5 py-2 text-xs border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                      profileErrors.firstName ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-150 focus:ring-brand-100/60'
                    }`}
                  />
                  {profileErrors.firstName?.message && (
                    <p className="text-[10px] font-bold text-rose-500">{String(profileErrors.firstName.message)}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Last Name</label>
                  <input
                    type="text"
                    {...registerProfile('lastName')}
                    className={`w-full px-3.5 py-2 text-xs border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                      profileErrors.lastName ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-150 focus:ring-brand-100/60'
                    }`}
                  />
                  {profileErrors.lastName?.message && (
                    <p className="text-[10px] font-bold text-rose-500">{String(profileErrors.lastName.message)}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  {...registerProfile('phone')}
                  className="w-full px-3.5 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-100/60 transition-all font-medium"
                />
              </div>

              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mt-8 mb-5 flex items-center gap-2 border-t border-slate-100/60 pt-6">
                <Globe size={16} className="text-brand-550" />
                <span>Regional Settings</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Language</label>
                  <select
                    {...registerProfile('language')}
                    className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-100/60 transition-all font-semibold text-slate-700"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-650 tracking-wide uppercase">Timezone</label>
                  <select
                    {...registerProfile('timezone')}
                    className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-100/60 transition-all font-semibold text-slate-700"
                  >
                    <option value="UTC">UTC (Greenwich Mean Time)</option>
                    <option value="America/New_York">EST (Eastern Standard Time)</option>
                    <option value="Europe/London">GMT (London Time)</option>
                    <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                  </select>
                </div>
              </div>

              <div className="h-px bg-slate-100/60 my-4" />

              <Button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-6 bg-brand-550 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Password Update Glossy Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-glossy-lg rounded-3xl max-w-md w-full p-6 relative z-10 animate-scale-up">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <KeyRound size={16} className="text-brand-550" />
              <span>Update Credentials</span>
            </h2>
            <p className="text-[11px] text-slate-450 font-semibold mb-6">
              Enter your old credentials to qualify and assign your new login parameters.
            </p>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Old Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-655 tracking-wide uppercase">Old Password</label>
                <input
                  type="password"
                  {...registerPassword('oldPassword')}
                  className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                    passwordErrors.oldPassword ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-150 focus:ring-brand-100/60'
                  }`}
                />
                {passwordErrors.oldPassword && (
                  <p className="text-[10px] font-bold text-rose-500">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-655 tracking-wide uppercase">New Password</label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                    passwordErrors.newPassword ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-150 focus:ring-brand-100/60'
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-[10px] font-bold text-rose-500 leading-tight">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-655 tracking-wide uppercase">Confirm New Password</label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 transition-all font-medium ${
                    passwordErrors.confirmPassword ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-150 focus:ring-brand-100/60'
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[10px] font-bold text-rose-500">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100/60">
                <Button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetPasswordForm();
                  }}
                  className="py-1.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="py-1.5 px-4 bg-brand-550 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Password</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
