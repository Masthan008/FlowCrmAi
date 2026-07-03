import React, { useEffect, useState } from 'react';
import { useCompanyStore } from '../../../store/companyStore';
import { useToast } from '../../../components/ui/ToastProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2,
  XCircle, FileText, Upload, Clock, UserCheck, RefreshCw,
  Plus, Eye, CheckSquare, FileCheck, Shield, Award, Calendar
} from 'lucide-react';

interface CompanyKYCTabProps {
  companyId: string;
}

export const CompanyKYCTab: React.FC<CompanyKYCTabProps> = ({ companyId }) => {
  const toast = useToast();
  const { kyc, fetchKYC, updateKYC } = useCompanyStore();
  const [updating, setUpdating] = useState(false);

  // Local state for verifier notes & document upload modal
  const [notes, setNotes] = useState('');
  const [riskRating, setRiskRating] = useState('Low');
  const [verificationType, setVerificationType] = useState('Standard');
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Business License');
  const [showDocModal, setShowDocModal] = useState(false);

  useEffect(() => {
    fetchKYC(companyId);
  }, [companyId]);

  useEffect(() => {
    if (kyc) {
      setNotes(kyc.notes || '');
      setRiskRating(kyc.riskRating || 'Low');
      setVerificationType(kyc.verificationType || 'Standard');
    }
  }, [kyc]);

  if (!kyc) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <RefreshCw size={28} className="mx-auto text-slate-400 animate-spin" />
        <p className="text-xs font-semibold">Loading KYC Compliance details...</p>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateKYC(companyId, {
        ...kyc,
        status: newStatus,
        riskRating,
        verificationType,
        notes
      });
      toast.success('KYC Status Updated', `Compliance status changed to ${newStatus}.`);
    } catch {
      toast.error('Failed to update KYC status');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleChecklist = async (checkId: string) => {
    const currentList = Array.isArray(kyc.checklist) ? kyc.checklist : [];
    const updated = currentList.map((item: any) => {
      if (item.id === checkId) {
        return {
          ...item,
          passed: !item.passed,
          checkedAt: !item.passed ? new Date().toISOString() : undefined
        };
      }
      return item;
    });

    try {
      await updateKYC(companyId, { ...kyc, checklist: updated, notes, riskRating, verificationType });
      toast.success('Checklist Item Saved', 'Compliance checkpoint updated.');
    } catch {
      toast.error('Failed to update checklist');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const currentDocs = Array.isArray(kyc.documents) ? kyc.documents : [];
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName,
      type: newDocType,
      key: newDocType.toLowerCase().replace(/\s+/g, '-'),
      url: '/documents/verified-kyc.pdf',
      status: 'Approved',
      uploadedAt: new Date().toISOString()
    };

    try {
      await updateKYC(companyId, {
        ...kyc,
        documents: [...currentDocs, newDoc],
        notes,
        riskRating,
        verificationType
      });
      setNewDocName('');
      setShowDocModal(false);
      toast.success('Document Added', 'Compliance document attached to account.');
    } catch {
      toast.error('Failed to attach document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200"><ShieldCheck size={14} /> Verified Account</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200"><Clock size={14} /> Verification In Progress</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200"><XCircle size={14} /> KYC Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle size={14} /> Pending KYC Review</span>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Risk: {risk}</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Risk: Medium</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Risk: Low Risk</span>;
    }
  };

  const checklistItems = Array.isArray(kyc.checklist) ? kyc.checklist : [];
  const documents = Array.isArray(kyc.documents) ? kyc.documents : [];
  const auditLogs = Array.isArray(kyc.history) ? kyc.history : [];

  return (
    <div className="space-y-6 text-left">
      {/* Hero Banner Header */}
      <Card className="p-6 bg-white/80 shadow-glossy space-y-5 border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-800">Know Your Customer (KYC) & Compliance Hub</h3>
              {getStatusBadge(kyc.status)}
              {getRiskBadge(kyc.riskRating)}
            </div>
            <p className="text-xs text-slate-400 font-medium">Verify business identity, UBO declarations, and regulatory compliance status</p>
          </div>

          <div className="flex gap-2">
            {kyc.status !== 'Verified' && (
              <Button
                variant="primary"
                size="sm"
                disabled={updating}
                onClick={() => handleStatusChange('Verified')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <ShieldCheck size={14} className="mr-1.5" /> Approve & Verify
              </Button>
            )}
            {kyc.status !== 'In Progress' && (
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => handleStatusChange('In Progress')}
              >
                <Clock size={14} className="mr-1.5" /> Mark In Progress
              </Button>
            )}
            {kyc.status !== 'Rejected' && (
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() => handleStatusChange('Rejected')}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <XCircle size={14} className="mr-1.5" /> Reject
              </Button>
            )}
          </div>
        </div>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Verification Type</span>
            <select
              value={verificationType}
              onChange={(e) => setVerificationType(e.target.value)}
              className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
            >
              <option value="Standard">Standard KYC</option>
              <option value="Enhanced">Enhanced Due Diligence (EDD)</option>
              <option value="Simplified">Simplified KYC</option>
            </select>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Risk Rating</span>
            <select
              value={riskRating}
              onChange={(e) => setRiskRating(e.target.value)}
              className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
            >
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Risk</option>
            </select>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Verified Date</span>
            <p className="mt-1 font-bold text-slate-700">
              {kyc.verifiedAt ? new Date(kyc.verifiedAt).toLocaleDateString() : 'Not verified'}
            </p>
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Compliance Expiry</span>
            <p className="mt-1 font-bold text-slate-700">
              {kyc.expiryDate ? new Date(kyc.expiryDate).toLocaleDateString() : '1 Year Standard'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Checklist Panel */}
        <Card className="p-6 bg-white/80 shadow-glossy space-y-4 border border-slate-100">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-brand-550" />
              <h4 className="text-sm font-bold text-slate-800">Compliance Audit Checklist</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Passed: {checklistItems.filter((i: any) => i.passed).length} / {checklistItems.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {checklistItems.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleToggleChecklist(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  item.passed
                    ? 'bg-emerald-50/30 border-emerald-200 text-slate-800'
                    : 'bg-white border-slate-150 text-slate-600 hover:border-brand-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.passed}
                    onChange={() => {}} // handled by parent div click
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-200"
                  />
                  <span className={`text-xs font-semibold ${item.passed ? 'font-bold text-slate-850' : 'text-slate-650'}`}>
                    {item.name}
                  </span>
                </div>
                {item.passed && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    Verified
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Verification Documents Hub */}
        <Card className="p-6 bg-white/80 shadow-glossy space-y-4 border border-slate-100">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-800">Identity & Legal Proof Documents</h4>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDocModal(true)}>
              <Plus size={13} className="mr-1" /> Attach Document
            </Button>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3.5 bg-white border border-slate-150 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brand-550" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{doc.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{doc.type} &bull; Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {doc.status || 'Approved'}
                </span>
              </div>
            ))}

            {documents.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-6">No compliance documents attached yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Officer Notes & Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/80 shadow-glossy space-y-3 border border-slate-100">
          <h4 className="text-sm font-bold text-slate-800">Compliance Officer Notes</h4>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type verifier rationale, PEP findings, or risk notes..."
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              disabled={updating}
              onClick={() => handleStatusChange(kyc.status)}
            >
              Save Officer Notes
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 shadow-glossy space-y-3 border border-slate-100">
          <h4 className="text-sm font-bold text-slate-800">KYC Verification Audit Log</h4>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {auditLogs.map((log: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{log.action}</p>
                  <p className="text-[9px] text-slate-400">{log.user || 'System'}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Attach Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 w-full max-w-md shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Attach KYC Compliance Document</h4>
            <form onSubmit={handleAddDocument} className="space-y-3 text-xs text-left">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Director Passport Copy"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Document Category</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Business License">Business License Certificate</option>
                  <option value="Identity Proof">Director ID / Passport</option>
                  <option value="UBO Declaration">UBO Declaration Form</option>
                  <option value="Tax Certificate">Tax Residency Certificate</option>
                  <option value="Bank Statement">Bank Reference Letter</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowDocModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Attach Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyKYCTab;
