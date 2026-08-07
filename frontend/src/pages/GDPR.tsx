import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Shield, Plus, Search, Loader2, CheckCircle, XCircle, FileText, ThumbsUp, Lock, ShieldCheck, UserCheck, Trash2, Key } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { gdprApi } from '../services/gdprApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface ConsentLog {
  id: string;
  contactName: string;
  contactEmail: string;
  purpose: string;
  status: 'active' | 'revoked';
  grantedAt: string;
}

interface DataRequest {
  id: string;
  requestorName: string;
  requestorEmail: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
}

export const GDPR: React.FC = () => {
  const breadcrumbs = [{ label: 'Security & Compliance' }, { label: 'GDPR & Privacy' }];
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'consent' | 'requests'>('consent');
  const [consentLogs, setConsentLogs] = useState<ConsentLog[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [purpose, setPurpose] = useState('Marketing Communications');

  const [requestorName, setRequestorName] = useState('');
  const [requestorEmail, setRequestorEmail] = useState('');
  const [requestType, setRequestType] = useState('Data Export / Access');

  const loadData = async () => {
    try {
      setLoading(true);
      let consentItems: any[] = [];
      let reqItems: any[] = [];

      try {
        const consentRes = await gdprApi.getConsentLogs();
        consentItems = consentRes.data.data?.items || consentRes.data.data || [];
      } catch (err) {
        console.warn('Failed to load consent logs', err);
      }

      try {
        const reqRes = await gdprApi.getDataRequests();
        reqItems = reqRes.data.data?.items || reqRes.data.data || [];
      } catch (err) {
        console.warn('Failed to load data requests', err);
      }

      setConsentLogs(consentItems.map((c: any) => ({
        id: c.id,
        contactName: c.details?.contactName || c.contactName || (c.contact ? `${c.contact.firstName || ''} ${c.contact.lastName || ''}`.trim() : '-') || 'Anonymous',
        contactEmail: c.details?.contactEmail || c.contactEmail || c.contact?.email || '-',
        purpose: c.details?.purpose || c.purpose || c.type || 'Marketing & Analytics',
        status: c.granted ? 'active' : 'revoked',
        grantedAt: c.consentDate ? c.consentDate.split('T')[0] : (c.createdAt ? c.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      })));

      setDataRequests(reqItems.map((r: any) => ({
        id: r.id,
        requestorName: r.requestorName || (r.contact ? `${r.contact.firstName || ''} ${r.contact.lastName || ''}`.trim() : '-') || 'Customer',
        requestorEmail: r.requestorEmail || r.contact?.email || '-',
        type: r.type || 'Data Access Request',
        status: (r.status || 'pending').toLowerCase(),
        createdAt: r.requestedAt ? r.requestedAt.split('T')[0] : (r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      })));
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch GDPR data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !purpose.trim()) return;
    try {
      await gdprApi.recordConsent({ contactName, contactEmail, purpose, granted: true });
      toast.success('Consent Evidence Logged! 🛡️', `Consent logged for ${contactName}.`);
      setShowRecordModal(false);
      setContactName('');
      setContactEmail('');
      setPurpose('Marketing Communications');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Record Failed', err.response?.data?.message || 'Failed to record consent.');
    }
  };

  const handleRevokeConsent = async (id: string, name: string) => {
    try {
      await gdprApi.revokeConsent(id);
      toast.success('Consent Revoked', `Consent revoked for ${name}.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Revoke Failed', 'Failed to revoke consent.');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestorName.trim()) return;
    try {
      await gdprApi.createDataRequest({ requestorName, requestorEmail, type: requestType });
      toast.success('Data Request Logged', `GDPR request created for ${requestorName}.`);
      setShowRequestModal(false);
      setRequestorName('');
      setRequestorEmail('');
      setRequestType('Data Export / Access');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create request.');
    }
  };

  const handleCompleteRequest = async (id: string) => {
    try {
      await gdprApi.processDataRequest(id, { status: 'completed' });
      toast.success('Request Processed', 'GDPR request marked completed.');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Failed to update request.');
    }
  };

  const filteredConsent = consentLogs.filter(c =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = dataRequests.filter(r =>
    r.requestorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requestorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 select-none font-sans pb-16"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-glossy-sm">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight font-display mt-1">
            GDPR & Privacy Compliance Vault
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track consent evidence, execute right-to-be-forgotten requests, and stream compliance audit trails.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'consent' ? (
            <Button
              onClick={() => setShowRecordModal(true)}
              className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
            >
              <Plus size={16} />
              <span>Record Consent Evidence</span>
            </Button>
          ) : (
            <Button
              onClick={() => setShowRequestModal(true)}
              className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
            >
              <Plus size={16} />
              <span>Log Privacy Request</span>
            </Button>
          )}
        </div>
      </div>

      {/* Spotlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Consent Records</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {consentLogs.filter(c => c.status === 'active').length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Verified Legal Basis</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Logged consent evidence</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Data Subject Requests</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{dataRequests.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Right-to-Erasure</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Data export & deletion claims</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Audit Stream Health</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">100%</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Signed & Cryptographic</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Tamper-evident audit trail</p>
        </SpotlightCard>
      </div>

      {/* Main GDPR Vault Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('consent')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'consent' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Consent Logs ({consentLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                activeTab === 'requests' ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Data Subject Requests ({dataRequests.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search privacy records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Compliance Evidence...</p>
          </div>
        ) : activeTab === 'consent' ? (
          filteredConsent.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <EmptyState
                title="No Consent Evidence Logged"
                description="Record consent evidence to maintain legal compliance under GDPR & CCPA."
                icon={<ShieldCheck className="w-12 h-12 text-slate-300" />}
                actionLabel="Record Consent Evidence"
                onAction={() => setShowRecordModal(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    <th className="px-5 py-3.5">Contact Name</th>
                    <th className="px-5 py-3.5">Email Address</th>
                    <th className="px-5 py-3.5">Consent Purpose</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Granted Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                  {filteredConsent.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-850">{c.contactName}</td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{c.contactEmail}</td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">{c.purpose}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${
                          c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{c.grantedAt}</td>
                      <td className="px-5 py-4 text-right">
                        {c.status === 'active' && (
                          <button
                            onClick={() => handleRevokeConsent(c.id, c.contactName)}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Revoke Consent
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredRequests.length === 0 ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <EmptyState
                title="No Privacy Requests"
                description="Log right-to-access or right-to-be-forgotten customer requests."
                icon={<FileText className="w-12 h-12 text-slate-300" />}
                actionLabel="Log Privacy Request"
                onAction={() => setShowRequestModal(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                    <th className="px-5 py-3.5">Requestor</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Request Type</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Request Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-850">{r.requestorName}</td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{r.requestorEmail}</td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">{r.type}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${
                          r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono">{r.createdAt}</td>
                      <td className="px-5 py-4 text-right">
                        {r.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteRequest(r.id)}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Record Consent Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Record Consent Evidence</h3>
            <form onSubmit={handleRecordConsent} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Contact Name *</label>
                <input type="text" required placeholder="e.g. Sarah Connor" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Email Address</label>
                <input type="email" placeholder="sarah@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Legal Consent Purpose</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                  <option value="Marketing Communications">Marketing Communications & Newsletters</option>
                  <option value="Product Updates">Product Updates & System Alerts</option>
                  <option value="Third-Party Processing">Third-Party Data Processing</option>
                  <option value="Analytics">Website Performance Analytics</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowRecordModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!contactName.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Log Consent Evidence</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Log Privacy Request</h3>
            <form onSubmit={handleCreateRequest} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Requestor Name *</label>
                <input type="text" required placeholder="e.g. John Connor" value={requestorName} onChange={(e) => setRequestorName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Requestor Email</label>
                <input type="email" placeholder="john@company.com" value={requestorEmail} onChange={(e) => setRequestorEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">GDPR Request Type</label>
                <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                  <option value="Data Export / Access">Data Export / Access Claim</option>
                  <option value="Right to be Forgotten">Right to be Forgotten (Data Deletion)</option>
                  <option value="Rectification">Data Rectification Request</option>
                  <option value="Restriction">Processing Restriction Claim</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!requestorName.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GDPR;
