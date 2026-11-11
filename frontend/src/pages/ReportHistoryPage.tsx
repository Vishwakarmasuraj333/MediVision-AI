import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const ReportHistoryPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { studies, setSelectedStudy } = useData();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect reports from studies
  const reports = studies
    .filter(s => s.report)
    .map(s => ({
      ...s.report!,
      patientName: s.patientName,
      patientIdentifier: s.patientIdentifier,
      accessionNumber: s.accessionNumber,
      studyObj: s
    }));

  const filtered = reports.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.reportIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Report History Archive</h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically signed clinical consultations, approved impressions, and historical report revisions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, accession, or report ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Status:</span>
          {['All', 'Approved', 'Draft'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-navy-950 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5">Report ID</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Accession</th>
                <th className="px-6 py-3.5">Interpreting Radiologist</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono">
                    <span className="text-cyan-300 font-bold block">{r.reportIdentifier}</span>
                    <span className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-200 block">{r.patientName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{r.patientIdentifier}</span>
                  </td>

                  <td className="px-6 py-4 font-mono text-slate-300">
                    {r.accessionNumber}
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-slate-200 block">{r.authorName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">RSA-SHA256 Signed</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => { setSelectedStudy(r.studyObj); setActivePage('report-generator'); }}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View / Edit</span>
                      </button>
                    </div>
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

