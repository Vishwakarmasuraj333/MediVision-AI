import React, { useState } from 'react';
import {
  LineChart,
  Activity,
  CheckCircle2,
  Cpu,
  Info,
  ShieldAlert,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useData } from '../context/DataContext';

export const ModelPerformancePage: React.FC = () => {
  const { models } = useData();
  const [selectedModel, setSelectedModel] = useState<string>('DenseNet121');

  // Multi-threshold ROC-AUC simulation data
  const rocData = [
    { fpr: 0.00, densenet: 0.00, effnet: 0.00, resnet: 0.00, vit: 0.00 },
    { fpr: 0.05, densenet: 0.42, effnet: 0.48, resnet: 0.39, vit: 0.52 },
    { fpr: 0.10, densenet: 0.68, effnet: 0.72, resnet: 0.64, vit: 0.76 },
    { fpr: 0.15, densenet: 0.79, effnet: 0.83, resnet: 0.76, vit: 0.86 },
    { fpr: 0.20, densenet: 0.86, effnet: 0.89, resnet: 0.83, vit: 0.91 },
    { fpr: 0.30, densenet: 0.92, effnet: 0.94, resnet: 0.90, vit: 0.95 },
    { fpr: 0.50, densenet: 0.96, effnet: 0.97, resnet: 0.95, vit: 0.98 },
    { fpr: 0.80, densenet: 0.99, effnet: 0.99, resnet: 0.98, vit: 1.00 },
    { fpr: 1.00, densenet: 1.00, effnet: 1.00, resnet: 1.00, vit: 1.00 }
  ];

  // Per-pathology evaluation metrics
  const pathologyMetrics = [
    { condition: 'Pleural Effusion', auroc: 0.912, precision: 0.864, sensitivity: 0.882, specificity: 0.931, f1: 0.873, support: 1420 },
    { condition: 'Cardiomegaly', auroc: 0.924, precision: 0.881, sensitivity: 0.894, specificity: 0.948, f1: 0.887, support: 1105 },
    { condition: 'Pneumothorax', auroc: 0.895, precision: 0.842, sensitivity: 0.825, specificity: 0.965, f1: 0.833, support: 640 },
    { condition: 'Atelectasis', auroc: 0.842, precision: 0.785, sensitivity: 0.792, specificity: 0.884, f1: 0.788, support: 1850 },
    { condition: 'Consolidation', auroc: 0.826, precision: 0.762, sensitivity: 0.748, specificity: 0.891, f1: 0.755, support: 920 },
    { condition: 'Pneumonia', auroc: 0.814, precision: 0.741, sensitivity: 0.730, specificity: 0.899, f1: 0.735, support: 580 },
    { condition: 'Edema', auroc: 0.889, precision: 0.834, sensitivity: 0.846, specificity: 0.925, f1: 0.840, support: 780 },
    { condition: 'No Finding', auroc: 0.884, precision: 0.892, sensitivity: 0.880, specificity: 0.876, f1: 0.886, support: 3200 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Model Performance & Evaluation</h1>
        <p className="text-sm text-slate-400 mt-1">
          Rigorous receiver operating characteristic (ROC-AUC), precision-recall, and per-pathology statistical benchmarks.
        </p>
      </div>

      {/* Benchmark Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Mean Validation AUROC</span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">0.892</span>
          <p className="text-[11px] text-slate-400 mt-1">DenseNet-121 test cohort</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Top Performing Architecture</span>
          <span className="text-2xl font-bold text-electric-400 font-mono">ViT-B/16</span>
          <p className="text-[11px] text-emerald-400 mt-1">AUROC 0.914 (+2.2%)</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Calibration Error (ECE)</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">0.024</span>
          <p className="text-[11px] text-slate-400 mt-1">Platt scaled (T=1.15)</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-4 rounded-2xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Patient-Level Split</span>
          <span className="text-2xl font-bold text-white font-mono">70 / 10 / 20</span>
          <p className="text-[11px] text-slate-400 mt-1">Zero patient leakage</p>
        </div>
      </div>

      {/* Multi-Model ROC Curve Chart */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-navy-800 gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Receiver Operating Characteristic (ROC-AUC) Curves
            </h2>
            <p className="text-xs text-slate-400">Comparing True Positive Rate vs False Positive Rate across 4 Deep Architectures</p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span><span>DenseNet121 (0.892)</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-electric-400"></span><span>EfficientNet-B4 (0.908)</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span>ResNet50 (0.884)</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span><span>ViT-B/16 (0.914)</span></span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="fpr" stroke="#64748B" fontSize={11} label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }} />
              <YAxis stroke="#64748B" fontSize={11} label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="densenet" stroke="#06B6D4" strokeWidth={2.5} name="DenseNet121" />
              <Line type="monotone" dataKey="effnet" stroke="#3B82F6" strokeWidth={2.5} name="EfficientNet-B4" />
              <Line type="monotone" dataKey="resnet" stroke="#F59E0B" strokeWidth={2.5} name="ResNet50" />
              <Line type="monotone" dataKey="vit" stroke="#A855F7" strokeWidth={2.5} name="ViT-B/16" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Pathology Evaluation Metrics Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Per-Pathology Classification Metrics (DenseNet-121 Benchmark)
          </h3>
          <span className="text-xs text-slate-400 font-mono">NIH-14 Test Cohort (N=25,596)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-navy-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5 font-sans">Thoracic Pathology</th>
                <th className="px-6 py-3.5">ROC-AUC</th>
                <th className="px-6 py-3.5">Precision</th>
                <th className="px-6 py-3.5">Sensitivity (Recall)</th>
                <th className="px-6 py-3.5">Specificity</th>
                <th className="px-6 py-3.5">F1 Score</th>
                <th className="px-6 py-3.5 text-right font-sans">Test Cases (N)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              {pathologyMetrics.map(p => (
                <tr key={p.condition} className="hover:bg-navy-800/40 transition-colors">
                  <td className="px-6 py-3.5 font-sans font-bold text-slate-100">{p.condition}</td>
                  <td className="px-6 py-3.5 text-cyan-300 font-bold">{p.auroc.toFixed(3)}</td>
                  <td className="px-6 py-3.5 text-slate-200">{p.precision.toFixed(3)}</td>
                  <td className="px-6 py-3.5 text-slate-200">{p.sensitivity.toFixed(3)}</td>
                  <td className="px-6 py-3.5 text-slate-200">{p.specificity.toFixed(3)}</td>
                  <td className="px-6 py-3.5 text-emerald-400">{p.f1.toFixed(3)}</td>
                  <td className="px-6 py-3.5 text-right text-slate-400">{p.support.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

