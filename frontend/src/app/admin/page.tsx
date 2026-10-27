'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { DashboardStats, Registration, Payment, Abstract, EventSettings } from '../../types';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'payments' | 'abstracts' | 'settings'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Registrations state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [regStatusFilter, setRegStatusFilter] = useState('');

  // Payments state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paySearch, setPaySearch] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('');

  // Abstracts state
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [absSearch, setAbsSearch] = useState('');
  const [absStatusFilter, setAbsStatusFilter] = useState('');

  // Settings state
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateMsg, setTemplateMsg] = useState('');

  // Review modal state
  const [reviewingItem, setReviewingItem] = useState<{
    type: 'payment' | 'abstract';
    id: string;
    currentStatus?: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [abstractDecision, setAbstractDecision] = useState<'accepted' | 'rejected' | 'revision_requested'>('accepted');
  const [modalLoading, setModalLoading] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, authLoading, router]);

  const loadData = useCallback(async () => {
    try {
      const [sRes, setRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAdminSettings(),
      ]);
      setStats(sRes.stats);
      setSettings(setRes.settings);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  // Load section-specific data
  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === 'registrations') {
      api.getAdminRegistrations({ search: regSearch, status: regStatusFilter })
        .then(res => setRegistrations(res.registrations))
        .catch(err => console.error(err));
    } else if (activeTab === 'payments') {
      api.getAdminPayments({ search: paySearch, status: payStatusFilter })
        .then(res => setPayments(res.payments))
        .catch(err => console.error(err));
    } else if (activeTab === 'abstracts') {
      api.getAdminAbstracts({ search: absSearch, status: absStatusFilter })
        .then(res => setAbstracts(res.abstracts))
        .catch(err => console.error(err));
    }
  }, [activeTab, regSearch, regStatusFilter, paySearch, payStatusFilter, absSearch, absStatusFilter, isAdmin]);

  // Actions
  const handleVerifyPayment = async (id: string) => {
    try {
      await api.verifyPayment(id);
      loadData();
      const pRes = await api.getAdminPayments({ search: paySearch, status: payStatusFilter });
      setPayments(pRes.payments);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error verifying payment');
    }
  };

  const handleRejectPaymentSubmit = async () => {
    if (!reviewingItem) return;
    setModalLoading(true);
    try {
      await api.rejectPayment(reviewingItem.id, actionReason || 'Payment details could not be verified.');
      setReviewingItem(null);
      setActionReason('');
      loadData();
      const pRes = await api.getAdminPayments({ search: paySearch, status: payStatusFilter });
      setPayments(pRes.payments);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error rejecting payment');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReviewAbstractSubmit = async () => {
    if (!reviewingItem) return;
    setModalLoading(true);
    try {
      await api.reviewAbstract(reviewingItem.id, {
        status: abstractDecision,
        reviewNotes: actionReason,
        revisionComments: abstractDecision === 'revision_requested' ? actionReason : undefined,
      });
      setReviewingItem(null);
      setActionReason('');
      loadData();
      const aRes = await api.getAdminAbstracts({ search: absSearch, status: absStatusFilter });
      setAbstracts(aRes.abstracts);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error reviewing abstract');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsSuccess('');
    setSettingsError('');

    try {
      await api.updateSettings(settings);
      setSettingsSuccess('Event settings updated successfully.');
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : 'Failed to update settings.');
    }
  };

  const handleTemplateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFile) return;
    setTemplateMsg('');

    try {
      const formData = new FormData();
      formData.append('template', templateFile);
      const res = await api.uploadTemplate(formData);
      setTemplateMsg(`Template replaced successfully: ${res.filename}`);
      setTemplateFile(null);
      loadData();
    } catch (err: unknown) {
      setTemplateMsg(err instanceof Error ? err.message : 'Failed to upload template.');
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--slate-500)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--slate-100)', minHeight: '90vh', padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-600)', fontWeight: 700, textTransform: 'uppercase' }}>
              Conference Management Control Center
            </div>
            <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)' }}>
              INSAC 2026 Admin Dashboard
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              Authenticated as Administrator • {user?.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href={api.getExportCsvUrl()}
              download="insac2026_participants.csv"
              className="btn btn-outline-navy btn-sm"
              id="export-csv-btn"
            >
              📥 Export Participants CSV
            </a>
            <Link href="/dashboard" className="btn btn-secondary btn-sm">
              Participant View
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: 'var(--white)',
          padding: '0.5rem',
          borderRadius: '10px',
          border: '1px solid var(--slate-200)',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-overview"
          >
            Statistics Overview
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`btn btn-sm ${activeTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-registrations"
          >
            Registrations ({stats?.totalRegistrations || 0})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-payments"
          >
            Fee Payments ({stats?.pendingPayments || 0} Pending)
          </button>
          <button
            onClick={() => setActiveTab('abstracts')}
            className={`btn btn-sm ${activeTab === 'abstracts' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-abstracts"
          >
            Abstracts ({stats?.submittedAbstracts || 0})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            id="tab-settings"
          >
            Event Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              <div className="card">
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Total Users</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.25rem 0' }}>{stats.totalUsers}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--teal-600)' }}>Registered Accounts</div>
              </div>

              <div className="card">
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Registrations</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.25rem 0' }}>{stats.totalRegistrations}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  {stats.studentRegistrations} Students • {stats.scholarRegistrations} Scholars • {stats.facultyRegistrations} Faculty
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Fee Payments</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.25rem 0' }}>
                  {stats.verifiedPayments}
                  <span style={{ fontSize: '1rem', color: 'var(--gold-600)', marginLeft: '0.4rem', fontWeight: 600 }}>
                    ({stats.pendingPayments} Pending)
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>Verified Submissions</div>
              </div>

              <div className="card">
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Extended Abstracts</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.25rem 0' }}>{stats.submittedAbstracts}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                  {stats.acceptedAbstracts} Accepted • {stats.pendingAbstracts} In Review • {stats.rejectedAbstracts} Rejected
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', marginBottom: '1rem' }}>
                  Quick Action Links
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <button onClick={() => setActiveTab('payments')} className="btn btn-outline-navy btn-sm" style={{ justifyContent: 'flex-start' }}>
                    Review Pending Payments ({stats.pendingPayments}) →
                  </button>
                  <button onClick={() => setActiveTab('abstracts')} className="btn btn-outline-navy btn-sm" style={{ justifyContent: 'flex-start' }}>
                    Review Contributory Abstracts ({stats.pendingAbstracts}) →
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="btn btn-outline-navy btn-sm" style={{ justifyContent: 'flex-start' }}>
                    Manage Event Dates, Fees &amp; Abstract Template →
                  </button>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', marginBottom: '1rem' }}>
                  Active Template Status
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1rem', lineHeight: '1.6' }}>
                  Official Word Template: <strong>Template for extended abstract (INSAC-2026).docx</strong> (1.79 MB)
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href={api.getTemplateDownloadUrl()}
                    download="Template for extended abstract (INSAC-2026).docx"
                    className="btn btn-sm btn-teal"
                  >
                    📥 Test Download Current Template
                  </a>
                  <button onClick={() => setActiveTab('settings')} className="btn btn-sm btn-secondary">
                    Replace Template File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--navy-900)' }}>
                Registered Participants
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search name, email, ref..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="form-control"
                  style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                />
                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className="form-control"
                  style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Participant</th>
                    <th>Category</th>
                    <th>Fee</th>
                    <th>Institution</th>
                    <th>Status</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => {
                    const u = typeof reg.user === 'object' ? reg.user : null;
                    return (
                      <tr key={reg._id}>
                        <td><strong>{reg.registrationRef}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u?.fullName || 'N/A'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{u?.email}</div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{reg.category.replace('_', ' ')}</td>
                        <td><strong>₹{reg.feeAmount}</strong></td>
                        <td>{reg.institution || u?.institution || '—'}</td>
                        <td><StatusBadge status={reg.status} /></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                        No registrations found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--navy-900)' }}>
                Fee Payment Reports
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search ref, UPI ID, UTR..."
                  value={paySearch}
                  onChange={(e) => setPaySearch(e.target.value)}
                  className="form-control"
                  style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                />
                <select
                  value={payStatusFilter}
                  onChange={(e) => setPayStatusFilter(e.target.value)}
                  className="form-control"
                  style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_verification">Under Verification</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Registration Ref</th>
                    <th>Participant</th>
                    <th>Amount</th>
                    <th>Payer UPI ID</th>
                    <th>UPI UTR / Trans ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => {
                    const u = typeof pay.user === 'object' ? pay.user : null;
                    return (
                      <tr key={pay._id}>
                        <td><strong>{pay.registrationRef}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u?.fullName || 'N/A'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{u?.email}</div>
                        </td>
                        <td><strong style={{ color: 'var(--teal-600)' }}>₹{pay.amountPaid}</strong></td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{pay.payerUpiId || '—'}</span>
                        </td>
                        <td>
                          <code style={{ fontSize: '0.875rem', fontWeight: 700, backgroundColor: 'var(--slate-100)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                            {pay.transactionId || '—'}
                          </code>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {new Date(pay.paymentDate).toLocaleDateString()}
                        </td>
                        <td><StatusBadge status={pay.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {pay.status !== 'verified' && (
                              <button
                                onClick={() => handleVerifyPayment(pay._id)}
                                className="btn btn-sm btn-teal"
                                title="Verify this payment"
                              >
                                ✓ Verify
                              </button>
                            )}
                            {pay.status !== 'rejected' && (
                              <button
                                onClick={() => setReviewingItem({ type: 'payment', id: pay._id })}
                                className="btn btn-sm btn-danger"
                                title="Reject payment with reason"
                              >
                                ✕ Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                        No payment submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ABSTRACTS */}
        {activeTab === 'abstracts' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--navy-900)' }}>
                Contributory Extended Abstracts
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search title, author, ref..."
                  value={absSearch}
                  onChange={(e) => setAbsSearch(e.target.value)}
                  className="form-control"
                  style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                />
                <select
                  value={absStatusFilter}
                  onChange={(e) => setAbsStatusFilter(e.target.value)}
                  className="form-control"
                  style={{ width: '150px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="revision_requested">Revision Requested</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Paper Title &amp; Theme</th>
                    <th>Author &amp; Affiliation</th>
                    <th>Word Count</th>
                    <th>Attachment</th>
                    <th>Status</th>
                    <th>Review Action</th>
                  </tr>
                </thead>
                <tbody>
                  {abstracts.map((abs) => (
                    <tr key={abs._id}>
                      <td><strong>{abs.abstractRef}</strong></td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{abs.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--teal-600)', marginTop: '0.2rem' }}>{abs.researchTheme}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{abs.authorName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{abs.institution}</div>
                      </td>
                      <td>{abs.wordCount} words</td>
                      <td>
                        {abs.attachmentOriginalName ? (
                          <a
                            href={api.getAbstractAttachmentUrl(abs._id)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-teal"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          >
                            📎 {abs.attachmentOriginalName}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td><StatusBadge status={abs.status} /></td>
                      <td>
                        <button
                          onClick={() => setReviewingItem({ type: 'abstract', id: abs._id, currentStatus: abs.status })}
                          className="btn btn-sm btn-primary"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {abstracts.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                        No abstracts submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {settingsSuccess && <div className="alert alert-success">{settingsSuccess}</div>}
            {settingsError && <div className="alert alert-danger">{settingsError}</div>}

            {/* Template Replacement Box */}
            <div className="card" style={{ borderLeft: '4px solid var(--gold-500)' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                Abstract Template File Management
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                Current template: <strong>{settings.abstractTemplateName || 'Template for extended abstract (INSAC-2026).docx'}</strong>.
                You can replace this file at any time without changing application code. The previous file is safely backed up automatically.
              </p>

              {templateMsg && <div className="alert alert-info">{templateMsg}</div>}

              <form onSubmit={handleTemplateUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept=".docx,.doc,.pdf,.odt"
                  required
                  onChange={(e) => setTemplateFile(e.target.files ? e.target.files[0] : null)}
                  className="form-control"
                  style={{ width: '320px' }}
                />
                <button type="submit" className="btn btn-teal btn-sm" id="upload-new-template-btn">
                  Upload &amp; Replace Template
                </button>
              </form>
            </div>

            {/* General Settings Form */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                Event Content &amp; Rules Settings
              </h2>

              <form onSubmit={handleSettingsSave}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Start Date</label>
                    <input
                      type="text"
                      value={settings.eventStartDate}
                      onChange={(e) => setSettings({ ...settings, eventStartDate: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event End Date</label>
                    <input
                      type="text"
                      value={settings.eventEndDate}
                      onChange={(e) => setSettings({ ...settings, eventEndDate: e.target.value })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Dates Status Note</label>
                    <input
                      type="text"
                      value={settings.datesNote}
                      onChange={(e) => setSettings({ ...settings, datesNote: e.target.value })}
                      className="form-control"
                      placeholder="e.g. Subject to approval"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Abstract Word Limit</label>
                    <input
                      type="number"
                      value={settings.abstractWordLimit}
                      onChange={(e) => setSettings({ ...settings, abstractWordLimit: Number(e.target.value) })}
                      className="form-control"
                    />
                    <div className="form-hint">Live limit enforced on both frontend counter and backend validator.</div>
                  </div>
                </div>

                <div className="grid-3" style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Student Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.fees.student}
                      onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, student: Number(e.target.value) } })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Scholar Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.fees.research_scholar}
                      onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, research_scholar: Number(e.target.value) } })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Faculty Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.fees.faculty}
                      onChange={(e) => setSettings({ ...settings, fees: { ...settings.fees, faculty: Number(e.target.value) } })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    value={settings.venue}
                    onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Instructions</label>
                  <textarea
                    rows={3}
                    value={settings.paymentInstructions}
                    onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                    className="form-control"
                  />
                </div>

                <button type="submit" className="btn btn-primary" id="save-settings-btn">
                  Save Event Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REJECTION / REVIEW MODAL */}
        {reviewingItem && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '1rem' }}>
                {reviewingItem.type === 'payment' ? 'Reject Payment Submission' : 'Review Extended Abstract'}
              </h3>

              {reviewingItem.type === 'abstract' && (
                <div className="form-group">
                  <label className="form-label">Review Decision *</label>
                  <select
                    value={abstractDecision}
                    onChange={(e) => setAbstractDecision(e.target.value as 'accepted' | 'rejected' | 'revision_requested')}
                    className="form-control"
                  >
                    <option value="accepted">Accept Abstract</option>
                    <option value="revision_requested">Request Revision</option>
                    <option value="rejected">Reject Abstract</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  {reviewingItem.type === 'payment'
                    ? 'Rejection Reason (will be shown to participant)'
                    : abstractDecision === 'revision_requested'
                    ? 'Revision Comments for Author'
                    : 'Internal Review Notes'}
                </label>
                <textarea
                  rows={4}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    reviewingItem.type === 'payment'
                      ? 'e.g. UTR number not found in college bank records. Please check and re-enter.'
                      : 'Provide constructive feedback or internal comments...'
                  }
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setReviewingItem(null)}
                  className="btn btn-secondary btn-sm"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={reviewingItem.type === 'payment' ? handleRejectPaymentSubmit : handleReviewAbstractSubmit}
                  className={`btn btn-sm ${reviewingItem.type === 'payment' || abstractDecision === 'rejected' ? 'btn-danger' : 'btn-teal'}`}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
