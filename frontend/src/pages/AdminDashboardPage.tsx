import React from 'react';
import {
  LayoutDashboard,
  Server,
  Database,
  Cpu,
  HardDrive,
  Users,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  FileDown
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const AdminDashboardPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { studies, patients, addToast } = useData();

  const handleFlushCache = () => {
    addToast('PACS Cache Purged', 'Temporary inference memory buffers and tensor scratchpools cleared.', 'success');
  };

  const handleExportAudit = () => {
    addToast('Audit Export Dispatched', 'Immutable HIPAA-style audit CSV exported to administrative storage.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Administrator Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Dr. Alexander Hayes, Ph.D.
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            System infrastructure telemetry, PyTorch microservice orchestration, and storage health.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleFlushCache}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium border border-navy-700 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Purge Inference Cache</span>
          </button>
          <button
            onClick={handleExportAudit}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center space-x-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Cluster Node Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
            <span className="font-medium uppercase tracking-wider">FastAPI AI Engine</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Port 8000 &bull; PyTorch 2.15 CPU</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
            <span className="font-medium uppercase tracking-wider">ASP.NET Core Web API</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">Port 5000 &bull; REST v1</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
            <span className="font-medium uppercase tracking-wider">Database Storage</span>
            <Database className="w-4 h-4 text-electric-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">Normalized</div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">EF Core Dual (SQL / SQLite)</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs">
            <span className="font-medium uppercase tracking-wider">Storage Capacity</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">1.4 <span className="text-base text-slate-400 font-sans">TB / 8 TB</span></div>
          <p className="text-[11px] text-emerald-400 mt-2">17.5% volume utilized</p>
        </div>
      </div>

      {/* Two Column Administrative View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Node Telemetry */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-navy-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Inference Microservice Telemetry</h2>
            <span className="text-[10px] text-emerald-400 font-mono">HEALTHY</span>
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="flex justify-between p-2.5 bg-navy-950 rounded-xl">
              <span className="text-slate-400">Worker Architecture:</span>
              <span className="text-cyan-300">DenseNet121 + U-Net</span>
            </div>
            <div className="flex justify-between p-2.5 bg-navy-950 rounded-xl">
              <span className="text-slate-400">Torch Device:</span>
              <span className="text-slate-200">CPU (Vectorized Multi-Threading)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-navy-950 rounded-xl">
              <span className="text-slate-400">Average Inference Latency:</span>
              <span className="text-emerald-400">740 ms</span>
            </div>
            <div className="flex justify-between p-2.5 bg-navy-950 rounded-xl">
              <span className="text-slate-400">Grad-CAM Hook Layer:</span>
              <span className="text-cyan-300">features.denseblock4.denselayer16.conv2</span>
            </div>
            <div className="flex justify-between p-2.5 bg-navy-950 rounded-xl">
              <span className="text-slate-400">Active HTTP Sessions:</span>
              <span className="text-slate-200">4 Active Physicians</span>
            </div>
          </div>
        </div>

        {/* Rapid Jump Administration */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Security & Administration Quicklinks</h2>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setActivePage('user-management')}
                className="p-4 rounded-xl bg-navy-950 border border-navy-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <Users className="w-5 h-5 text-cyan-400 mb-2" />
                <span className="font-bold text-white block">User Access Control</span>
                <span className="text-[10px] text-slate-400">Roles, permissions & status</span>
              </button>

              <button
                onClick={() => setActivePage('audit-logs')}
                className="p-4 rounded-xl bg-navy-950 border border-navy-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-white block">Compliance Audit Log</span>
                <span className="text-[10px] text-slate-400">Immutable read/write trail</span>
              </button>

              <button
                onClick={() => setActivePage('system-settings')}
                className="p-4 rounded-xl bg-navy-950 border border-navy-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <Server className="w-5 h-5 text-electric-400 mb-2" />
                <span className="font-bold text-white block">PACS & Server Config</span>
                <span className="text-[10px] text-slate-400">DICOM server connections</span>
              </button>

              <button
                onClick={() => setActivePage('model-performance')}
                className="p-4 rounded-xl bg-navy-950 border border-navy-800 hover:border-cyan-500/40 text-left transition-all"
              >
                <Cpu className="w-5 h-5 text-amber-400 mb-2" />
                <span className="font-bold text-white block">Model Performance</span>
                <span className="text-[10px] text-slate-400">ROC-AUC & Calibration</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800 text-[11px] text-slate-400">
            MediVision AI Version: <span className="text-cyan-300 font-mono">2.1.0-Release-Enterprise</span>
          </div>
        </div>
      </div>
    </div>
  );
};

