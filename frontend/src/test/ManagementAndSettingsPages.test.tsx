import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { PatientManagementPage } from '../pages/PatientManagementPage';
import { PatientDetailsPage } from '../pages/PatientDetailsPage';
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage';
import { ModelPerformancePage } from '../pages/ModelPerformancePage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SystemSettingsPage } from '../pages/SystemSettingsPage';
import { ProfilePage } from '../pages/ProfilePage';

describe('Management & Settings Pages', () => {
  it('renders Patient Management page and opens Register modal', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <PatientManagementPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Patient Management/i)).toBeInTheDocument();
    const registerBtn = screen.getByRole('button', { name: /Register Research Patient/i });
    fireEvent.click(registerBtn);
    expect(screen.getByText(/Register Synthetic Research Patient/i)).toBeInTheDocument();
  });

  it('renders Patient Details page with medical summary', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <PatientDetailsPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Arthur Pendelton/i)).toBeInTheDocument();
    expect(screen.getByText(/Longitudinal Medical Record & Imaging History/i)).toBeInTheDocument();
  });

  it('renders Analytics Dashboard with modality distribution and abnormality statistics', () => {
    render(
      <AuthProvider>
        <DataProvider>
          <AnalyticsDashboardPage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Clinical Analytics & Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Studies Processed/i)).toBeInTheDocument();
  });

  it('renders Model Performance benchmark matrix', () => {
    render(
      <AuthProvider>
        <DataProvider>
          <ModelPerformancePage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Model Performance & Evaluation/i)).toBeInTheDocument();
    expect(screen.getByText(/DenseNet121/i)).toBeInTheDocument();
  });

  it('renders User Management with user directory and roles', () => {
    render(
      <AuthProvider>
        <DataProvider>
          <UserManagementPage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/User & Role Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Alexander Hayes/i)).toBeInTheDocument();
  });

  it('renders Audit Logs page with security event trails', () => {
    render(
      <AuthProvider>
        <DataProvider>
          <AuditLogsPage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Compliance Audit Trail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by user, action, or study ID.../i)).toBeInTheDocument();
  });

  it('renders System Settings and Profile pages', () => {
    render(
      <AuthProvider>
        <DataProvider>
          <SystemSettingsPage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/System & PACS Settings/i)).toBeInTheDocument();

    render(
      <AuthProvider>
        <DataProvider>
          <ProfilePage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Physician Profile & Credentials/i)).toBeInTheDocument();
  });
});
