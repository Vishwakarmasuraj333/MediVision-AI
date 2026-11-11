import React, { useState } from 'react';
import {
  Settings,
  Server,
  Cpu,
  ShieldCheck,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const SystemSettingsPage: React.FC = () => {
  const { addToast } = useData();

  const [pacsHost, setPacsHost] = useState('pacs.internal.hospital.org');
  const [pacsPort, setPacsPort] = useState('11112');
  const [pacsAeTitle, setPacsAeTitle] = useState('MEDIVISION_SCU');

  const [defaultModel, setDefaultModel] = useState('DenseNet121');
  const [threshold, setThreshold] = useState('0.50');
  const [workers, setWorkers] = useState('4');

  const [complianceMode, setComplianceMode] = useState('ResearchStudySupport');
  const [retentionDays, setRetentionDays] = useState('365');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Settings Saved', 'PACS network configuration and AI inference parameters updated.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System & PACS Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Hospital PACS network connectivity, deep learning inference thresholds, and privacy guardrails.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* PACS DCMTK Configuration */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-navy-800">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Hospital PACS Network (DICOM C-MOVE / C-STORE)</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">PACS Hostname / IP:</label>
              <input
                type="text"
                value={pacsHost}
                onChange={(e) => setPacsHost(e.target.value)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">DICOM Port:</label>
                <input
                  type="text"
                  value={pacsPort}
                  onChange={(e) => setPacsPort(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Application Entity (AE) Title:</label>
                <input
                  type="text"
                  value={pacsAeTitle}
                  onChange={(e) => setPacsAeTitle(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI & Inference Engine */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-navy-800">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">AI Inference Parameters</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Default Screening Architecture:</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
              >
                <option value="DenseNet121">DenseNet-121 (Multi-Label NIH-14 Pretrained)</option>
                <option value="EfficientNet-B4">EfficientNet-B4 (High-Resolution Net)</option>
                <option value="ResNet50">ResNet-50 (Deep Residual Net)</option>
                <option value="ViT-B/16">Vision Transformer (ViT-B/16)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Positive Flag Threshold:</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.9"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inference GPU Workers:</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={workers}
                  onChange={(e) => setWorkers(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Governance & Privacy Card */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span>Institutional Research & Privacy Guardrails Active</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Strict client-side pseudonymization enforced. Patient identification metadata stripped prior to model ingestion. Immutable audit recording enabled.
            </p>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center space-x-2 shrink-0"
          >
            <Save className="w-4 h-4 text-navy-950" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

