import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData, ToastMessage } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { LoginPage, ForgotPasswordPage } from './pages/AuthPages';
import { RadiologistDashboardPage } from './pages/RadiologistDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { StudyManagementPage } from './pages/StudyManagementPage';
import { UploadCenterPage } from './pages/UploadCenterPage';
import { DicomViewerPage } from './pages/DicomViewerPage';
import { AiAnalysisWorkspacePage } from './pages/AiAnalysisWorkspacePage';
import { GradCamViewerPage } from './pages/GradCamViewerPage';
import { LungSegmentationPage } from './pages/LungSegmentationPage';
import { AiResultsPage } from './pages/AiResultsPage';
import { ReportGeneratorPage } from './pages/ReportGeneratorPage';
import { ReportHistoryPage } from './pages/ReportHistoryPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { PatientManagementPage } from './pages/PatientManagementPage';
import { PatientDetailsPage } from './pages/PatientDetailsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`p-3.5 rounded-2xl shadow-2xl border text-xs flex items-start space-x-3 transition-all backdrop-blur-md ${
            t.type === 'success' ? 'bg-navy-900/95 border-emerald-500/40 text-emerald-300' :
            t.type === 'error' ? 'bg-navy-900/95 border-rose-500/40 text-rose-300' :
            t.type === 'warning' ? 'bg-navy-900/95 border-amber-500/40 text-amber-300' :
            'bg-navy-900/95 border-cyan-500/40 text-cyan-300'
          }`}
        >
          {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> :
           t.type === 'error' ? <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> :
           t.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> :
           <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p className="font-bold text-white">{t.title}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{t.message}</p>
          </div>
          <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      ))}
    </div>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activePage, setActivePage] = useState<string>('radiologist-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'login' | 'forgot-password'>('login');

  if (!isAuthenticated) {
    if (authView === 'forgot-password') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onLoginSuccess={() => setActivePage('radiologist-dashboard')}
        onNavigateForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'radiologist-dashboard':
        return <RadiologistDashboardPage setActivePage={setActivePage} />;
      case 'admin-dashboard':
        return <AdminDashboardPage setActivePage={setActivePage} />;
      case 'study-management':
        return <StudyManagementPage setActivePage={setActivePage} />;
      case 'upload-center':
        return <UploadCenterPage setActivePage={setActivePage} />;
      case 'dicom-viewer':
        return <DicomViewerPage />;
      case 'ai-workspace':
        return <AiAnalysisWorkspacePage setActivePage={setActivePage} />;
      case 'gradcam-viewer':
        return <GradCamViewerPage setActivePage={setActivePage} />;
      case 'lung-segmentation':
        return <LungSegmentationPage setActivePage={setActivePage} />;
      case 'ai-results':
        return <AiResultsPage setActivePage={setActivePage} />;
      case 'report-generator':
        return <ReportGeneratorPage setActivePage={setActivePage} />;
      case 'report-history':
        return <ReportHistoryPage setActivePage={setActivePage} />;
      case 'analytics-dashboard':
        return <AnalyticsDashboardPage />;
      case 'model-performance':
        return <ModelPerformancePage />;
      case 'patient-management':
        return <PatientManagementPage setActivePage={setActivePage} />;
      case 'patient-details':
        return <PatientDetailsPage setActivePage={setActivePage} />;
      case 'user-management':
        return <UserManagementPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'system-settings':
        return <SystemSettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <RadiologistDashboardPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {renderCurrentPage()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;

