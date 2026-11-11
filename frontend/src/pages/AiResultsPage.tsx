import React, { useState } from 'react';
import {
  Grid,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  BrainCircuit,
  Sliders,
  BarChart2
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const AiResultsPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { selectedStudy, studies, setSelectedStudy } = useData();
  const currentStudy = selectedStudy || studies[0];
  const result = currentStudy.latestJob?.result;

  const [threshold, setThreshold] = useState<number>(0.50);

  const findings = result?.classifications || [
    { condition: 'Pleural Effusion', rawScore: 2.45, calibratedProbability: 0.88, confidenceLower95: 0.82, confidenceUpper95: 0.93, isPositive: true, severityLevel: 'High' as const },
    { condition: 'Atelectasis', rawScore: 1.10, calibratedProbability: 0.65, confidenceLower95: 0.58, confidenceUpper95: 0.72, isPositive: true, severityLevel: 'Moderate' as const },
    { condition: 'Consolidation', rawScore: -0.20, calibratedProbability: 0.22, confidenceLower95: 0.16, confidenceUpper95: 0.28, isPositive: false, severityLevel: 'Low' as const },
    { condition: 'Infiltration', rawScore: 0.45, calibratedProbability: 0.38, confidenceLower95: 0.31, confidenceUpper95: 0.45, isPositive: false, severityLevel: 'Low' as const },
    { condition: 'Cardiomegaly', rawScore: -0.85, calibratedProbability: 0.14, confidenceLower95: 0.09, confidenceUpper95: 0.19, isPositive: false, severityLevel: 'Low' as const },
    { condition: 'Pneumonia', rawScore: -1.50, calibratedProbability: 0.08, confidenceLower95: 0.04, confidenceUpper95: 0.12, isPositive: false, severityLevel: 'Minimal' as const },
    { condition: 'Pneumothorax', rawScore: -2.10, calibratedProbability: 0.04, confidenceLower95: 0.02, confidenceUpper95: 0.07, isPositive: false, severityLevel: 'Minimal' as const },
    { condition: 'No Finding', rawScore: -2.80, calibratedProbability: 0.03, confidenceLower95: 0.01, confidenceUpper95: 0.06, isPositive: false, severityLevel: 'Minimal' as const }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Results Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Calibrated Probabilities & CI
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Multi-label chest pathology probabilities, Platt temperature scaling, and 95% Wilson confidence intervals.
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

      {/* Primary Suspicion Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lead Model Finding</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Above Research Cutoff ({threshold.toFixed(2)})
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {result?.primaryFinding || 'Pleural Effusion'}
              <span className="text-base text-cyan-300 font-mono ml-2">
                (p={((result?.overallConfidence || 0.88)).toFixed(2)})
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {result?.findingsSummary || 'Model features indicate high attribution for right blunting sulcus and fluid layering.'}
            </p>
          </div>
        </div>

        {/* Dynamic Cutoff Slider */}
        <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 w-full md:w-64 text-xs space-y-2">
          <div className="flex justify-between text-slate-300 font-medium">
            <span>Decision Threshold:</span>
            <span className="text-cyan-300 font-mono font-bold">{threshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.80"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <p className="text-[10px] text-slate-500">Flag conditions with p &ge; threshold</p>
        </div>
      </div>

      {/* Multi-Label Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Pathology Classifications (NIH-14 Classes)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">DenseNet-121 Architecture</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5">Condition / Finding</th>
                <th className="px-6 py-3.5">Calibrated Probability</th>
                <th className="px-6 py-3.5">95% Confidence Interval</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Classification Status</th>
                <th className="px-6 py-3.5 text-right">Raw Logit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300 font-mono">
              {findings.map((f) => {
                const isFlagged = f.calibratedProbability >= threshold;
                return (
                  <tr key={f.condition} className="hover:bg-navy-800/40 transition-colors">
                    <td className="px-6 py-4 font-sans font-semibold text-slate-100 flex items-center space-x-2">
                      {isFlagged ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span>{f.condition}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-24 bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                          <div
                            className={`h-full rounded-full ${
                              isFlagged ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${f.calibratedProbability * 100}%` }}
                          />
                        </div>
                        <span className="text-cyan-300 font-bold">
                          {(f.calibratedProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      [{(f.confidenceLower95 * 100).toFixed(0)}% &ndash; {(f.confidenceUpper95 * 100).toFixed(0)}%]
                    </td>

                    <td className="px-6 py-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        f.severityLevel === 'High' ? 'bg-rose-500/20 text-rose-300' :
                        f.severityLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {f.severityLevel}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        isFlagged
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-navy-950 text-slate-500 border-navy-800'
                      }`}>
                        {isFlagged ? 'Positive Finding' : 'Below Cutoff'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right text-slate-400">
                      {f.rawScore > 0 ? `+${f.rawScore.toFixed(2)}` : f.rawScore.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

