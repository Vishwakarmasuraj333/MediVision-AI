import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { MOCK_USERS } from '../services/api';
import { User, UserRole } from '../types';
import { useData } from '../context/DataContext';

export const UserManagementPage: React.FC = () => {
  const { addToast } = useData();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Radiologist');
  const [department, setDepartment] = useState('Thoracic Imaging');
  const [license, setLicense] = useState('RAD-NY-849204');

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      fullName,
      role,
      department,
      medicalLicenseNumber: license,
      digitalSignatureText: `${fullName}, Certified ${role}`,
      isActive: true,
      lastLoginAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    setShowModal(false);
    addToast('User Registered', `Account for ${fullName} (${role}) provisioned.`, 'success');
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    addToast('Status Updated', 'User access permissions updated.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">User & Role Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise role-based access control (RBAC), clinical privileges, and active physician directory.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/70 text-slate-400 uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="px-6 py-3.5">User Details</th>
                <th className="px-6 py-3.5">Role Privileges</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">License / ID</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-slate-300">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-100 block">{u.fullName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {u.department || 'Radiology Department'}
                  </td>

                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                    {u.medicalLicenseNumber || 'Institutional Privileges'}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 text-xs transition-colors"
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Provision Medical User Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name & Credentials:</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Dr. Jordan Cole, MD"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Institutional Email:</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.cole@medivision.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Role:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="Radiologist">Radiologist</option>
                    <option value="Admin">Admin</option>
                    <option value="Researcher">Researcher</option>
                    <option value="ReferringPhysician">Referring Physician</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Medical License #:</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Department / Clinical Section:</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-medium hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

