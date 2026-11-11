import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Layers,
  Flame,
  Check,
  Clock
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const ReportGeneratorPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { selectedStudy, studies, setSelectedStudy, submitRadiologistReview, addToast } = useData();
  const { user } = useAuth();
  const currentStudy = selectedStudy || studies[0];
  const report = currentStudy.report;

  // Editable report fields
  const [findingsText, setFindingsText] = useState(
    report?.findings ||
    'LUNGS: Lung volumes are moderately hyperinflated. Blunting of the right costophrenic angle is present, with meniscus sign indicative of moderate right pleural fluid layering. Subsegmental linear opacities in the right base are consistent with compressive atelectasis.\n\nHEART & MEDIASTINUM: Cardiac silhouette is within normal size limits (cardiothoracic ratio 0.48). Mediastinal and hilar contours are unremarkable.\n\nBONES & SOFT TISSUES: Mild degenerative changes of the thoracic spine. No acute rib fractures or osseous lesions identified.'
  );

  const [impressionText, setImpressionText] = useState(
    report?.impression ||
    '1. Moderate right pleural effusion with associated compressive right basilar atelectasis.\n2. Chronic lung disease changes consistent with patient reported COPD history.\n3. Correlate clinically. Bedside thoracic ultrasound recommended to evaluate for pleural fluid septations.'
  );

  const [recommendationsText, setRecommendationsText] = useState(
    report?.recommendations ||
    'Recommend correlation with clinical presentation and consideration of bedside thoracic ultrasound to evaluate for pleural fluid septations.'
  );

  const [reviewerNotes, setReviewerNotes] = useState('AI predictions reviewed and confirmed on frontal view.');
  const [isCritical, setIsCritical] = useState<boolean>(report?.criticalFindingAlert || false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const isApproved = report?.status === 'Approved';

  const handleApprove = () => {
    if (!report) return;
    submitRadiologistReview(
      report.id,
      'Approved',
      reviewerNotes,
      findingsText,
      impressionText
    );
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    addToast('Generating PDF Report', 'Formatting official radiology report with digital cryptograph...', 'info');
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      addToast('Report Ready', 'Clinical document dispatched to printer / PDF export.', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Medical Report Generator</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isApproved
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isApproved ? 'Approved & Signed' : 'Draft In Review'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Structured thoracic consultation report with automated AI findings synthesis and digital signature.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print / Export PDF</span>
          </button>

          {!isApproved && (
            <button
              onClick={handleApprove}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-navy-950 text-xs font-bold shadow-glow-cyan flex items-center space-x-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-navy-950" />
              <span>Sign & Finalize Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Formatted Report Page */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Institution Header */}
          <div className="flex items-start justify-between pb-6 border-b border-navy-800">
            <div>
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-base">MediVision Academic Medical Center</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Division of Thoracic & Cardiothoracic Radiology</p>
              <p className="text-[11px] text-slate-500">100 Academic Way, Health Sciences Campus &bull; Tel: (555) 019-2830</p>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-cyan-400 font-bold block">{report?.reportIdentifier || 'MV-REP-2026-0001'}</span>
              <span className="text-slate-400 text-[11px]">Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Patient Demographics Banner */}
          <div className="bg-navy-950/80 rounded-xl p-4 border border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Patient Name</span>
              <span className="font-bold text-slate-200">{currentStudy.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Patient ID / MRN</span>
              <span className="font-mono text-cyan-300 font-semibold">{currentStudy.patientIdentifier}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Age / Sex</span>
              <span className="text-slate-200">{currentStudy.patientAge} Years / {currentStudy.patientGender}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Accession #</span>
              <span className="font-mono text-slate-200">{currentStudy.accessionNumber}</span>
            </div>
          </div>

          {/* Examination Technique */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider block">Technique & Clinical Indication</span>
            <p className="text-slate-300">
              {currentStudy.description} ({currentStudy.modality}, PA View). Indication: {currentStudy.clinicalIndication}
            </p>
          </div>

          {/* AI Decision Support Summary Box */}
          <div className="p-4 rounded-xl bg-navy-950 border border-cyan-500/20 text-xs space-y-1">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Multi-Label Decision Support Synthesis (DenseNet-121)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Attentional gradient maps identified focal suspicion for <strong>{currentStudy.latestJob?.result?.primaryFinding || 'Pleural Effusion'}</strong> (calibrated p={(currentStudy.latestJob?.result?.overallConfidence || 0.88).toFixed(2)}). Lung segmentation calculated cardiothoracic ratio: {(currentStudy.latestJob?.result?.cardiothoracicRatio || 0.48).toFixed(2)}.
            </p>
            <p className="text-[10px] text-slate-500 italic">
              Notice: AI outputs provide unverified investigational reference and are evaluated under radiologist supervision.
            </p>
          </div>

          {/* Findings Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Radiological Findings
            </label>
            <textarea
              rows={6}
              disabled={isApproved}
              value={findingsText}
              onChange={(e) => setFindingsText(e.target.value)}
              className="w-full p-3.5 bg-navy-950 border border-navy-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-cyan-500/60 disabled:opacity-80"
            />
          </div>

          {/* Impression Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Impression
            </label>
            <textarea
              rows={4}
              disabled={isApproved}
              value={impressionText}
              onChange={(e) => setImpressionText(e.target.value)}
              className="w-full p-3.5 bg-navy-950 border border-navy-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-cyan-500/60 disabled:opacity-80 font-medium"
            />
          </div>

          {/* Digital Signature Block */}
          <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Interpreting Radiologist Electronic Signature</span>
              </div>
              <p className="font-bold text-slate-200">Dr. Elena Vance, MD, FACR</p>
              <p className="text-[11px] text-slate-400">Board-Certified Thoracic Radiologist &bull; License # RAD-NY-849204</p>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-400">
              <span className="block text-cyan-400">RSA-SHA256 Digital Verification</span>
              <span>Hash: 0x94F2B892...E4A108</span>
            </div>
          </div>
        </div>

        {/* Right Col: Radiologist Review Drawer */}
        <div className="lg:col-span-1 bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-5 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Radiologist Review & Approval</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Attending Notes & Feedback on AI:</label>
              <textarea
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter notes on AI agreement or discrepancy..."
                className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Recommendations & Follow-up:</label>
              <textarea
                rows={2}
                value={recommendationsText}
                onChange={(e) => setRecommendationsText(e.target.value)}
                className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <label className="flex items-center space-x-2 text-rose-300 font-medium cursor-pointer p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <input
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                className="rounded accent-rose-500 w-4 h-4"
              />
              <span>Critical Finding Alert (Requires Rapid Clinician Callback)</span>
            </label>
          </div>

          <div className="pt-3 border-t border-navy-800 space-y-2">
            <button
              onClick={() => setActivePage('gradcam-viewer')}
              className="w-full py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Verify Grad-CAM Attention</span>
            </button>
            <button
              onClick={() => setActivePage('dicom-viewer')}
              className="w-full py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center justify-center space-x-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Cross-check Native DICOM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

