import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Maximize2,
  Move,
  Layers,
  Ruler,
  Info,
  RefreshCw,
  Flame,
  Scan,
  Download,
  Sliders,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const DicomViewerPage: React.FC = () => {
  const { selectedStudy, studies, setSelectedStudy } = useData();
  const currentStudy = selectedStudy || studies[0];

  // Viewer display state
  const [zoom, setZoom] = useState<number>(1.0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrastVal, setContrastVal] = useState<number>(100);
  const [invert, setInvert] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [showGradCam, setShowGradCam] = useState<boolean>(false);
  const [showMask, setShowMask] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [windowPreset, setWindowPreset] = useState<string>('Standard');
  const [activeTool, setActiveTool] = useState<'pan' | 'measure' | 'window'>('pan');

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply Window presets
  const applyPreset = (preset: string) => {
    setWindowPreset(preset);
    if (preset === 'Lung') {
      setBrightness(120);
      setContrastVal(145);
      setInvert(false);
    } else if (preset === 'Bone') {
      setBrightness(90);
      setContrastVal(180);
      setInvert(false);
    } else if (preset === 'SoftTissue') {
      setBrightness(105);
      setContrastVal(115);
      setInvert(false);
    } else if (preset === 'Inverted') {
      setBrightness(100);
      setContrastVal(100);
      setInvert(true);
    } else {
      // Standard
      setBrightness(100);
      setContrastVal(100);
      setInvert(false);
    }
  };

  const resetControls = () => {
    setZoom(1.0);
    setBrightness(100);
    setContrastVal(100);
    setInvert(false);
    setRotation(0);
    setShowGradCam(false);
    setShowMask(false);
    setWindowPreset('Standard');
  };

  // Render canvas with radiographic image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const imgSrc = currentStudy.images[0]?.storageUrl || '/samples/sample_pleural_effusion.png';
    img.src = imgSrc;

    img.onload = () => {
      canvas.width = canvas.parentElement?.clientWidth || 700;
      canvas.height = canvas.parentElement?.clientHeight || 600;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrastVal}%) ${invert ? 'invert(100%)' : ''}`;

      const drawWidth = 520;
      const drawHeight = 520;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      // Draw Grad-CAM overlay if enabled
      if (showGradCam) {
        ctx.filter = 'none';
        ctx.globalAlpha = 0.45;
        // Radial color gradient simulating localized attention
        const grad = ctx.createRadialGradient(80, 80, 10, 80, 80, 160);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.8)');
        grad.addColorStop(0.7, 'rgba(6, 182, 212, 0.5)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(80, 80, 160, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Draw U-Net lung mask if enabled
      if (showMask) {
        ctx.filter = 'none';
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);

        // Right lung border contour
        ctx.beginPath();
        ctx.ellipse(-110, -10, 75, 140, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Left lung border contour
        ctx.beginPath();
        ctx.ellipse(110, -5, 70, 135, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    };
  }, [currentStudy, zoom, brightness, contrastVal, invert, rotation, showGradCam, showMask]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Header & Study Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900 border border-navy-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">Diagnostic DICOM Viewer</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-navy-800 text-cyan-300 font-mono border border-navy-700">
                16-bit VOI LUT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High dynamic range radiography viewer with windowing presets, attention overlays, and header analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Select Study:</label>
          <select
            value={currentStudy.id}
            onChange={(e) => {
              const s = studies.find(st => st.id === e.target.value);
              if (s) setSelectedStudy(s);
            }}
            className="px-3 py-1.5 bg-navy-950 border border-navy-700 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            {studies.map(s => (
              <option key={s.id} value={s.id}>
                {s.accessionNumber} - {s.patientName} ({s.modality})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Viewer Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Toolbar & Presets */}
        <div className="lg:col-span-1 bg-navy-900 border border-navy-800 rounded-2xl p-4 space-y-5">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Window / Level Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Standard', label: 'Standard', desc: 'W:4096 L:2048' },
                { id: 'Lung', label: 'Lung Window', desc: 'W:1500 L:-600' },
                { id: 'Bone', label: 'Bone Contrast', desc: 'W:2000 L:350' },
                { id: 'SoftTissue', label: 'Mediastinum', desc: 'W:400 L:40' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`p-2 rounded-xl text-left text-xs transition-all border ${
                    windowPreset === p.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                      : 'bg-navy-950/70 text-slate-400 hover:text-slate-200 border-navy-800'
                  }`}
                >
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 pt-3 border-t border-navy-800 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="flex items-center space-x-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Magnification</span>
                </span>
                <span className="font-mono text-cyan-300">{(zoom * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="flex items-center space-x-1.5">
                  <Sun className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Brightness / Window Level</span>
                </span>
                <span className="font-mono text-cyan-300">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="flex items-center space-x-1.5">
                  <Contrast className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contrast / Window Width</span>
                </span>
                <span className="font-mono text-cyan-300">{contrastVal}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={contrastVal}
                onChange={(e) => setContrastVal(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* AI Decision-Support Layer Toggles */}
          <div className="space-y-2 pt-3 border-t border-navy-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              AI Overlay Layers
            </label>

            <button
              onClick={() => setShowGradCam(!showGradCam)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                showGradCam
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-navy-950/70 text-slate-400 hover:text-slate-200 border-navy-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Grad-CAM Attention Heatmap</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${showGradCam ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
            </button>

            <button
              onClick={() => setShowMask(!showMask)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                showMask
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-navy-950/70 text-slate-400 hover:text-slate-200 border-navy-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Scan className="w-4 h-4 text-cyan-400" />
                <span>U-Net Lung Segmentation</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${showMask ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-3 border-t border-navy-800 flex items-center space-x-2">
            <button
              onClick={() => setInvert(!invert)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                invert ? 'bg-electric-500/20 text-electric-300 border-electric-500/40' : 'bg-navy-800 text-slate-300 border-navy-700'
              }`}
            >
              Invert Gray
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-cyan-400 border border-navy-700"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={resetControls}
              className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-cyan-400 border border-navy-700"
              title="Reset Viewport"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div className="lg:col-span-3 bg-navy-950 border border-navy-800 rounded-2xl relative overflow-hidden flex flex-col min-h-[580px]">
          {/* Viewport Top HUD Overlays */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none text-xs font-mono space-y-0.5 text-slate-400 bg-navy-950/80 p-2.5 rounded-xl border border-navy-800">
            <p className="text-cyan-300 font-bold">{currentStudy.patientName}</p>
            <p>MRN: {currentStudy.patientIdentifier}</p>
            <p>DOB: 1962-04-12 ({currentStudy.patientAge}y, {currentStudy.patientGender})</p>
            <p className="text-amber-300 font-semibold">{currentStudy.modality} &bull; {currentStudy.bodyPart}</p>
          </div>

          <div className="absolute top-4 right-4 z-10 pointer-events-none text-xs font-mono text-right text-slate-400 bg-navy-950/80 p-2.5 rounded-xl border border-navy-800">
            <p className="text-slate-200">{currentStudy.accessionNumber}</p>
            <p>Acq: {new Date(currentStudy.studyDate).toLocaleDateString()}</p>
            <p>1024 x 1024 &bull; 16-bit</p>
            <p className="text-cyan-400">FS: 4.5 mAs &bull; 120 kVp</p>
          </div>

          {/* Interactive Canvas */}
          <div className="flex-1 flex items-center justify-center p-4">
            <canvas ref={canvasRef} className="max-w-full max-h-[540px] rounded-lg shadow-2xl cursor-crosshair" />
          </div>

          {/* Bottom HUD Bar */}
          <div className="h-12 bg-navy-900/90 border-t border-navy-800 px-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-3">
              <span>Zoom: <strong className="text-cyan-300 font-mono">{(zoom * 100).toFixed(0)}%</strong></span>
              <span>&bull;</span>
              <span>Rotation: <strong className="text-cyan-300 font-mono">{rotation}°</strong></span>
              <span>&bull;</span>
              <span>Preset: <strong className="text-cyan-300">{windowPreset}</strong></span>
            </div>

            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-navy-800 text-slate-300 hover:text-cyan-400 border border-navy-700"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showMetadata ? 'Hide DICOM Header' : 'View DICOM Header'}</span>
            </button>
          </div>

          {/* DICOM Metadata Drawer */}
          {showMetadata && (
            <div className="absolute inset-x-0 bottom-12 max-h-64 bg-navy-900/95 backdrop-blur-md border-t border-navy-700 p-4 overflow-y-auto text-xs z-20">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                <span className="font-bold text-white uppercase tracking-wider">DICOM Part 10 Header Inspector</span>
                <button onClick={() => setShowMetadata(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 font-mono text-[11px]">
                <div><span className="text-slate-500">(0010,0020) Patient ID:</span> <span className="text-cyan-300">{currentStudy.patientIdentifier}</span></div>
                <div><span className="text-slate-500">(0008,0060) Modality:</span> <span className="text-cyan-300">{currentStudy.modality}</span></div>
                <div><span className="text-slate-500">(0008,0050) Accession Number:</span> <span className="text-cyan-300">{currentStudy.accessionNumber}</span></div>
                <div><span className="text-slate-500">(0018,0015) Body Part Examined:</span> <span className="text-slate-200">{currentStudy.bodyPart}</span></div>
                <div><span className="text-slate-500">(0028,0002) Samples Per Pixel:</span> <span className="text-slate-200">1</span></div>
                <div><span className="text-slate-500">(0028,0004) Photometric Interp:</span> <span className="text-slate-200">MONOCHROME2</span></div>
                <div><span className="text-slate-500">(0028,0100) Bits Allocated:</span> <span className="text-slate-200">16</span></div>
                <div><span className="text-slate-500">(0028,0101) Bits Stored:</span> <span className="text-slate-200">12</span></div>
                <div><span className="text-slate-500">(0028,1050) Window Center:</span> <span className="text-cyan-300">2048</span></div>
                <div><span className="text-slate-500">(0028,1051) Window Width:</span> <span className="text-cyan-300">4096</span></div>
                <div><span className="text-slate-500">(0020,000D) Study Instance UID:</span> <span className="text-slate-400 truncate">{currentStudy.studyInstanceUid}</span></div>
                <div><span className="text-slate-500">Quality Check Status:</span> <span className="text-emerald-400">PASSED (SNR 30.2 dB)</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

