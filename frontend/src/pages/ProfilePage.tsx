import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Bell,
  Save,
  CheckCircle2,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useData();

  const [fullName, setFullName] = useState(user?.fullName || 'Dr. Elena Vance, MD, FACR');
  const [department, setDepartment] = useState(user?.department || 'Thoracic Imaging Division');
  const [license, setLicense] = useState(user?.medicalLicenseNumber || 'RAD-NY-849204');
  const [signatureText, setSignatureText] = useState(user?.digitalSignatureText || 'Elena Vance, MD, Board-Certified Thoracic Radiologist');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Profile Updated', 'Physician profile and digital credentials successfully stored.', 'success');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) {
      addToast('Validation Error', 'Please supply current and new password.', 'warning');
      return;
    }
    addToast('Password Changed', 'Security credentials updated.', 'success');
    setCurrentPw('');
    setNewPw('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Physician Profile & Credentials</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage clinical credentials, board certifications, and digital signature cryptographic stamp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-electric-600 flex items-center justify-center font-bold text-navy-950 text-base shadow-glow-cyan">
              {fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{fullName}</h2>
              <p className="text-xs text-cyan-400 font-mono">{user?.role} &bull; {user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Full Legal Name & Title:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Medical License Number:</label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Department / Division:</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Digital Signature Representation */}
            <div>
              <label className="text-slate-400 block mb-1">Digital Signature Text Stamp:</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 font-serif italic focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Appears on finalized PDF consultations with RSA hash.</p>
            </div>

            {/* Signature Preview Canvas */}
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Cryptographic Stamp Preview</span>
                <span className="text-base text-cyan-300 font-serif italic">{signatureText}</span>
                <span className="text-[10px] text-emerald-400 block font-mono mt-0.5">RSA-2048 Certified &bull; SHA-256 Validated</span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Save className="w-4 h-4 text-navy-950" />
              <span>Update Credentials</span>
            </button>
          </form>
        </div>

        {/* Password & Security Card */}
        <div className="lg:col-span-1 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-panel space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-navy-800">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Password & Security</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Current Password:</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">New Secure Password:</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold border border-navy-700 transition-colors"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

