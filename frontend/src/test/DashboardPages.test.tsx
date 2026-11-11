import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { RadiologistDashboardPage } from '../pages/RadiologistDashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

describe('Frontend Dashboard Pages', () => {
  it('renders Radiologist Dashboard with clinical KPI cards and quick navigation', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <RadiologistDashboardPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Radiologist Reading Worklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Urgent \/ Stat/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Model Latency/i)).toBeInTheDocument();

    // Verify button to upload
    const uploadBtn = screen.getByRole('button', { name: /Upload New Study/i });
    fireEvent.click(uploadBtn);
    expect(setActivePage).toHaveBeenCalledWith('upload-center');
  });

  it('renders Admin Dashboard with system operations and infrastructure telemetry', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <AdminDashboardPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Administrator Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/FastAPI AI Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/ASP\.NET Core Web API/i)).toBeInTheDocument();
  });
});
