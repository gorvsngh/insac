'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { EventSettings, EventTheme } from '../../types';
import TemplateDownloadCard from '../../components/TemplateDownloadCard';
import WordCounter from '../../components/WordCounter';

function AbstractSubmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [themes, setThemes] = useState<EventTheme[]>([]);

  const initialTheme = searchParams.get('theme') || '';

  const [formData, setFormData] = useState({
    title: '',
    abstractText: '',
    authorName: '',
    coAuthors: '',
    institution: '',
    department: '',
    researchTheme: initialTheme,
    keywords: '',
    contactEmail: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ message: string; ref: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        authorName: prev.authorName || user.fullName || '',
        contactEmail: prev.contactEmail || user.email || '',
        institution: prev.institution || user.institution || '',
        department: prev.department || user.department || '',
      }));
    }
  }, [user]);

  // Load settings & themes
  useEffect(() => {
    api.getPublicSettings().then(res => {
      setSettings(res.settings);
      setThemes(res.settings?.themes || []);
      if (!initialTheme && res.settings?.themes?.length > 0) {
        setFormData(prev => ({ ...prev, researchTheme: prev.researchTheme || res.settings.themes[0].title }));
      }
    }).catch(err => console.error('Error fetching settings:', err));
  }, [initialTheme]);

  // Count words helper
  const wordLimit = settings?.abstractWordLimit || 250;
  const wordCount = formData.abstractText.trim()
    ? formData.abstractText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(ext)) {
        setError('Only .pdf, .doc, or .docx files are permitted for abstract attachment.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10 MB.');
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in or create an account before submitting your abstract so it can be managed from your participant dashboard.');
      return;
    }

    if (wordCount > wordLimit) {
      setError(`Abstract summary text exceeds the limit of ${wordLimit} words (currently ${wordCount} words). Please condense your text or refer to the uploaded document.`);
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('abstractText', formData.abstractText);
      formPayload.append('authorName', formData.authorName);
      formPayload.append('coAuthors', formData.coAuthors);
      formPayload.append('institution', formData.institution);
      formPayload.append('department', formData.department);
      formPayload.append('researchTheme', formData.researchTheme);
      formPayload.append('keywords', formData.keywords);
      formPayload.append('contactEmail', formData.contactEmail);
      if (file) {
        formPayload.append('document', file);
      }

      const res = await api.submitAbstract(formPayload);
      setSuccess({
        message: 'Your extended abstract has been submitted successfully!',
        ref: res.abstract.abstractRef,
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please check required fields.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section style={{
        backgroundColor: '#0f294a',
        color: '#ffffff',
        padding: '2.5rem 0',
        borderBottom: '3px solid #b45309',
      }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.825rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
            <Link href="/" style={{ color: '#fcd34d' }}>Home</Link>
            <span>/</span>
            <span>Abstract Submission</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.35rem', fontWeight: 700 }}>
            Extended Abstract Submission
          </h1>
          <p style={{ color: '#cbd5e1', maxWidth: '750px', fontSize: '0.95rem' }}>
            Submit your research contribution for INSAC 2026 and the National Workshop on Advanced Computing and Nuclear Science.
          </p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-narrow">
          {/* Download Official Template Highlight */}
          <div style={{ marginBottom: '2.5rem' }}>
            <TemplateDownloadCard />
          </div>

          {!user && (
            <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
              <div>
                <strong>Account Required:</strong> Please{' '}
                <Link href="/login" style={{ textDecoration: 'underline', fontWeight: 600 }}>log in</Link> or{' '}
                <Link href="/register" style={{ textDecoration: 'underline', fontWeight: 600 }}>create an account</Link>{' '}
                to associate your abstract with your participant profile and track review status.
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Success!</strong> {success.message}</div>
              <div>Your Abstract Reference ID is: <strong>{success.ref}</strong></div>
              <div style={{ fontSize: '0.85rem' }}>Redirecting to your participant dashboard...</div>
            </div>
          )}

          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
              Abstract Submission Form
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="abstract-title">Paper / Abstract Title *</label>
                <input
                  id="abstract-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="ALL CAPITAL, Times New Roman format (as in template)"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="researchTheme">Research Theme / Topic *</label>
                <select
                  id="researchTheme"
                  name="researchTheme"
                  required
                  value={formData.researchTheme}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="">-- Select Relevant Research Theme --</option>
                  {themes.map((t, idx) => (
                    <option key={idx} value={t.title}>
                      [{t.category === 'workshop' ? 'Workshop' : 'INSAC'}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="authorName">Presenting Author Name *</label>
                  <input
                    id="authorName"
                    name="authorName"
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={handleInputChange}
                    placeholder="Full name of presenting author"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">Contact / Corresponding Email *</label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="author@institution.edu"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="coAuthors">Co-Author(s) Details</label>
                <input
                  id="coAuthors"
                  name="coAuthors"
                  type="text"
                  value={formData.coAuthors}
                  onChange={handleInputChange}
                  placeholder="e.g. Author 2 (Dept, Inst), Author 3 (Dept, Inst)"
                  className="form-control"
                />
                <div className="form-hint">List all co-authors with affiliations separated by commas.</div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="abs-institution">Institution / Organization *</label>
                  <input
                    id="abs-institution"
                    name="institution"
                    type="text"
                    required
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. A.P.J. Abdul Kalam WIT, BARC, IIT"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="abs-department">Department</label>
                  <input
                    id="abs-department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science & Engineering"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="keywords">Keywords *</label>
                <input
                  id="keywords"
                  name="keywords"
                  type="text"
                  required
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g. Nuclear Science, AI Digital Twins, Reactor Safety, High Performance Computing"
                  className="form-control"
                />
                <div className="form-hint">At least four (4) keywords as required by the official template.</div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="abstractText">Abstract Summary Text *</label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    Max {wordLimit} words
                  </span>
                </div>
                <textarea
                  id="abstractText"
                  name="abstractText"
                  required
                  rows={6}
                  value={formData.abstractText}
                  onChange={handleInputChange}
                  placeholder="Paste or write the structured summary of your research (Introduction, Methods, Results, Conclusions)..."
                  className="form-control"
                />
                {/* Live Word Counter */}
                <WordCounter currentCount={wordCount} maxLimit={wordLimit} />
              </div>

              <div className="form-group" style={{ backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: '8px', border: '1px dashed var(--slate-300)' }}>
                <label className="form-label" htmlFor="abstractFile">
                  Upload Extended Abstract Document (.docx, .doc, .pdf)
                </label>
                <p style={{ fontSize: '0.825rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                  Please format your extended abstract using the official template (maximum 2 pages including figures and tables).
                </p>
                <input
                  id="abstractFile"
                  type="file"
                  accept=".docx,.doc,.pdf"
                  onChange={handleFileChange}
                  className="form-control"
                  style={{ backgroundColor: 'var(--white)' }}
                />
                {file && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                    Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !user || wordCount > wordLimit}
                className="btn btn-teal btn-lg"
                style={{ width: '100%', marginTop: '1rem' }}
                id="submit-abstract-btn"
              >
                {loading ? 'Submitting Abstract...' : 'Submit Extended Abstract'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AbstractSubmissionPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading submission form...</div>}>
      <AbstractSubmissionContent />
    </Suspense>
  );
}

