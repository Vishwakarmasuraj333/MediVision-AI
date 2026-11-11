import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { LoginPage, ForgotPasswordPage } from '../pages/AuthPages';

describe('Frontend Auth Pages', () => {
  it('renders Login Page with brand header, email and password fields', () => {
    const handleLoginSuccess = vi.fn();
    const handleNavigateForgot = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateForgotPassword={handleNavigateForgot} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getAllByText(/MediVision AI/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sign In to Workstation/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('dr.elena.vance@medivision.ai')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Decision Support/i })).toBeInTheDocument();
  });

  it('navigates to Forgot Password view when clicking forgot password link', () => {
    const handleLoginSuccess = vi.fn();
    const handleNavigateForgot = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateForgotPassword={handleNavigateForgot} />
        </DataProvider>
      </AuthProvider>
    );

    const forgotBtn = screen.getByText(/Forgot Password\?/i);
    fireEvent.click(forgotBtn);
    expect(handleNavigateForgot).toHaveBeenCalledTimes(1);
  });

  it('renders Forgot Password Page and allows submitting reset request', async () => {
    const handleBack = vi.fn();

    render(
      <AuthProvider>
        <DataProvider>
          <ForgotPasswordPage onBackToLogin={handleBack} />
        </DataProvider>
      </AuthProvider>
    );

    expect(screen.getByText(/Reset Credentials/i)).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText(/dr.vance@medivision.ai/i);
    fireEvent.change(emailInput, { target: { value: 'test@medivision.ai' } });

    const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Recovery Link Dispatched/i)).toBeInTheDocument();
    });
  });
});
