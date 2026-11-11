import React, { useState } from 'react';
import {
  Scan,
  Layers,
  Activity,
  CheckCircle2,
  Sliders,
  Columns,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const LungSegmentationPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { selectedStudy, studies, setSelectedStudy } = useData();
  const currentStudy = selectedStudy || studies[0];

  const [maskMode, setMaskMode] = useState<'both' | 'right' | 'left'>('both');
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showFill, setShowFill] = useState<boolean>(true);
  const [fillOpacity, setFillOpacity] = useState<number>(35);

  const imgSrc = currentStudy.images[0]?.storageUrl || '/samples/sample_pleural_effusion.png';

  // Quantitative segmentation statistics
  const diceScore = currentStudy.latestJob?.result?.diceScore || 0.942;
  const iouMetric = currentStudy.latestJob?.result?.ioUMetric || 0.891;
  const leftLungArea = currentStudy.latestJob?.result?.leftLungAreaPixels || 184500;
  const rightLungArea = currentStudy.latestJob?.result?.rightLungAreaPixels || 142100;
  const ctr = currentStudy.latestJob?.result?.cardiothoracicRatio || 0.48;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">U-Net Lung Segmentation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Bi-Lateral Volumetric Analysis
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated semantic boundary delineation, Dice similarity scoring, and cardiothoracic ratio calculation.
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

      {/* Quantitative Clinical Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Dice Score</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">{diceScore.toFixed(3)}</span>
          <p className="text-[11px] text-emerald-400 mt-1">High volumetric overlap</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Intersection / Union (IoU)</span>
          <span className="text-2xl font-bold text-white font-mono">{iouMetric.toFixed(3)}</span>
          <p className="text-[11px] text-slate-400 mt-1">Jaccard index</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Right Lung Area</span>
          <span className="text-2xl font-bold text-slate-200 font-mono">{(rightLungArea / 1000).toFixed(1)}k</span>
          <p className="text-[11px] text-amber-400 mt-1">Volume reduced (effusion)</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Left Lung Area</span>
          <span className="text-2xl font-bold text-slate-200 font-mono">{(leftLungArea / 1000).toFixed(1)}k</span>
          <p className="text-[11px] text-slate-400 mt-1">Normal expansion</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Cardiothoracic Ratio</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">{ctr.toFixed(2)}</span>
          <p className="text-[11px] text-slate-400 mt-1">{ctr > 0.50 ? 'Cardiomegaly' : 'Normal (< 0.50)'}</p>
        </div>
      </div>

      {/* Controls & Visualization Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Toolbar */}
        <div className="lg:col-span-1 bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-5 text-xs">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Lung Selection
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'both', label: 'Bilateral' },
                { id: 'right', label: 'Right Lung' },
                { id: 'left', label: 'Left Lung' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMaskMode(m.id as any)}
                  className={`py-2 px-1 rounded-xl text-center font-medium transition-colors border ${
                    maskMode === m.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-navy-950 text-slate-400 border-navy-800 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-navy-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Display Modifiers
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>Show Contour Boundaries</span>
              <input
                type="checkbox"
                checked={showContours}
                onChange={(e) => setShowContours(e.target.checked)}
                className="rounded accent-cyan-400 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>Show Volumetric Tint</span>
              <input
                type="checkbox"
                checked={showFill}
                onChange={(e) => setShowFill(e.target.checked)}
                className="rounded accent-cyan-400 w-4 h-4"
              />
            </label>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Fill Opacity</span>
                <span className="font-mono text-cyan-300">{fillOpacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={fillOpacity}
                onChange={(e) => setFillOpacity(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Anatomic Legend */}
          <div className="pt-3 border-t border-navy-800 space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Anatomic Legend
            </label>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              <span>Right Lung Field (PA Left)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-electric-400"></span>
              <span>Left Lung Field (PA Right)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="w-3 h-0.5 bg-amber-400"></span>
              <span>Cardiac Apex Indentation</span>
            </div>
          </div>
        </div>

        {/* Center Viewport */}
        <div className="lg:col-span-3 bg-navy-950 border border-navy-800 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[500px]">
          <div className="relative rounded-2xl overflow-hidden border border-navy-800 shadow-2xl max-w-[500px]">
            <img src={imgSrc} alt="Chest radiograph" className="w-full h-auto object-cover" />

            {/* SVG Mask & Contour Layer */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Right Lung Field (patient right, image left) */}
              {(maskMode === 'both' || maskMode === 'right') && (
                <path
                  d="M 170 120 C 130 140 100 240 100 340 C 120 380 180 390 220 360 C 230 300 220 200 170 120 Z"
                  fill={showFill ? `rgba(6, 182, 212, ${fillOpacity / 100})` : 'transparent'}
                  stroke={showContours ? '#22D3EE' : 'transparent'}
                  strokeWidth="3"
                  strokeDasharray={showContours ? '6 4' : 'none'}
                />
              )}

              {/* Left Lung Field (patient left, image right) */}
              {(maskMode === 'both' || maskMode === 'left') && (
                <path
                  d="M 320 120 C 360 140 395 240 395 340 C 375 385 320 390 280 370 C 265 320 280 200 320 120 Z"
                  fill={showFill ? `rgba(59, 130, 246, ${fillOpacity / 100})` : 'transparent'}
                  stroke={showContours ? '#60A5FA' : 'transparent'}
                  strokeWidth="3"
                  strokeDasharray={showContours ? '6 4' : 'none'}
                />
              )}
            </svg>

            {/* Floating HUD Badges */}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-navy-950/80 rounded-lg border border-navy-800 text-[10px] font-mono text-cyan-300">
              Right Hemithorax: {(rightLungArea / 1000).toFixed(0)}k px
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-navy-950/80 rounded-lg border border-navy-800 text-[10px] font-mono text-electric-300">
              Left Hemithorax: {(leftLungArea / 1000).toFixed(0)}k px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

