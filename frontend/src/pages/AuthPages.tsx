import React, { useState } from 'react';
import {
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigateForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateForgotPassword }) => {
  const { login } = useAuth();
  const { addToast } = useData();

  const [email, setEmail] = useState('dr.elena.vance@medivision.ai');
  const [password, setPassword] = useState('Radiology@2026!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    await login(email, password);
    setLoading(false);
    addToast('Authentication Verified', 'Welcome to MediVision AI Radiology Platform.', 'success');
    onLoginSuccess();
  };

  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('MediVision@2026!');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-electric-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-electric-600 flex items-center justify-center mx-auto shadow-glow-cyan mb-4">
          <Stethoscope className="w-8 h-8 text-navy-950" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">MediVision AI</h1>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-1">
          Enterprise Medical Imaging Intelligence & Decision Support
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-navy-900/90 border border-navy-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white">Sign In to Workstation</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticate with institutional credentials or select a research persona.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Institutional Email:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-medium">Password:</label>
              <button
                type="button"
                onClick={onNavigateForgotPassword}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Decision Support'}</span>
            <ArrowRight className="w-4 h-4 text-navy-950" />
          </button>
        </form>

        {/* Demo Fast Fill Section */}
        <div className="mt-6 pt-6 border-t border-navy-800 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
            1-Click Research Demo Personas
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => setDemoUser('dr.elena.vance@medivision.ai')}
              className="p-2 rounded-xl bg-navy-950 border border-navy-800 hover:border-cyan-500/50 text-left text-slate-300 transition-colors"
            >
              <span className="font-bold text-white block">Dr. Vance (MD)</span>
              <span className="text-[10px] text-cyan-400">Radiologist</span>
            </button>
            <button
              onClick={() => setDemoUser('admin@medivision.ai')}
              className="p-2 rounded-xl bg-navy-950 border border-navy-800 hover:border-cyan-500/50 text-left text-slate-300 transition-colors"
            >
              <span className="font-bold text-white block">Dr. Hayes (Ph.D.)</span>
              <span className="text-[10px] text-electric-400">Administrator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="mt-8 text-center text-slate-500 text-[11px] max-w-md relative z-10">
        MediVision AI is strictly for investigational decision-support purposes and is not cleared for autonomous clinical interpretation.
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC<{ onBackToLogin: () => void }> = ({ onBackToLogin }) => {
  const { addToast } = useData();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Reset Dispatched', `Password recovery dispatched for ${email}.`, 'info');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl relative z-10 text-xs">
        <h2 className="text-lg font-bold text-white">Reset Credentials</h2>
        <p className="text-slate-400 mt-1 mb-5">
          Enter your registered institutional email to receive a secure recovery code.
        </p>

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-slate-200 font-medium">Recovery Link Dispatched</p>
            <p className="text-slate-400 text-[11px]">Check your institutional inbox for instructions.</p>
            <button
              onClick={onBackToLogin}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.vance@medivision.ai"
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-2 text-slate-400 hover:text-white"
            >
              Cancel and Return
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

