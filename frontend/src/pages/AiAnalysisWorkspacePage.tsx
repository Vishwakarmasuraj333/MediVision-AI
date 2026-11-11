import React, { useState } from 'react';
import {
  BrainCircuit,
  Cpu,
  Flame,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Activity,
  Sliders
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const AiAnalysisWorkspacePage: React.FC<PageProps> = ({ setActivePage }) => {
  const { selectedStudy, studies, setSelectedStudy, models, runAnalysisOnStudy } = useData();
  const currentStudy = selectedStudy || studies[0];

  const [selectedArch, setSelectedArch] = useState<string>('DenseNet121');
  const [enableGradCam, setEnableGradCam] = useState<boolean>(true);
  const [enableSegmentation, setEnableSegmentation] = useState<boolean>(true);
  const [enableCalibration, setEnableCalibration] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inferenceProgress, setInferenceProgress] = useState<number>(0);

  const handleTriggerInference = async () => {
    setIsProcessing(true);
    setInferenceProgress(15);
    
    // Simulate real pipeline steps
    const timer1 = setTimeout(() => setInferenceProgress(45), 300);
    const timer2 = setTimeout(() => setInferenceProgress(80), 700);

    await runAnalysisOnStudy(currentStudy.id, selectedArch);
    
    setInferenceProgress(100);
    setTimeout(() => {
      setIsProcessing(false);
      setInferenceProgress(0);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const latestJob = currentStudy.latestJob;
  const result = latestJob?.result;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Analysis Workspace</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              PyTorch Modular Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure multi-label deep learning architectures, confidence calibration, and explainability pipelines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Target Study:</label>
          <select
            value={currentStudy.id}
            onChange={(e) => {
              const s = studies.find(st => st.id === e.target.value);
              if (s) setSelectedStudy(s);
            }}
            className="px-3 py-1.5 bg-navy-900 border border-navy-700 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none"
          >
            {studies.map(s => (
              <option key={s.id} value={s.id}>
                {s.accessionNumber} - {s.patientName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Architectures Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Deep Learning Model Architecture
          </h2>
          <span className="text-xs text-cyan-400 font-mono">Public Research Weights Preloaded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {models.map(m => {
            const isSelected = selectedArch.toLowerCase() === m.architecture.toLowerCase() ||
              (selectedArch === 'DenseNet121' && m.architecture === 'DenseNet121') ||
              (selectedArch === 'EfficientNet-B4' && m.architecture === 'EfficientNet-B4') ||
              (selectedArch === 'ResNet50' && m.architecture === 'ResNet50') ||
              (selectedArch === 'ViT-B/16' && m.architecture === 'ViT-B/16');

            return (
              <div
                key={m.id}
                onClick={() => setSelectedArch(m.architecture)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-navy-900 border-cyan-500/80 shadow-glow-cyan'
                    : 'bg-navy-900/60 border-navy-800 hover:border-navy-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-sm text-white">{m.architecture}</span>
                  </div>
                  {m.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-medium">
                      Primary
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">{m.displayName}</p>

                <div className="mt-3 pt-3 border-t border-navy-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">AUROC</span>
                    <span className="font-bold text-emerald-400">{m.aurocScore.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Params</span>
                    <span className="text-slate-300">{(m.parametersCount / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Execution & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Image & Pipeline Options */}
        <div className="lg:col-span-1 bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Inference Pipeline Parameters</span>
          </h2>

          {/* Radiograph Thumbnail */}
          <div className="relative rounded-xl overflow-hidden border border-navy-800 bg-navy-950 aspect-square flex items-center justify-center group">
            <img
              src={currentStudy.images[0]?.storageUrl || '/samples/sample_pleural_effusion.png'}
              alt="Radiograph preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 right-3 text-xs">
              <p className="font-bold text-white">{currentStudy.patientName}</p>
              <p className="text-[11px] text-cyan-300 font-mono">{currentStudy.accessionNumber} &bull; {currentStudy.modality}</p>
            </div>
          </div>

          {/* Pipeline toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center space-x-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Grad-CAM Spatial Heatmap</span>
              </span>
              <input
                type="checkbox"
                checked={enableGradCam}
                onChange={(e) => setEnableGradCam(e.target.checked)}
                className="rounded accent-cyan-400 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center space-x-2">
                <Scan className="w-3.5 h-3.5 text-cyan-400" />
                <span>U-Net Lung Segmentation</span>
              </span>
              <input
                type="checkbox"
                checked={enableSegmentation}
                onChange={(e) => setEnableSegmentation(e.target.checked)}
                className="rounded accent-cyan-400 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center space-x-2">
                <BrainCircuit className="w-3.5 h-3.5 text-electric-400" />
                <span>Platt Temperature Scaling (T=1.15)</span>
              </span>
              <input
                type="checkbox"
                checked={enableCalibration}
                onChange={(e) => setEnableCalibration(e.target.checked)}
                className="rounded accent-cyan-400 w-4 h-4"
              />
            </label>
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleTriggerInference}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Executing PyTorch Inferences ({inferenceProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-navy-950 text-navy-950" />
                <span>Run {selectedArch} Multi-Label Inference</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Results Preview & Quick Navigation */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div>
                <h3 className="text-base font-bold text-white">Latest Inference Evaluation</h3>
                <p className="text-xs text-slate-400">
                  {latestJob ? `Processed via ${latestJob.modelName} in ${latestJob.executionTimeMs}ms` : 'No analysis run for this study yet.'}
                </p>
              </div>

              {result && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  result.riskCategory === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  result.riskCategory === 'ModerateSuspicion' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {result.riskCategory}
                </span>
              )}
            </div>

            {result ? (
              <div className="mt-5 space-y-5">
                {/* Primary finding callout */}
                <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Primary Suspicion:</span>
                      <span className="font-bold text-sm text-amber-300">{result.primaryFinding}</span>
                      <span className="text-xs font-mono text-cyan-300 font-semibold">
                        (p={(result.overallConfidence).toFixed(2)})
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.findingsSummary}</p>
                  </div>
                </div>

                {/* Multi-label probability list */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Multi-Label Probability Distribution (NIH ChestX-ray14)
                  </h4>
                  <div className="space-y-2">
                    {result.classifications.slice(0, 5).map(c => (
                      <div key={c.condition} className="p-2.5 rounded-lg bg-navy-950/60 border border-navy-800/80 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{c.condition}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-navy-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.calibratedProbability > 0.6 ? 'bg-amber-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${c.calibratedProbability * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-cyan-300 w-12 text-right">
                            {(c.calibratedProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                <p className="font-medium text-sm text-slate-400">Ready to execute inference</p>
                <p className="text-xs text-slate-500 mt-1">Select architecture on the left and click "Run Inference".</p>
              </div>
            )}
          </div>

          {/* Bottom Direct Deep-Dive Action Links */}
          <div className="pt-5 border-t border-navy-800 flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => setActivePage('gradcam-viewer')}
              className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center space-x-2 transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Grad-CAM</span>
            </button>
            <button
              onClick={() => setActivePage('lung-segmentation')}
              className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center space-x-2 transition-colors"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect U-Net Contours</span>
            </button>
            <button
              onClick={() => setActivePage('report-generator')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center space-x-2 transition-colors"
            >
              <span>Draft Clinical Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

