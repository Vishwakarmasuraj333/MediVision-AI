import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  Eye,
  BrainCircuit,
  FileEdit,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const StudyManagementPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { studies, setSelectedStudy } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredStudies = studies.filter(s => {
    const matchesSearch = s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.patientIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Imaging Studies Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise DICOM repository, modality management, and AI triage status tracking.
          </p>
        </div>

        <button
          onClick={() => setActivePage('upload-center')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Radiograph</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search studies by patient, accession, MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Status:</span>
          {['All', 'Uploaded', 'InReview', 'Approved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-navy-950 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5">Study Details</th>
                <th className="px-6 py-3.5">Accession & Modality</th>
                <th className="px-6 py-3.5">Referring Physician</th>
                <th className="px-6 py-3.5">AI Primary Finding</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              {filteredStudies.map(s => (
                <tr key={s.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-100 block">{s.patientName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{s.patientIdentifier} &bull; {s.patientAge}y, {s.patientGender}</span>
                  </td>

                  <td className="px-6 py-4 font-mono">
                    <span className="text-cyan-300 font-bold block">{s.accessionNumber}</span>
                    <span className="text-slate-400 text-[11px]">{s.modality} &bull; {s.bodyPart}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-slate-200 block">{s.referringPhysician || 'Dr. Gregory House, MD'}</span>
                    <span className="text-[11px] text-slate-500">{s.performingFacility}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-medium text-amber-300 block">
                      {s.latestJob?.result?.primaryFinding || 'No Finding'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Confidence: {((s.latestJob?.result?.overallConfidence || 0.94) * 100).toFixed(0)}%
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      s.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      s.status === 'InReview' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {s.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => { setSelectedStudy(s); setActivePage('dicom-viewer'); }}
                        className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-cyan-300 transition-colors"
                        title="DICOM Viewer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedStudy(s); setActivePage('ai-workspace'); }}
                        className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-cyan-300 transition-colors"
                        title="AI Inference"
                      >
                        <BrainCircuit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedStudy(s); setActivePage('report-generator'); }}
                        className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        title="Report Generator"
                      >
                        <FileEdit className="w-4 h-4" />
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

