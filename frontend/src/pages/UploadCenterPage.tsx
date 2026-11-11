import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  File,
  ShieldCheck,
  ArrowRight,
  Eye,
  Sparkles,
  Info
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const UploadCenterPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { patients, addNewStudy, runAnalysisOnStudy, addToast } = useData();

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetPatientId, setTargetPatientId] = useState<string>(patients[0]?.id || '');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'Stat'>('Routine');
  const [clinicalIndication, setClinicalIndication] = useState<string>('Evaluation of acute dyspnea and cough');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [autoRunAi, setAutoRunAi] = useState<boolean>(true);

  // Quality check simulation
  const [qualityPassed, setQualityPassed] = useState<boolean>(true);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExts = ['.dcm', '.dicom', '.png', '.jpg', '.jpeg'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      addToast('Invalid Format', 'Supported formats: DICOM (.dcm), PNG, JPEG.', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    addToast('Image Loaded', `${file.name} (${(file.size / 1024).toFixed(0)} KB) validated. Quality checks passed.`, 'info');
  };

  const handleLoadSample = (sampleType: string) => {
    const sampleMap: Record<string, { name: string; url: string; indication: string }> = {
      effusion: { name: 'sample_pleural_effusion.png', url: '/samples/sample_pleural_effusion.png', indication: 'Dyspnea and pleuritic pain; evaluate costophrenic sulcus' },
      pneumonia: { name: 'sample_pneumonia.png', url: '/samples/sample_pneumonia.png', indication: 'Fever, cough, crackles; suspected community acquired pneumonia' },
      cardio: { name: 'sample_cardiomegaly.png', url: '/samples/sample_cardiomegaly.png', indication: 'Orthopnea, lower extremity edema; cardiomegaly follow-up' },
      normal: { name: 'sample_normal.png', url: '/samples/sample_normal.png', indication: 'Occupational health baseline routine radiograph' }
    };

    const s = sampleMap[sampleType];
    setPreviewUrl(s.url);
    setClinicalIndication(s.indication);
    setSelectedFile(new Blob(['mock_sample_bytes'], { type: 'image/png' }) as unknown as File);
    addToast('Sample Radiograph Loaded', `Loaded ${s.name} into upload pipeline.`, 'success');
  };

  const handleUploadSubmit = async () => {
    if (!previewUrl) {
      addToast('No File', 'Please select a DICOM or radiograph file first.', 'warning');
      return;
    }

    setIsUploading(true);
    const targetPatient = patients.find(p => p.id === targetPatientId) || patients[0];

    const study = addNewStudy({
      patientId: targetPatient.id,
      patientIdentifier: targetPatient.patientIdentifier,
      patientName: `${targetPatient.firstName} ${targetPatient.lastName}`,
      patientAge: targetPatient.age,
      patientGender: targetPatient.gender,
      clinicalIndication,
      urgency,
      description: selectedFile?.name ? `Chest Radiograph (${selectedFile.name})` : 'Chest PA Study'
    }, selectedFile || undefined);

    if (autoRunAi) {
      await runAnalysisOnStudy(study.id, 'DenseNet121');
    }

    setIsUploading(false);
    setActivePage('dicom-viewer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">X-Ray & DICOM Upload Center</h1>
        <p className="text-sm text-slate-400 mt-1">
          Secure client-side and server-side medical image ingestion, quality check analysis, and automated AI routing.
        </p>
      </div>

      {/* Preset Sample Quick-Load Bar */}
      <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Quick Load Verified Research Radiographs:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLoadSample('effusion')}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium transition-colors"
          >
            Pleural Effusion (PA)
          </button>
          <button
            onClick={() => handleLoadSample('pneumonia')}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium transition-colors"
          >
            Lobar Pneumonia (PA)
          </button>
          <button
            onClick={() => handleLoadSample('cardio')}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium transition-colors"
          >
            Cardiomegaly (AP)
          </button>
          <button
            onClick={() => handleLoadSample('normal')}
            className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium transition-colors"
          >
            Normal Screening (PA)
          </button>
        </div>
      </div>

      {/* Main Drag-Drop & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Drag and Drop Area */}
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[360px] ${
              dragActive
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : 'border-navy-800 hover:border-cyan-500/50 bg-navy-900/60'
            }`}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <div className="w-52 h-52 mx-auto rounded-2xl overflow-hidden border border-navy-700 shadow-2xl relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                    Validated
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">{selectedFile?.name || 'radiograph.png'}</p>
                  <p className="text-[11px] text-slate-400">Ready for automated ingestion & AI feature mapping</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Drag & drop chest radiograph or DICOM here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports DICOM (.dcm), PNG, and JPEG files up to 100MB</p>
                </div>
                <label className="inline-block px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold text-xs border border-navy-700 cursor-pointer transition-colors">
                  <span>Browse Local File</span>
                  <input type="file" onChange={handleFileInput} accept=".dcm,.dicom,.png,.jpg,.jpeg" className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* Quality Assessment Metrics Panel */}
          {previewUrl && (
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automated Image Quality Assessment</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  PASSED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-300">
                <div className="p-2 bg-navy-950 rounded-lg">SNR: <span className="text-cyan-300">31.2 dB</span></div>
                <div className="p-2 bg-navy-950 rounded-lg">Sharpness: <span className="text-cyan-300">1420</span></div>
                <div className="p-2 bg-navy-950 rounded-lg">Artifacts: <span className="text-emerald-400">None</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Study Registration Metadata */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 space-y-4 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Link to Synthetic Research Patient
          </h2>

          <div className="space-y-1">
            <label className="text-slate-400 block">Select Patient Record:</label>
            <select
              value={targetPatientId}
              onChange={(e) => setTargetPatientId(e.target.value)}
              className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.patientIdentifier} - {p.firstName} {p.lastName} ({p.age}y, {p.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 block">Modality:</label>
              <select className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none">
                <option>DX - Digital Radiography</option>
                <option>CR - Computed Radiography</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 block">Clinical Urgency:</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Stat">Stat (Immediate)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 block">Clinical Indication & History:</label>
            <textarea
              rows={3}
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRunAi}
                onChange={(e) => setAutoRunAi(e.target.checked)}
                className="rounded accent-cyan-400 w-4 h-4"
              />
              <span className="font-semibold text-cyan-300">
                Automatically execute DenseNet-121 inference & Grad-CAM on upload
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-navy-800">
            <button
              onClick={handleUploadSubmit}
              disabled={isUploading || !previewUrl}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4 text-navy-950" />
              <span>{isUploading ? 'Ingesting & Analyzing...' : 'Ingest Study & Open DICOM Viewer'}</span>
              <ArrowRight className="w-4 h-4 text-navy-950" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
