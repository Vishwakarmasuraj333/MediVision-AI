import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Cpu,
  User,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activePage, setActivePage }) => {
  const { user, logout, switchUser } = useAuth();
  const { selectedStudy, studies } = useData();
  const [profileOpen, setProfileOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const roles: { role: UserRole; name: string; title: string }[] = [
    { role: 'Radiologist', name: 'Dr. Elena Vance, MD', title: 'Lead Thoracic Radiologist' },
    { role: 'Admin', name: 'Dr. Alexander Hayes, Ph.D.', title: 'Chief Systems Administrator' },
    { role: 'Radiologist', name: 'Dr. Marcus Chen, MD', title: 'Cardiothoracic Radiologist' },
    { role: 'Researcher', name: 'Sarah Jenkins, M.Sc.', title: 'Lead AI Research Scientist' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 text-slate-200">
      {/* Top Research Disclaimer Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-cyan-950/40 to-navy-950 px-4 py-1 text-xs border-b border-cyan-900/30 flex items-center justify-between text-cyan-400">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-medium tracking-wide">
            INVESTIGATIONAL RESEARCH DECISION SUPPORT &bull; NOT CLEARED FOR AUTONOMOUS CLINICAL DIAGNOSIS &bull; QUALIFIED PHYSICIAN REVIEW MANDATORY
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-3 text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>PyTorch 2.15 CPU Inference Active</span>
          </span>
          <span>&bull;</span>
          <span className="text-cyan-300 font-mono">v2.1-Enterprise</span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-navy-800/80 text-slate-300 hover:text-cyan-400 hover:bg-navy-700/80 transition-colors focus:outline-none"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActivePage('radiologist-dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-electric-600 flex items-center justify-center shadow-glow-cyan">
              <Stethoscope className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  MediVision
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Radiology Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* Center: Active Study Quick Switcher / Status */}
        <div className="hidden xl:flex items-center space-x-3 bg-navy-950/70 border border-navy-800 px-3.5 py-1.5 rounded-xl text-xs">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Study:</span>
          </span>
          {selectedStudy ? (
            <div className="flex items-center space-x-2">
              <span className="font-mono text-cyan-300 font-semibold">{selectedStudy.accessionNumber}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-200 font-medium">{selectedStudy.patientName} ({selectedStudy.patientAge}y, {selectedStudy.patientGender})</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                selectedStudy.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                selectedStudy.status === 'InReview' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {selectedStudy.status}
              </span>
            </div>
          ) : (
            <span className="text-slate-500">None selected</span>
          )}
        </div>

        {/* Right: Actions, Persona Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Persona Switcher for pair-programming & live evaluation */}
          <div className="relative">
            <button
              onClick={() => { setPersonaOpen(!personaOpen); setProfileOpen(false); }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700/80 border border-navy-700/60 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
              title="Switch user perspective for review"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Role Persona:</span>
              <span className="text-cyan-400 font-semibold">{user?.role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {personaOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Role Perspectives
                </p>
                {roles.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { switchUser(r.role); setPersonaOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col space-y-0.5 transition-colors ${
                      user?.fullName === r.name ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:bg-navy-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-navy-800 text-slate-400">{r.role}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{r.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setPersonaOpen(false); }}
              className="p-2 rounded-lg bg-navy-800/80 hover:bg-navy-700/80 text-slate-300 hover:text-cyan-400 border border-navy-700/60 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-navy-900 animate-pulse"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                  <span className="text-xs font-semibold text-white">System Notifications</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">2 Pending</span>
                </div>
                <div className="space-y-2 mt-2 text-xs">
                  <div className="p-2 rounded-lg bg-navy-800/80 border border-navy-700/60 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">ACC-2026-9001 In Review</p>
                      <p className="text-[11px] text-slate-400">Moderate pleural effusion identified. Radiologist sign-off required.</p>
                      <span className="text-[10px] text-slate-500">25m ago</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-navy-800/80 border border-navy-700/60 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-200">ACC-2026-9003 Report Approved</p>
                      <p className="text-[11px] text-slate-400">Cardiothoracic review digitally signed by Dr. Marcus Chen.</p>
                      <span className="text-[10px] text-slate-500">1h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setPersonaOpen(false); }}
              className="flex items-center space-x-2.5 p-1.5 pl-2 rounded-xl bg-navy-800/80 hover:bg-navy-700/80 border border-navy-700/60 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center font-bold text-navy-950 text-xs">
                {user?.fullName?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-100 leading-none">{user?.fullName}</p>
                <p className="text-[10px] text-cyan-400 font-medium leading-tight mt-0.5">{user?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-navy-800">
                  <p className="text-xs font-bold text-white">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{user?.department}</p>
                </div>
                <div className="pt-1 text-xs">
                  <button
                    onClick={() => { setActivePage('profile'); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-navy-800 text-slate-200 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Credentials & Digital Signature</span>
                  </button>
                  <button
                    onClick={() => { setActivePage('settings'); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-navy-800 text-slate-200 flex items-center space-x-2"
                  >
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings & PACS</span>
                  </button>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/20 text-rose-400 flex items-center space-x-2 mt-1 border-t border-navy-800"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

