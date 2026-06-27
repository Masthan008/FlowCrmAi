import React from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Settings as SettingsIcon, Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const Settings: React.FC = () => {
  const breadcrumbs = [{ label: 'Settings' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Settings</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-brand-550 mb-1">
              <Sliders size={20} />
              <CardTitle>System Configuration</CardTitle>
            </div>
            <CardDescription>
              Manage parameters of your enterprise CRM instances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 leading-relaxed">
              System parameter modules, workspace preferences, API keys management, and advanced database indexes configurations will be available in the subsequent development phases.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-brand-550 mb-1">
              <SettingsIcon size={20} />
              <CardTitle>Company Preferences</CardTitle>
            </div>
            <CardDescription>
              Configure branding colors, custom fields, and localization settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 leading-relaxed">
              Branding options, email connection engines, localization (time zones, currencies, languages), and team-wide rules settings will configure here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
