import React, { useState } from 'react';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Shield,
  BookOpen,
  CheckCircle,
  Briefcase,
  AlertCircle,
  Users2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const PlaybookManager: React.FC = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('Renewal Playbook');
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>({
    name: 'Enterprise Sales Playbook',
    documentsRequired: ['Mutual NDA Sign-off', 'Technical Requirements Document (TRD)', 'Pricing sheet proposals'],
    milestones: ['Discovery demo sessions signoff', 'Legal validation compliance check', 'Commercial quotes sign-off'],
    checklist: [
      { task: 'Confirm client executive sponsor and timeline constraints', done: true },
      { task: 'Map out key technical decision maker contacts', done: true },
      { task: 'Submit technical proposal and custom SLA draft', done: false },
      { task: 'Secure legal signoff on final master service agreement', done: false }
    ]
  });

  const playbooks = [
    {
      id: '1',
      name: 'Enterprise Sales Playbook',
      desc: 'Structured closing process for high-value corporate deals with complex decision-making loops.',
      milestonesCount: 3,
      tasksCount: 4
    },
    {
      id: '2',
      name: 'SMB Closing Playbook',
      desc: 'Rapid sales cycle sequence optimized for quick turnaround and direct decision maker contact.',
      milestonesCount: 2,
      tasksCount: 3
    },
    {
      id: '3',
      name: 'Renewal Playbook',
      desc: 'Key milestones checklist to ensure customer retention and contract renewals 90 days before expiration.',
      milestonesCount: 2,
      tasksCount: 3
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Deals', link: '/deals' }, { label: 'Sales Playbooks' }]} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-1">CRM Sales Playbooks</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Standardize sales processes with checklist guidelines and key document templates</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1.5" /> Log Playbook
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook Templates list */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Templates List</span>
          {playbooks.map((p) => (
            <Card
              key={p.id}
              onClick={() => {
                setSelectedPlaybook({
                  name: p.name,
                  documentsRequired: [' NDA Sign-off', 'Pricing proposal list', 'Customer SLA Draft'],
                  milestones: ['Technical scope confirmed', 'Commercial terms agreed'],
                  checklist: [
                    { task: 'Confirm executive sponsor and budget limits', done: true },
                    { task: 'Send proposal sheet for draft quote', done: false }
                  ]
                });
              }}
              className={`p-4 cursor-pointer border transition-all hover:shadow-glossy-sm ${selectedPlaybook.name === p.name ? 'border-brand-550 bg-brand-50/10' : 'border-slate-150 bg-white'}`}
            >
              <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
              <p className="text-[10px] text-slate-450 mt-1 line-clamp-2 leading-relaxed font-semibold">{p.desc}</p>
              <div className="flex gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-2 mt-2 border-t border-slate-50">
                <span>{p.milestonesCount} Milestones</span>
                <span>{p.tasksCount} Tasks</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Detailed Playbook steps */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 space-y-6 bg-white/70 shadow-glossy">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-brand-550" />
                <h3 className="text-sm font-bold text-slate-800">{selectedPlaybook.name}</h3>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Execution Checklist</span>
              <div className="space-y-2">
                {selectedPlaybook.checklist.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(e) => {
                        const updated = [...selectedPlaybook.checklist];
                        updated[idx].done = e.target.checked;
                        setSelectedPlaybook({ ...selectedPlaybook, checklist: updated });
                        toast.success('Task Checked', 'Playbook checkpoint progress updated.');
                      }}
                      className="w-4 h-4 rounded text-brand-550 border-slate-350 focus:ring-brand-200 mt-0.5"
                    />
                    <span className={`text-xs font-semibold ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents & Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div className="space-y-2.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Required Documents</span>
                <div className="space-y-1.5">
                  {selectedPlaybook.documentsRequired.map((doc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-650">
                      <FileText size={12} className="text-slate-400" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Milestone Triggers</span>
                <div className="space-y-1.5">
                  {selectedPlaybook.milestones.map((ms: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-650">
                      <Sparkles size={12} className="text-brand-550" />
                      <span>{ms}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Playbook creation Modal placeholder */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 w-full max-w-md shadow-glossy space-y-4"
            >
              <h4 className="text-sm font-black text-slate-800">Add Sales Playbook</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Playbook Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide standard closing process rules..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" onClick={() => setShowModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      toast.success('Playbook Created', 'Playbook has been logged successfully.');
                    }}
                    variant="primary"
                    size="sm"
                  >
                    Log Playbook
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
