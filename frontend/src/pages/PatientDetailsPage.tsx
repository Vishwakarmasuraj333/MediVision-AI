import React from 'react';
import {
  UserCheck,
  Calendar,
  FolderKanban,
  Eye,
  BrainCircuit,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const PatientDetailsPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { selectedStudy, studies, patients, setSelectedStudy } = useData();
  const currentStudy = selectedStudy || studies[0];
  const patient = patients.find(p => p.id === currentStudy.patientId) || patients[0];
  const patientStudies = studies.filter(s => s.patientId === patient.id || s.patientIdentifier === patient.patientIdentifier);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back button & Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setActivePage('patient-management')}
          className="p-2 rounded-xl bg-navy-900 border border-navy-800 text-slate-300 hover:text-cyan-400 hover:bg-navy-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {patient.patientIdentifier} &bull; Longitudinal Medical Record & Imaging History
          </p>
        </div>
      </div>

      {/* Demographics Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Date of Birth / Age</span>
            <span className="font-bold text-slate-200">{patient.dateOfBirth} ({patient.age} years)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Gender & Blood Group</span>
            <span className="font-bold text-slate-200">{patient.gender} &bull; {patient.bloodGroup || 'O+'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Documented Allergies</span>
            <span className="font-medium text-amber-300">{patient.allergies || 'None documented'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Emergency Contact</span>
            <span className="text-slate-300">{patient.emergencyContact || 'Family contact on file'}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-navy-800 text-xs">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Medical Background</span>
          <p className="text-slate-300 leading-relaxed">{patient.medicalHistorySummary || 'Chronic lung disease surveillance cohort.'}</p>
        </div>
      </div>

      {/* Studies Timeline */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Imaging Studies Timeline ({patientStudies.length})
            </h2>
          </div>
          <button
            onClick={() => setActivePage('upload-center')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            + Add Study for Patient
          </button>
        </div>

        <div className="space-y-3">
          {patientStudies.map(s => (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-navy-800 shrink-0 bg-navy-900">
                  <img src={s.images[0]?.storageUrl || '/samples/sample_pleural_effusion.png'} alt="Study" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-300 font-bold">{s.accessionNumber}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-300 font-medium">{s.description}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Acquired: {new Date(s.studyDate).toLocaleDateString()} &bull; {s.modality} ({s.bodyPart})
                  </p>
                  <p className="text-[11px] text-amber-300 mt-1 font-medium">
                    AI Finding: {s.latestJob?.result?.primaryFinding || 'No Finding'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => { setSelectedStudy(s); setActivePage('dicom-viewer'); }}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium transition-colors flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>DICOM</span>
                </button>
                <button
                  onClick={() => { setSelectedStudy(s); setActivePage('ai-workspace'); }}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium transition-colors flex items-center space-x-1.5"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Workspace</span>
                </button>
                <button
                  onClick={() => { setSelectedStudy(s); setActivePage('report-generator'); }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

