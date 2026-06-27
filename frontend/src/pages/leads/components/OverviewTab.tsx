import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Star, Mail, Phone, Globe, MapPin, Briefcase, Building2, Calendar, Clock, User, Tag, Linkedin, Twitter, Facebook } from 'lucide-react';
import type { Lead } from '../../../types/lead';

interface OverviewTabProps {
  profile: any;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ profile }) => {
  if (!profile) return null;

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
      <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={16} className={color} />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
    </div>
  );

  const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="text-sm text-slate-700 font-medium break-words">{value || <span className="text-slate-300">—</span>}</div>
    </div>
  );

  // Social Links
  const socials = profile.socialLinks || {};

  return (
    <div className="space-y-6">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Details */}
        <Card className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <SectionHeader icon={Phone} title="Contact Details" color="text-violet-600" />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Email Address" value={profile.email} />
            <DetailField label="Mobile Phone" value={profile.phone} />
            <DetailField label="Alternate Phone" value={profile.alternatePhone} />
            <DetailField label="Job Title" value={profile.jobTitle} />
          </div>
        </Card>

        {/* Company Details */}
        <Card className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <SectionHeader icon={Building2} title="Company Information" color="text-cyan-600" />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Company Name" value={profile.companyName} />
            <DetailField label="Industry Sector" value={profile.industry} />
            <DetailField label="Website URL" value={
              profile.website ? (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  {profile.website}
                  <Globe size={12} className="inline" />
                </a>
              ) : null
            } />
          </div>
        </Card>

        {/* Address Card */}
        <Card className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <SectionHeader icon={MapPin} title="Address Details" color="text-emerald-600" />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Street" value={profile.address} />
            <DetailField label="City" value={profile.city} />
            <DetailField label="State / Province" value={profile.state} />
            <DetailField label="Country" value={profile.country} />
            <DetailField label="Postal Code" value={profile.postalCode} />
          </div>
        </Card>

        {/* Social Links & Tags */}
        <Card className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <SectionHeader icon={Tag} title="Social Profiles & Tags" color="text-rose-600" />
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Social Channels</span>
              <div className="flex flex-wrap gap-4">
                <a
                  href={socials.linkedin || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    socials.linkedin
                      ? 'border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-50'
                      : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                  onClick={(e) => !socials.linkedin && e.preventDefault()}
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
                <a
                  href={socials.twitter || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    socials.twitter
                      ? 'border-sky-200 bg-sky-50/50 text-sky-700 hover:bg-sky-50'
                      : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                  onClick={(e) => !socials.twitter && e.preventDefault()}
                >
                  <Twitter size={14} />
                  Twitter
                </a>
                <a
                  href={socials.facebook || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    socials.facebook
                      ? 'border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50'
                      : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                  onClick={(e) => !socials.facebook && e.preventDefault()}
                >
                  <Facebook size={14} />
                  Facebook
                </a>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Lead Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.tags && profile.tags.length > 0 ? (
                  profile.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="glass"
                      className="px-2.5 py-0.5 rounded-lg text-xs border font-medium bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium">No tags assigned.</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Description */}
      {profile.description && (
        <Card className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
          <SectionHeader icon={Briefcase} title="Lead Overview & Description" color="text-amber-600" />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
            {profile.description}
          </p>
        </Card>
      )}

      {/* Statistics */}
      <Card className="p-5 bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
        <SectionHeader icon={Clock} title="Lead Engagement Statistics" color="text-blue-600" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailField label="First Contact Date" value={profile.statistics?.firstContact ? new Date(profile.statistics.firstContact).toLocaleString() : 'Never'} />
          <DetailField label="Last Contact Date" value={profile.statistics?.lastContact ? new Date(profile.statistics.lastContact).toLocaleString() : 'Never'} />
          <DetailField label="Created Date" value={new Date(profile.statistics?.createdAt).toLocaleString()} />
          <DetailField label="Last Updated Date" value={new Date(profile.statistics?.updatedAt).toLocaleString()} />
        </div>
      </Card>
    </div>
  );
};
