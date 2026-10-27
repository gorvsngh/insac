'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await api.forgotPassword(email);
      setStatus({ success: true, message: res.message });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset request failed.';
      setStatus({ success: false, message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', padding: '5rem 0' }}>
      <div className="container-narrow">
        <div className="card" style={{ maxWidth: '440px', margin: '0 auto', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2rem' }}>🔑</span>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--navy-900)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
              Recover Password
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {status && (
            <div className={`alert ${status.success ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1.5rem' }}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-email">Registered Email Address</label>
              <input
                id="recovery-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
            >
              {loading ? 'Processing...' : 'Send Recovery Link'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem' }}>
            <Link href="/login" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
              ← Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
