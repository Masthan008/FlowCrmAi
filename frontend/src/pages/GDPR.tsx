import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Shield, Plus, Search, Loader2, CheckCircle, XCircle, FileText, ThumbsUp } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { gdprApi } from '../services/gdprApi';

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
  const breadcrumbs = [{ label: 'GDPR & Privacy' }];
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
  const [purpose, setPurpose] = useState('');

  const [requestorName, setRequestorName] = useState('');
  const [requestorEmail, setRequestorEmail] = useState('');
  const [requestType, setRequestType] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [consentRes, reqRes] = await Promise.all([
        gdprApi.getConsentLogs(),
        gdprApi.getDataRequests(),
      ]);

      const consentItems = consentRes.data.data?.items || [];
      setConsentLogs(consentItems.map((c: any) => ({
        id: c.id,
        contactName: c.contactName || '-',
        contactEmail: c.contactEmail || '-',
        purpose: c.purpose,
        status: c.status || 'active',
        grantedAt: c.grantedAt ? c.grantedAt.split('T')[0] : '',
      })));

      const reqItems = reqRes.data.data?.items || [];
      setDataRequests(reqItems.map((r: any) => ({
        id: r.id,
        requestorName: r.requestorName || '-',
        requestorEmail: r.requestorEmail || '-',
        type: r.type || 'access',
        status: r.status || 'pending',
        createdAt: r.createdAt ? r.createdAt.split('T')[0] : '',
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
      await gdprApi.recordConsent({ contactName, contactEmail, purpose });
      toast.success('Consent Recorded', 'Consent log entry created.');
      setShowRecordModal(false);
      setContactName('');
      setContactEmail('');
      setPurpose('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed', err.response?.data?.message || 'Failed to record consent.');
    }
  };

  const handleRevokeConsent = async (id: string) => {
    if (confirm('Revoke this consent?')) {
      try {
        await gdprApi.revokeConsent(id);
        toast.success('Consent Revoked', 'Consent has been revoked.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Failed', 'Failed to revoke consent.');
      }
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestorName.trim() || !requestType.trim()) return;
    try {
      await gdprApi.createDataRequest({ requestorName, requestorEmail, type: requestType });
      toast.success('Request Created', 'Data request submitted.');
      setShowRequestModal(false);
      setRequestorName('');
      setRequestorEmail('');
      setRequestType('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed', err.response?.data?.message || 'Failed to create request.');
    }
  };

  const handleRequestAction = async (id: string, action: 'process' | 'complete' | 'reject') => {
    try {
      if (action === 'process') await gdprApi.processDataRequest(id);
      else if (action === 'complete') await gdprApi.completeDataRequest(id);
      else await gdprApi.rejectDataRequest(id);
      toast.success('Updated', `Request ${action}ed.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed', `Failed to ${action} request.`);
    }
  };

  const consentStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      revoked: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return map[status] || map.active;
  };

  const requestStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      processing: 'bg-blue-50 text-blue-700 border-blue-100',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return map[status] || map.pending;
  };

  const tabs = [
    { key: 'consent' as const, label: 'Consent Logs', count: consentLogs.length },
    { key: 'requests' as const, label: 'Data Requests', count: dataRequests.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">GDPR & Privacy</h1>
        </div>
        <div className="flex gap-2">
          {activeTab === 'consent' && (
            <Button onClick={() => setShowRecordModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
              <Plus size={14} /><span>Record Consent</span>
            </Button>
          )}
          {activeTab === 'requests' && (
            <Button onClick={() => setShowRequestModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
              <Plus size={14} /><span>New Request</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100/50 rounded-xl p-1 max-w-xs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-lg transition-all ${
              activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading GDPR data...</p>
          </div>
        ) : activeTab === 'consent' ? (
          <>
            {consentLogs.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search consent logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}
            {consentLogs.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState title="No Consent Logs" description="Record privacy consents from your contacts." icon={<Shield className="w-12 h-12 text-slate-300" />} actionLabel="Record Consent" onAction={() => setShowRecordModal(true)} />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Contact</th>
                      <th className="px-4 py-2.5">Purpose</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Granted</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {consentLogs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{c.contactName}</div>
                          <div className="text-[10px] text-slate-400">{c.contactEmail}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600">{c.purpose}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${consentStatusBadge(c.status)}`}>
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{c.grantedAt}</td>
                        <td className="px-4 py-3 text-right">
                          {c.status === 'active' && (
                            <button onClick={() => handleRevokeConsent(c.id)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Revoke">
                              <XCircle size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {dataRequests.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search requests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}
            {dataRequests.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState title="No Data Requests" description="Manage subject access and data deletion requests." icon={<FileText className="w-12 h-12 text-slate-300" />} actionLabel="New Request" onAction={() => setShowRequestModal(true)} />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Requestor</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {dataRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{r.requestorName}</div>
                          <div className="text-[10px] text-slate-400">{r.requestorEmail}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-600 uppercase">{r.type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${requestStatusBadge(r.status)}`}>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{r.createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {r.status === 'pending' && (
                              <button onClick={() => handleRequestAction(r.id, 'process')} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400" title="Process">
                                <ThumbsUp size={13} />
                              </button>
                            )}
                            {r.status === 'processing' && (
                              <>
                                <button onClick={() => handleRequestAction(r.id, 'complete')} className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400" title="Complete">
                                  <CheckCircle size={13} />
                                </button>
                                <button onClick={() => handleRequestAction(r.id, 'reject')} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Reject">
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Record Consent</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Log a privacy consent entry.</p>
            <form onSubmit={handleRecordConsent} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Name *</label>
                <input type="text" required placeholder="Jane Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Email</label>
                <input type="email" placeholder="jane@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Purpose *</label>
                <input type="text" required placeholder="Marketing emails" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowRecordModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!contactName.trim() || !purpose.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Record Consent</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Data Request</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Create a subject access or deletion request.</p>
            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Requestor Name *</label>
                <input type="text" required placeholder="John Smith" value={requestorName} onChange={(e) => setRequestorName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Requestor Email</label>
                <input type="email" placeholder="john@example.com" value={requestorEmail} onChange={(e) => setRequestorEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Request Type *</label>
                <select value={requestType} onChange={(e) => setRequestType(e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  <option value="">Select type...</option>
                  <option value="access">Access</option>
                  <option value="deletion">Deletion</option>
                  <option value="rectification">Rectification</option>
                  <option value="portability">Portability</option>
                  <option value="objection">Objection</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!requestorName.trim() || !requestType.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDPR;
