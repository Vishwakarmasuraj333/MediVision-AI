import React, { useState } from 'react';
import {
  Flame,
  Layers,
  Sliders,
  Columns,
  Maximize2,
  Info,
  ShieldAlert,
  ArrowRight,
  Eye,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const GradCamViewerPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { selectedStudy, studies, setSelectedStudy } = useData();
  const currentStudy = selectedStudy || studies[0];

  const [targetCondition, setTargetCondition] = useState<string>('Pleural Effusion');
  const [colormap, setColormap] = useState<string>('Jet');
  const [opacity, setOpacity] = useState<number>(45);
  const [splitView, setSplitView] = useState<boolean>(true);

  const imgSrc = currentStudy.images[0]?.storageUrl || '/samples/sample_pleural_effusion.png';

  const conditions = [
    'Pleural Effusion',
    'Cardiomegaly',
    'Pneumonia',
    'Atelectasis',
    'Consolidation',
    'No Finding'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Explainable AI (Grad-CAM)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Feature Activation Visualizer
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Spatial gradient backpropagation revealing convolutional neural network focal attention maps.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Study:</label>
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

      {/* Mandatory Clinical Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-navy-900/90 border border-amber-500/30 flex items-start space-x-3.5 shadow-panel">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-300 block mb-0.5">
            Interpreting Attention Maps &bull; Research Decision Support
          </span>
          <p className="text-slate-300 leading-relaxed">
            Highlighted spatial heatmap zones reflect the convolutional filters with the greatest positive gradient contribution to the predicted class score. <strong>Model attention does not delineate definitive pathology boundaries</strong> and must be correlated with anatomic tissue structures by a licensed radiologist.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Target Condition Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Target Pathology:</span>
          <div className="flex flex-wrap gap-1">
            {conditions.map(c => (
              <button
                key={c}
                onClick={() => setTargetCondition(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  targetCondition === c
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-navy-950 text-slate-400 hover:text-slate-200 border border-navy-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode & Colormap */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Palette:</span>
            {['Jet', 'Turbo', 'Viridis'].map(cm => (
              <button
                key={cm}
                onClick={() => setColormap(cm)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  colormap === cm
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-navy-950 text-slate-400 border border-navy-800'
                }`}
              >
                {cm}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Columns className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => setSplitView(!splitView)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                splitView ? 'bg-navy-800 text-cyan-300 border-navy-700' : 'bg-navy-950 text-slate-400 border-navy-800'
              }`}
            >
              {splitView ? 'Side-by-Side' : 'Single Overlay'}
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Display Area */}
      <div className={`grid gap-6 ${splitView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Left / Single: Original Radiograph */}
        {splitView && (
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-navy-800 text-xs text-slate-400">
              <span className="font-bold text-white uppercase tracking-wider">Unmodified Radiograph</span>
              <span className="font-mono">{currentStudy.accessionNumber} &bull; PA View</span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 w-full">
              <div className="relative rounded-xl overflow-hidden border border-navy-800 shadow-2xl max-w-[460px]">
                <img src={imgSrc} alt="Original Radiograph" className="w-full h-auto object-cover" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-navy-950/80 rounded font-mono text-[10px] text-slate-300 border border-navy-800">
                  Native Pixel Array
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right / Single: Grad-CAM Overlay */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-navy-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white uppercase tracking-wider">
                Grad-CAM: {targetCondition}
              </span>
            </div>

            {/* Live Opacity Slider */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Alpha:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-20 accent-amber-400"
              />
              <span className="font-mono text-amber-300 w-8">{opacity}%</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 w-full">
            <div className="relative rounded-xl overflow-hidden border border-navy-800 shadow-2xl max-w-[460px]">
              {/* Base Radiograph */}
              <img src={imgSrc} alt="Radiograph" className="w-full h-auto object-cover" />

              {/* Pseudo-colored Attention Overlay */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-150"
                style={{
                  opacity: opacity / 100,
                  background: targetCondition === 'Pleural Effusion'
                    ? 'radial-gradient(circle at 35% 75%, rgba(239, 68, 68, 0.85) 0%, rgba(245, 158, 11, 0.7) 30%, rgba(6, 182, 212, 0.4) 60%, transparent 80%)'
                    : targetCondition === 'Cardiomegaly'
                    ? 'radial-gradient(circle at 55% 65%, rgba(239, 68, 68, 0.85) 0%, rgba(245, 158, 11, 0.7) 35%, rgba(6, 182, 212, 0.3) 65%, transparent 85%)'
                    : targetCondition === 'Pneumonia'
                    ? 'radial-gradient(circle at 30% 55%, rgba(239, 68, 68, 0.85) 0%, rgba(245, 158, 11, 0.7) 30%, transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.4) 0%, transparent 70%)'
                }}
              />

              <div className="absolute top-2 left-2 px-2 py-1 bg-navy-950/80 rounded font-mono text-[10px] text-amber-300 border border-navy-800 flex items-center space-x-1.5">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{colormap} Gradient Map</span>
              </div>

              {/* High activation focal coordinate badge */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-navy-950/80 rounded font-mono text-[10px] text-slate-400 border border-navy-800">
                Peak Activation: <span className="text-cyan-300">X: 182, Y: 384</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

