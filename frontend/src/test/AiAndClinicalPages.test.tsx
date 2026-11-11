import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { AiAnalysisWorkspacePage } from '../pages/AiAnalysisWorkspacePage';
import { GradCamViewerPage } from '../pages/GradCamViewerPage';
import { LungSegmentationPage } from '../pages/LungSegmentationPage';
import { AiResultsPage } from '../pages/AiResultsPage';
import { ReportGeneratorPage } from '../pages/ReportGeneratorPage';
import { ReportHistoryPage } from '../pages/ReportHistoryPage';

describe('AI Analysis & Clinical Decision Support Pages', () => {
  it('renders AI Analysis Workspace with architecture options and trigger button', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <AiAnalysisWorkspacePage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/AI Analysis Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/PyTorch Modular Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Deep Learning Model Architecture/i)).toBeInTheDocument();
  });

  it('renders Grad-CAM viewer with explainability attention heatmaps', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <GradCamViewerPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Explainable AI \(Grad-CAM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Feature Activation Visualizer/i)).toBeInTheDocument();
  });

  it('renders Lung Segmentation page with bilateral volumetric metrics', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <LungSegmentationPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/U-Net Lung Segmentation/i)).toBeInTheDocument();
    expect(screen.getByText(/Bi-Lateral Volumetric Analysis/i)).toBeInTheDocument();
  });

  it('renders AI Results page with multi-label probability breakdown', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <AiResultsPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/AI Results Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Lead Model Finding/i)).toBeInTheDocument();
  });

  it('renders Report Generator and allows reviewing/approving report', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <ReportGeneratorPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Medical Report Generator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign & Finalize Report/i })).toBeInTheDocument();
  });

  it('renders Report History page with report list', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <ReportHistoryPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Report History Archive/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by patient, accession, or report ID.../i)).toBeInTheDocument();
  });
});
