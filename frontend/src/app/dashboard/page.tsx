'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Registration, Payment, Abstract, EventSettings } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import TemplateDownloadCard from '../../components/TemplateDownloadCard';

export default function ParticipantDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [abstractData, setAbstractData] = useState<Abstract | null>(null);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment Form state (UPI only: UPI ID & UTR)
  const [payerUpiId, setPayerUpiId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(500);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Initial Load
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      Promise.all([
        api.getMyRegistration().catch(() => ({ registration: null })),
        api.getMyPayment().catch(() => ({ payment: null })),
        api.getMyAbstract().catch(() => ({ abstract: null })),
        api.getPublicSettings().catch(() => ({ settings: null as unknown as EventSettings })),
      ]).then(([regRes, payRes, absRes, setRes]) => {
        if (regRes.registration) {
          setRegistration(regRes.registration);
          setAmountPaid(regRes.registration.feeAmount || 500);
        }
        if (payRes.payment) {
          setPayment(payRes.payment);
          if (payRes.payment.payerUpiId) setPayerUpiId(payRes.payment.payerUpiId);
          if (payRes.payment.transactionId) setTransactionId(payRes.payment.transactionId);
          if (payRes.payment.amountPaid) setAmountPaid(payRes.payment.amountPaid);
        }
        if (absRes.abstract) {
          setAbstractData(absRes.abstract);
        }
        if (setRes.settings) {
          setSettings(setRes.settings);
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentSuccess('');

    if (!registration) {
      setPaymentError('No active registration found. Please complete participant registration first.');
      return;
    }

    if (!payerUpiId.trim() || !transactionId.trim()) {
      setPaymentError('Please enter both your Payer UPI ID and UPI UTR / Transaction ID.');
      return;
    }

    setPaymentSubmitting(true);

    try {
      const res = await api.submitPayment({
        registrationRef: registration.registrationRef,
        payerUpiId: payerUpiId.trim(),
        transactionId: transactionId.trim(),
        amountPaid: Number(amountPaid),
        paymentDate,
        remarks: paymentRemarks,
      });

      setPayment(res.payment);
      setPaymentSuccess('UPI payment details submitted successfully for administrative verification.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit payment details.';
      setPaymentError(message);
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--slate-500)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--slate-50)', padding: '3.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Dashboard Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--teal-600)', fontWeight: 700, textTransform: 'uppercase' }}>
              Participant Portal
            </div>
            <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)' }}>
              Welcome, {user?.fullName}
            </h1>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              {user?.institution || 'Academic Delegate'} • {user?.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <TemplateDownloadCard compact />
            {!abstractData && (
              <Link href="/abstract-submission" className="btn btn-primary btn-sm">
                + Submit Abstract
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {/* Card 1: Registration Status */}
          <div className="card" style={{ borderTop: '3px solid #0f294a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#0f294a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Registration</span>
              <StatusBadge status={registration?.status || 'pending'} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Registration Reference
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f294a', fontFamily: 'monospace', margin: '0.2rem 0 0.4rem 0' }}>
              {registration?.registrationRef || 'PENDING'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              Category: <strong style={{ textTransform: 'capitalize' }}>{registration?.category?.replace('_', ' ') || user?.participantCategory || 'Delegate'}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.2rem' }}>
              Fee Amount: <strong style={{ color: '#0f294a' }}>₹{registration?.feeAmount || 500}</strong>
            </div>
          </div>

          {/* Card 2: Payment Status */}
          <div className="card" style={{ borderTop: '3px solid #b45309' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>UPI Payment</span>
              <StatusBadge status={payment?.status || 'not_submitted'} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Fee Verification
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f294a', margin: '0.2rem 0 0.4rem 0' }}>
              {payment ? `₹${payment.amountPaid} (UPI)` : 'Not Submitted'}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569' }}>
              {payment?.status === 'verified'
                ? `Verified • UTR: ${payment.transactionId || 'Confirmed'}`
                : payment?.status === 'under_verification' || payment?.status === 'submitted'
                ? `Under verification • UTR: ${payment.transactionId || 'Pending'}`
                : payment?.status === 'rejected'
                ? `Rejected: ${payment.rejectionReason || 'Please resubmit UPI details'}`
                : 'Submit UPI ID & UTR below.'}
            </div>
          </div>

          {/* Card 3: Abstract Status */}
          <div className="card" style={{ borderTop: '3px solid #0d5f57' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#0d5f57', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Extended Abstract</span>
              <StatusBadge status={abstractData?.status || 'not_submitted'} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Abstract Status
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f294a', fontFamily: 'monospace', margin: '0.2rem 0 0.4rem 0' }}>
              {abstractData?.abstractRef || 'NO ABSTRACT'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              {abstractData ? (
                <span title={abstractData.title} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {abstractData.title}
                </span>
              ) : (
                <Link href="/abstract-submission" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>
                  Submit extended abstract →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Sections Tabs / Split */}
        <div className="grid-2">
          {/* Left Column: Payment Reporting Form */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '1rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
              Report Fee Payment Details (UPI)
            </h2>

            <div className="alert alert-info" style={{ fontSize: '0.825rem', padding: '0.75rem 1rem' }}>
              <div>
                <strong>Notice:</strong> Complete your registration fee payment via UPI as instructed by Dr. A.P.J. Abdul Kalam WIT / LNMU. Enter your <strong>Payer UPI ID</strong> and <strong>12-digit UPI UTR</strong> below.
              </div>
            </div>

            {paymentSuccess && <div className="alert alert-success">{paymentSuccess}</div>}
            {paymentError && <div className="alert alert-danger">{paymentError}</div>}

            {payment && payment.status === 'verified' ? (
              <div style={{ padding: '1.5rem', backgroundColor: 'var(--success-50)', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ color: 'var(--success-500)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                  ✓ Fee Payment Verified
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: '1.7' }}>
                  <div><strong>Amount Verified:</strong> ₹{payment.amountPaid}</div>
                  <div><strong>Payer UPI ID:</strong> {payment.payerUpiId || '—'}</div>
                  <div><strong>UPI UTR / Transaction ID:</strong> <code style={{ fontWeight: 700 }}>{payment.transactionId}</code></div>
                  <div style={{ marginTop: '0.75rem', color: 'var(--success-600)', fontWeight: 600 }}>
                    Your registration for INSAC 2026 is officially confirmed!
                  </div>
                </div>
              </div>
            ) : payment && (payment.status === 'submitted' || payment.status === 'under_verification') ? (
              <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <div style={{ color: 'var(--teal-700)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ⏳ UPI Payment Details Under Verification
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: '1.6' }}>
                  <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', margin: '0.5rem 0' }}>
                    <div><strong>Amount Paid:</strong> ₹{payment.amountPaid}</div>
                    <div><strong>Payer UPI ID:</strong> {payment.payerUpiId}</div>
                    <div><strong>UPI UTR / Ref No:</strong> <code style={{ fontWeight: 700 }}>{payment.transactionId}</code></div>
                    <div><strong>Payment Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}</div>
                    {payment.remarks && <div><strong>Remarks:</strong> {payment.remarks}</div>}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', margin: 0 }}>
                    College administration is verifying your transaction. Need to correct details? Update the form below.
                  </p>
                </div>
              </div>
            ) : null}

            {(!payment || payment.status === 'rejected' || payment.status === 'submitted' || payment.status === 'under_verification') && (
              <form onSubmit={handlePaymentSubmit} style={{ marginTop: payment ? '1.5rem' : '0' }}>
                {payment && payment.status === 'rejected' && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <strong>Payment Rejected:</strong> {payment.rejectionReason || 'Invalid UTR or payment details. Please check and re-submit your correct UPI details.'}
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Registration Ref</label>
                    <input
                      type="text"
                      disabled
                      value={registration?.registrationRef || 'PENDING'}
                      className="form-control"
                      style={{ backgroundColor: 'var(--slate-100)', fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fee Amount (₹)</label>
                    <input
                      type="text"
                      disabled
                      value={`₹${registration?.feeAmount || amountPaid}`}
                      className="form-control"
                      style={{ backgroundColor: 'var(--slate-100)', fontWeight: 700, color: 'var(--teal-600)' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="payer-upi-id">Payer UPI ID *</label>
                  <input
                    id="payer-upi-id"
                    type="text"
                    required
                    value={payerUpiId}
                    onChange={(e) => setPayerUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@upi"
                    className="form-control"
                  />
                  <small style={{ color: 'var(--slate-500)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                    The UPI ID (VPA) from which the fee transfer was made
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="upi-utr">UPI UTR / Transaction ID *</label>
                  <input
                    id="upi-utr"
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 12-digit UPI UTR (e.g. 431209876543)"
                    className="form-control"
                  />
                  <small style={{ color: 'var(--slate-500)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                    Unique 12-digit reference number from your GPay, PhonePe, Paytm, or banking receipt
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pay-date">Payment Date *</label>
                  <input
                    id="pay-date"
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pay-remarks">Remarks (Optional)</label>
                  <input
                    id="pay-remarks"
                    type="text"
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                    placeholder="Any notes about the payment"
                    className="form-control"
                  />
                </div>

                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="btn btn-teal"
                  style={{ width: '100%' }}
                  id="submit-payment-report-btn"
                >
                  {paymentSubmitting ? 'Submitting Details...' : payment ? 'Update UPI Payment Details' : 'Submit UPI Payment Report'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Abstract & Announcements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Abstract Details Card */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '1rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                Your Extended Abstract
              </h2>

              {abstractData ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--teal-600)' }}>
                      Ref: {abstractData.abstractRef}
                    </span>
                    <StatusBadge status={abstractData.status} />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                    {abstractData.title}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                    Theme: <strong>{abstractData.researchTheme}</strong>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: '1.6', marginBottom: '1rem', backgroundColor: 'var(--slate-50)', padding: '0.75rem', borderRadius: '6px' }}>
                    {abstractData.abstractText}
                  </p>

                  {abstractData.attachmentOriginalName && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                      📎 Attachment: <strong>{abstractData.attachmentOriginalName}</strong>
                    </div>
                  )}

                  {abstractData.revisionComments && (
                    <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>
                      <strong>Reviewer Revision Request:</strong> {abstractData.revisionComments}
                    </div>
                  )}

                  <Link href="/abstract-submission" className="btn btn-outline-teal btn-sm">
                    Edit / Resubmit Abstract
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📑</div>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    You have not submitted an extended abstract yet.
                  </p>
                  <Link href="/abstract-submission" className="btn btn-teal btn-sm">
                    Submit Abstract Now →
                  </Link>
                </div>
              )}
            </div>

            {/* Template Card */}
            <div className="card" style={{ borderLeft: '4px solid var(--gold-500)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Official Abstract Template
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Need the official Word template for preparing contributory papers? Download the verified 2-page template here:
              </p>
              <a
                href={api.getTemplateDownloadUrl()}
                download="Template for extended abstract (INSAC-2026).docx"
                className="btn btn-outline-navy btn-sm"
              >
                📥 Download Template (.docx)
              </a>
            </div>

            {/* Announcements Card */}
            {settings?.announcements && settings.announcements.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.05rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                  Announcements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {settings.announcements.map((a, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)' }}>{a.title}</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>{a.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
