'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      await refreshUser();
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '3.5rem 0' }}>
      <div className="container-narrow">
        <div className="card" style={{ maxWidth: '440px', margin: '0 auto', padding: '2rem', borderTop: '4px solid #0f294a' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '0.785rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              INSAC 2026 Portal
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f294a', marginTop: '0.25rem', marginBottom: '0.25rem', fontWeight: 700 }}>
              Participant Sign In
            </h1>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Access your conference dashboard &amp; submission status
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@institution.edu"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password">Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#0f294a' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              id="submit-login-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            New Participant?{' '}
            <Link href="/register" style={{ color: '#0f294a', fontWeight: 700 }}>
              Register Profile Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
