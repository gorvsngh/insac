'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const initialCategory = searchParams.get('category') || 'student';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    institution: '',
    department: '',
    designation: '',
    participantCategory: initialCategory,
    consentGiven: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.consentGiven) {
      setError('You must accept the terms and consent for academic event communication.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register user
      await api.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        institution: formData.institution,
        department: formData.department,
        designation: formData.designation,
        participantCategory: formData.participantCategory,
        consentGiven: formData.consentGiven,
      });

      // 2. Automatically create initial registration with fee snapshot
      if (formData.participantCategory) {
        await api.createRegistration({
          category: formData.participantCategory,
          institution: formData.institution,
          department: formData.department,
          designation: formData.designation,
        }).catch(err => console.warn('Registration creation note:', err.message));
      }

      await refreshUser();
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const feePreview: Record<string, string> = {
    student: '₹500',
    research_scholar: '₹750',
    faculty: '₹1,000',
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '3rem 0' }}>
      <div className="container-narrow">
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem', borderTop: '4px solid #0f294a' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '0.785rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Conference Delegate Registration
            </div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f294a', marginTop: '0.25rem', marginBottom: '0.25rem', fontWeight: 700 }}>
              Create Participant Account
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              INSAC-2026 &amp; Advanced Computing Workshop • WIT LNMU Darbhanga
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name (with Title) *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Dr. / Prof. / Mr. / Ms. Full Name"
                className="form-control"
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@institution.edu"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Mobile / Contact Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="form-control"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="institution">Affiliation / Institution *</label>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  required
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. LNMU, BARC, IIT..."
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="department">Department</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Physics, Computer Science..."
                  className="form-control"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="designation">Designation</label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Student / Assistant Prof / Scientist..."
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="participantCategory">Registration Category *</label>
                <select
                  id="participantCategory"
                  name="participantCategory"
                  required
                  value={formData.participantCategory}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="student">Student (₹500)</option>
                  <option value="research_scholar">Research Scholar (₹750)</option>
                  <option value="faculty">Faculty Member (₹1,000)</option>
                </select>
                <div className="form-hint">
                  Applicable conference fee: <strong>{feePreview[formData.participantCategory] || '₹500'}</strong>
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  style={{ marginTop: '0.2rem' }}
                  required
                />
                <span>
                  I consent to the collection and processing of my registration details for the joint INSAC 2026 conference &amp; workshop organized by WIT LNMU and INS.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              id="submit-register-btn"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#0f294a', fontWeight: 700 }}>
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading registration form...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
