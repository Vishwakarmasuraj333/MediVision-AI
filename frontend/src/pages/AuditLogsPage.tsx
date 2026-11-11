import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../services/api';
import { useData } from '../context/DataContext';

export const AuditLogsPage: React.FC = () => {
  const { addToast } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filtered = MOCK_AUDIT_LOGS.filter(a => {
    const matchesSearch = a.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.details && a.details.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = actionFilter === 'All' || a.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const handleExport = () => {
    addToast('Audit Export Ready', 'Full audit trail exported as CSV for compliance review.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Compliance Audit Trail</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Immutable Ledger
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Complete record of authentication, DICOM uploads, deep learning inferences, and radiologist approvals.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <FileDown className="w-4 h-4 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, action, or study ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Action:</span>
          {['All', 'LOGIN', 'RUN_AI_INFERENCE', 'APPROVE_REPORT'].map(act => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                actionFilter === act
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-navy-950 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-navy-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5">Timestamp (UTC)</th>
                <th className="px-6 py-3.5">User Identity</th>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Resource & Target</th>
                <th className="px-6 py-3.5">Details</th>
                <th className="px-6 py-3.5">IP Address</th>
                <th className="px-6 py-3.5 text-right font-sans">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300 text-[11px]">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(a.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>

                  <td className="px-6 py-4 font-sans font-medium text-slate-200">
                    {a.userEmail}
                  </td>

                  <td className="px-6 py-4 font-bold text-cyan-300">
                    {a.action}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {a.resource} {a.resourceId && <span className="text-amber-300">({a.resourceId})</span>}
                  </td>

                  <td className="px-6 py-4 font-sans text-slate-300 max-w-xs truncate">
                    {a.details}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {a.ipAddress || '10.0.1.45'}
                  </td>

                  <td className="px-6 py-4 text-right font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {a.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

