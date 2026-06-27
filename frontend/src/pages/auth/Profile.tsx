import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Edit2, Shield, Calendar, Mail, Phone, Briefcase, Globe, Clock, Compass } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, role, permissions } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-none mb-1">My Profile</h1>
          <p className="text-xs text-slate-450 font-medium">Manage your personal CRM identity and account claims</p>
        </div>
        <Link to="/settings">
          <button className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-650 bg-white shadow-glossy-sm rounded-xl transition-colors">
            <Edit2 size={12} className="text-brand-550" />
            <span>Edit Profile</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Avatar and quick details */}
        <div className="space-y-6">
          <Card className="p-6 flex flex-col items-center text-center relative overflow-hidden bg-white/70 backdrop-blur-xl border-slate-100 shadow-glossy-sm">
            {/* Glossy top decorative header */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-550" />
            
            <Avatar name={user.fullName} size="lg" className="w-20 h-20 text-2xl font-bold border-4 border-white shadow-glossy mb-4" />
            
            <h2 className="text-base font-bold text-slate-800 leading-tight mb-1">{user.fullName}</h2>
            <p className="text-xs font-semibold text-slate-400 mb-3">{user.jobTitle || 'No Title'}</p>
            
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              <Badge variant="success">{user.status || 'Active'}</Badge>
              <Badge variant="info">{role || 'Viewer'}</Badge>
            </div>

            <div className="w-full h-px bg-slate-100/60 my-4" />

            <div className="w-full space-y-3.5 text-left text-xs font-medium text-slate-600">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-slate-400 flex-shrink-0" />
                <span>{user.phone || 'Not configured'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase size={14} className="text-slate-400 flex-shrink-0" />
                <span>{user.department || 'Not configured'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Cards: System Details and permissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account configurations card */}
          <Card className="p-6 space-y-4 bg-white/70 backdrop-blur-xl border-slate-100 shadow-glossy-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Globe size={16} className="text-brand-550" />
              <span>Language & Locale Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl border border-slate-100/80 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Timezone</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
                  <Clock size={14} className="text-slate-400" />
                  <span>{user.timezone || 'UTC (GMT+0)'}</span>
                </div>
              </div>
              
              <div className="p-3.5 rounded-2xl border border-slate-100/80 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Language</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
                  <Globe size={14} className="text-slate-400" />
                  <span>{user.language === 'en' ? 'English (US)' : user.language || 'English (US)'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100/80 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Created Date</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100/80 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Last Login</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-750">
                  <Compass size={14} className="text-slate-400" />
                  <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Permissions / Access tokens claims */}
          <Card className="p-6 space-y-4 bg-white/70 backdrop-blur-xl border-slate-100 shadow-glossy-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield size={16} className="text-brand-550" />
              <span>Assigned Security Claims</span>
            </h3>

            <p className="text-xs text-slate-450 font-medium leading-relaxed mb-4">
              Your roles and permissions determine which dashboard metrics and system features you are authorized to view and interact with.
            </p>

            <div className="h-px bg-slate-100/60 my-2" />

            <div className="flex gap-2 flex-wrap">
              {permissions.includes('*') ? (
                <div className="px-3 py-1.5 text-xs font-bold bg-brand-50 border border-brand-100 rounded-xl text-brand-700 flex items-center gap-2">
                  <Shield size={12} className="text-brand-550" />
                  <span>Super Admin Privilege (*:*)</span>
                </div>
              ) : permissions.length > 0 ? (
                permissions.map((p) => (
                  <span key={p} className="px-2.5 py-1 text-[11px] font-bold bg-slate-50 border border-slate-150 rounded-xl text-slate-650">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-semibold italic">No direct permissions linked. Contact support.</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
