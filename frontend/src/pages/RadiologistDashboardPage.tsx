import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  BrainCircuit,
  FileEdit,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  Activity
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { StudyUrgency, StudyStatus } from '../types';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const RadiologistDashboardPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { studies, setSelectedStudy, runAnalysisOnStudy } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');

  const pendingReviews = studies.filter(s => s.status === 'InReview');
  const urgentCount = studies.filter(s => s.urgency === 'Urgent' || s.urgency === 'Stat').length;
  const approvedCount = studies.filter(s => s.status === 'Approved').length;

  const filteredStudies = studies.filter(s => {
    const matchesSearch = s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.patientIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || s.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const handleOpenDicom = (study: typeof studies[0]) => {
    setSelectedStudy(study);
    setActivePage('dicom-viewer');
  };

  const handleOpenAi = (study: typeof studies[0]) => {
    setSelectedStudy(study);
    setActivePage('ai-workspace');
  };

  const handleOpenReport = (study: typeof studies[0]) => {
    setSelectedStudy(study);
    setActivePage('report-generator');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Radiologist Reading Worklist</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Dr. Elena Vance, MD
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Prioritized chest radiography reading queue, model decision support, and digital sign-off.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActivePage('upload-center')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-semibold text-xs shadow-glow-cyan transition-all flex items-center space-x-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Upload New Study</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{pendingReviews.length}</div>
          <p className="text-xs text-amber-400/90 mt-2 flex items-center space-x-1">
            <span>Requires attending radiologist validation</span>
          </p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Urgent / Stat</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{urgentCount}</div>
          <p className="text-xs text-rose-400/90 mt-2">Prioritized in clinical queue</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">AI Model Latency</span>
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">740<span className="text-base text-slate-400 font-sans">ms</span></div>
          <p className="text-xs text-cyan-400/90 mt-2">DenseNet-121 + Grad-CAM inference</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Approved Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{approvedCount}</div>
          <p className="text-xs text-emerald-400/90 mt-2">Digitally signed & archived</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name, MRN, accession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950/80 border border-navy-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Urgency:</span>
          {['All', 'Stat', 'Urgent', 'Routine'].map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                urgencyFilter === u
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-navy-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Studies Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Worklist Studies ({filteredStudies.length})</h2>
          </div>
          <span className="text-xs text-slate-400">Sorted by Priority & Acquisition Date</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Accession & Modality</th>
                <th className="px-6 py-3.5">Urgency</th>
                <th className="px-6 py-3.5">AI Primary Finding</th>
                <th className="px-6 py-3.5">Calibrated Prob.</th>
                <th className="px-6 py-3.5">Workflow Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              {filteredStudies.map((study) => {
                const primaryFinding = study.latestJob?.result?.primaryFinding || 'No Finding';
                const confidence = study.latestJob?.result?.overallConfidence || 0.94;
                const isAbnormal = primaryFinding !== 'No Finding';

                return (
                  <tr key={study.id} className="hover:bg-navy-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {study.patientName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {study.patientIdentifier} &bull; {study.patientAge}y, {study.patientGender}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-mono text-cyan-300 font-semibold">{study.accessionNumber}</div>
                      <div className="text-[11px] text-slate-400">{study.modality} &bull; {study.bodyPart}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                        study.urgency === 'Stat' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
                        study.urgency === 'Urgent' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {study.urgency}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        {isAbnormal ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className={`font-medium ${isAbnormal ? 'text-amber-300' : 'text-slate-300'}`}>
                          {primaryFinding}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{study.description}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-700">
                          <div
                            className={`h-full rounded-full ${
                              confidence > 0.8 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-electric-500'
                            }`}
                            style={{ width: `${confidence * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {(confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                        study.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        study.status === 'InReview' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        study.status === 'Analyzing' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {study.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenDicom(study)}
                          className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-cyan-300 hover:bg-navy-700 transition-colors"
                          title="Open DICOM Viewer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAi(study)}
                          className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-cyan-300 hover:bg-navy-700 transition-colors"
                          title="Inspect AI & Grad-CAM"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenReport(study)}
                          className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                          title="Draft or Edit Report"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

