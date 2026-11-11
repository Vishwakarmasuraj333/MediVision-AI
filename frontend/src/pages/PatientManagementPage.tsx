import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Eye,
  ShieldCheck,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface PageProps {
  setActivePage: (page: string) => void;
}

export const PatientManagementPage: React.FC<PageProps> = ({ setActivePage }) => {
  const { patients, addNewPatient, studies, setSelectedStudy } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New patient form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1975-05-15');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [history, setHistory] = useState('');
  const [allergies, setAllergies] = useState('None known');

  const filtered = patients.filter(p =>
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    addNewPatient({
      firstName,
      lastName,
      dateOfBirth: dob,
      gender,
      bloodGroup,
      medicalHistorySummary: history,
      allergies
    });
    setShowAddModal(false);
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Patient Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Synthetic Research Directory
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Pseudonymized patient directory, longitudinal imaging histories, and clinical research cohorts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Research Patient</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient identifier, name, or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const patientStudies = studies.filter(s => s.patientId === p.id);
          return (
            <div
              key={p.id}
              className="bg-navy-900 border border-navy-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-panel transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-electric-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white">{p.firstName} {p.lastName}</h2>
                      <span className="font-mono text-cyan-300 text-[11px]">{p.patientIdentifier}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                    Research Proxy
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-300">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Age / Sex</span>
                      <span>{p.age}y &bull; {p.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Blood Group</span>
                      <span className="font-mono text-slate-200">{p.bloodGroup || 'O+'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">Clinical Summary</span>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{p.medicalHistorySummary || 'No chronic history recorded.'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{patientStudies.length} Studies Logged</span>
                <button
                  onClick={() => {
                    const firstStudy = patientStudies[0] || studies[0];
                    setSelectedStudy(firstStudy);
                    setActivePage('patient-details');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-cyan-300 text-xs font-medium border border-navy-700 transition-colors"
                >
                  View Profile &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Register Synthetic Research Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">First Name:</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Last Name:</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Date of Birth:</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gender:</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Blood Group:</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option>O+</option>
                    <option>A+</option>
                    <option>B+</option>
                    <option>AB+</option>
                    <option>O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Medical History & Indication Summary:</label>
                <textarea
                  rows={2}
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="E.g. COPD history, 30 pack-year smoking..."
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-medium hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

