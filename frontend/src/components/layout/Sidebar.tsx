import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  FolderKanban,
  UploadCloud,
  Eye,
  BrainCircuit,
  Flame,
  Scan,
  Grid,
  FileText,
  History,
  BarChart3,
  LineChart,
  UserCog,
  ShieldCheck,
  Settings,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePage, setActivePage }) => {
  const { studies, patients } = useData();

  const inReviewCount = studies.filter(s => s.status === 'InReview').length;

  const sections: NavSection[] = [
    {
      title: 'Clinical Portals',
      items: [
        { id: 'radiologist-dashboard', label: 'Radiologist Worklist', icon: Stethoscope, badge: inReviewCount > 0 ? `${inReviewCount} Urg` : undefined, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'analytics-dashboard', label: 'Analytics & KPIs', icon: BarChart3 }
      ]
    },
    {
      title: 'Medical Imaging',
      items: [
        { id: 'study-management', label: 'Study Management', icon: FolderKanban, badge: `${studies.length}`, badgeColor: 'bg-navy-800 text-slate-400' },
        { id: 'upload-center', label: 'X-Ray Upload Center', icon: UploadCloud },
        { id: 'dicom-viewer', label: 'Interactive DICOM Viewer', icon: Eye },
        { id: 'patient-management', label: 'Patient Management', icon: Users, badge: `${patients.length}`, badgeColor: 'bg-navy-800 text-slate-400' },
        { id: 'patient-details', label: 'Patient Profile & History', icon: UserCheck }
      ]
    },
    {
      title: 'AI & Explainability',
      items: [
        { id: 'ai-workspace', label: 'AI Analysis Workspace', icon: BrainCircuit, badge: 'DenseNet', badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
        { id: 'gradcam-viewer', label: 'Explainable Grad-CAM', icon: Flame },
        { id: 'lung-segmentation', label: 'Lung Segmentation (U-Net)', icon: Scan },
        { id: 'ai-results', label: 'AI Results Matrix', icon: Grid },
        { id: 'model-performance', label: 'Model Benchmarks & ROC', icon: LineChart }
      ]
    },
    {
      title: 'Radiology Reporting',
      items: [
        { id: 'report-generator', label: 'Medical Report Generator', icon: FileText },
        { id: 'report-history', label: 'Report History Archive', icon: History }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'user-management', label: 'User & Role Access', icon: UserCog },
        { id: 'audit-logs', label: 'Compliance Audit Trail', icon: ShieldCheck },
        { id: 'system-settings', label: 'System & PACS Config', icon: Settings },
        { id: 'profile', label: 'Profile & Credentials', icon: Sparkles }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[90px] left-0 h-screen lg:h-[calc(100vh-90px)] w-72 bg-navy-900 border-r border-navy-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-navy-800 flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-navy-950 text-xs">MV</div>
            <span className="font-bold text-white text-base">MediVision AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            ✕
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-navy-700">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </h3>
              <div className="space-y-0.5 mt-1.5">
                {section.items.map(item => {
                  const isActive = activePage === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-electric-600/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        {item.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.badgeColor || 'bg-navy-800 text-slate-400'}`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-navy-800/80 bg-navy-950/60 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-200 text-[11px]">Academic Research Node</p>
            <p className="text-[10px] text-cyan-400">DenseNet121 + U-Net</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30 animate-pulse"></div>
        </div>
      </aside>
    </>
  );
};

