'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing or invalid password reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', padding: '5rem 0' }}>
      <div className="container-narrow">
        <div className="card" style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem' }}>🔒</span>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--navy-900)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              Reset Password
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
              Enter a new secure password for your account.
            </p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              Password reset successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reset-new-password">New Password</label>
              <input
                id="reset-new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">Confirm New Password</label>
              <input
                id="reset-confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
            <Link href="/login" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading reset form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

