import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { StudyManagementPage } from '../pages/StudyManagementPage';
import { UploadCenterPage } from '../pages/UploadCenterPage';
import { DicomViewerPage } from '../pages/DicomViewerPage';

describe('Study Management & Upload Pages', () => {
  it('renders Study Management with filters and searches studies', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <StudyManagementPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Imaging Studies Directory/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search studies by patient, accession, MRN.../i);
    expect(searchInput).toBeInTheDocument();

    // Type search
    fireEvent.change(searchInput, { target: { value: 'Arthur' } });
    expect(screen.getByText(/Arthur Pendelton/i)).toBeInTheDocument();
  });

  it('renders Upload Center and displays upload zones', () => {
    const setActivePage = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <UploadCenterPage setActivePage={setActivePage} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/X-Ray & DICOM Upload Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Load Verified Research Radiographs:/i)).toBeInTheDocument();
  });

  it('renders DICOM Viewer with viewport controls and tools', () => {
    render(
      <AuthProvider>
        <DataProvider>
          <DicomViewerPage />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Diagnostic DICOM Viewer/i)).toBeInTheDocument();
    expect(screen.getByText(/Window \/ Level Presets/i)).toBeInTheDocument();
  });
});
