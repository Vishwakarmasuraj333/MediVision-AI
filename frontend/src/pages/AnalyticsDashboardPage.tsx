import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Users,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../context/DataContext';
import { MOCK_ANALYTICS } from '../services/api';

export const AnalyticsDashboardPage: React.FC = () => {
  const { studies, patients } = useData();

  const COLORS = ['#06B6D4', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Clinical Analytics & Intelligence</h1>
        <p className="text-sm text-slate-400 mt-1">
          Longitudinal throughput metrics, disease prevalence patterns, and deep learning compute latency benchmarks.
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-panel">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Studies Processed</span>
          <span className="text-3xl font-bold text-white font-mono">{studies.length + 114}</span>
          <p className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this month</span>
          </p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-panel">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">AI Decision Inference Rate</span>
          <span className="text-3xl font-bold text-cyan-400 font-mono">98.2%</span>
          <p className="text-xs text-slate-400 mt-2">DenseNet-121 primary backbone</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-panel">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Radiologist Agreement</span>
          <span className="text-3xl font-bold text-emerald-400 font-mono">92.4%</span>
          <p className="text-xs text-slate-400 mt-2">Verified sign-offs</p>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-panel">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Mean Turnaround Time</span>
          <span className="text-3xl font-bold text-amber-400 font-mono">18.4<span className="text-base text-slate-400 font-sans">m</span></span>
          <p className="text-xs text-emerald-400 mt-2">&darr; 42% vs manual reading</p>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Throughput Line Chart */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Imaging & AI Throughput</h2>
              <p className="text-xs text-slate-400">Studies Ingested vs AI Analyzed vs Reports Finalized</p>
            </div>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ANALYTICS.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="studiesUploaded" stroke="#38BDF8" strokeWidth={2.5} name="Uploaded Studies" />
                <Line type="monotone" dataKey="aiAnalyses" stroke="#22D3EE" strokeWidth={2.5} name="AI Analyses" />
                <Line type="monotone" dataKey="reportsApproved" stroke="#10B981" strokeWidth={2.5} name="Reports Approved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Abnormality Prevalence Bar Chart */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-panel">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Observed Pathology Prevalence</h2>
              <p className="text-xs text-slate-400">Frequency of Detected Thoracic Conditions</p>
            </div>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ANALYTICS.abnormalityPrevalence} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="finding" type="category" stroke="#64748B" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 6, 6, 0]} name="Cases Identified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Latency by Model Architecture */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Inference Latency Profile by Model Architecture</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_ANALYTICS.latencyByModel.map((m) => (
            <div key={m.modelName} className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-xs">
              <span className="font-bold text-white block text-sm mb-2">{m.modelName}</span>
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Median P50:</span>
                  <span className="text-cyan-300 font-semibold">{m.p50Ms} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>P95 Percentile:</span>
                  <span className="text-amber-300">{m.p95Ms} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>P99 Percentile:</span>
                  <span className="text-rose-400">{m.p99Ms} ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

