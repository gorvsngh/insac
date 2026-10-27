'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { EventSettings } from '../../types';
import TemplateDownloadCard from '../../components/TemplateDownloadCard';

export default function InformationPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null);

  useEffect(() => {
    api.getPublicSettings()
      .then(res => setSettings(res.settings))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

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
            <span>General Information</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.35rem', fontWeight: 700 }}>
            General Information &amp; Guidelines
          </h1>
          <p style={{ color: '#cbd5e1', maxWidth: '750px', fontSize: '0.95rem' }}>
            Eligibility criteria, registration procedures, fee structures, UPI payment instructions, and extended abstract guidelines.
          </p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* 1. Registration Fees & Categories */}
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', color: '#0f294a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', fontWeight: 700 }}>
                1. Registration Categories &amp; Fee Structure
              </h2>
              <div className="table-responsive" style={{ marginBottom: '1.25rem' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Participant Category</th>
                      <th>Eligibility</th>
                      <th>Registration Fee</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Students</strong></td>
                      <td>Undergraduate &amp; Postgraduate Students with valid college ID</td>
                      <td><span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f294a' }}>₹500</span></td>
                      <td>
                        <Link href="/register?category=student" className="btn btn-sm btn-primary">
                          Register
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Research Scholars</strong></td>
                      <td>Ph.D. candidates and Postdoctoral fellows</td>
                      <td><span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f294a' }}>₹750</span></td>
                      <td>
                        <Link href="/register?category=research_scholar" className="btn btn-sm btn-primary">
                          Register
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Faculty Members</strong></td>
                      <td>University faculty, scientists, and institutional delegates</td>
                      <td><span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f294a' }}>₹1,000</span></td>
                      <td>
                        <Link href="/register?category=faculty" className="btn btn-sm btn-primary">
                          Register
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Payment Reporting Instructions */}
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', color: '#0f294a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', fontWeight: 700 }}>
                2. Fee Payment Instructions &amp; Verification Workflow
              </h2>
              <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <strong>Official College Payment Notice:</strong> Official payment instructions and accounts are communicated by Dr. A.P.J. Abdul Kalam Women&apos;s Institute of Technology (WIT) / LNMU. This website does not generate online payment gateways or QR codes.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#334155', lineHeight: '1.7', fontSize: '0.9rem' }}>
                <p>
                  Participants must follow this workflow to register and verify their registration fee payment:
                </p>
                <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><strong>Create an Account:</strong> Register your participant profile on this portal to generate a unique registration reference ID (e.g., <code>REG-xxxx</code>).</li>
                  <li><strong>Complete Payment via UPI:</strong> Pay the designated registration fee through UPI (Google Pay, PhonePe, Paytm, BHIM, or Banking UPI) as directed by WIT Darbhanga / LNMU.</li>
                  <li><strong>Submit Payment Report:</strong> Navigate to your <em>Participant Dashboard</em> and submit your <strong>Payer UPI ID</strong> and <strong>12-digit UPI UTR / Transaction ID</strong>.</li>
                  <li><strong>Administrative Verification:</strong> The organizing committee verifies the UPI transaction against bank records. Upon verification, your registration status is updated to <em>Confirmed</em> in your dashboard.</li>
                </ol>
              </div>
            </div>

            {/* 3. Official Abstract Guidelines & Download */}
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', color: '#0f294a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', fontWeight: 700 }}>
                3. Extended Abstract Submission Guidelines
              </h2>
              <p style={{ color: '#334155', marginBottom: '1.25rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
                All abstract submissions must strictly adhere to the official format provided in the extended abstract template:
              </p>

              <div style={{ marginBottom: '1.75rem' }}>
                <TemplateDownloadCard />
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Guideline Element</th>
                      <th>Official Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Page Length</strong></td>
                      <td>Maximum <strong>TWO (2) pages</strong> including figures, tables, and references.</td>
                    </tr>
                    <tr>
                      <td><strong>Word Limit (Form Summary)</strong></td>
                      <td>Live word limit enforced at <strong>{settings?.abstractWordLimit || 250} words</strong> for the structured text summary.</td>
                    </tr>
                    <tr>
                      <td><strong>Paper Title</strong></td>
                      <td>ALL CAPITAL, Times New Roman, Font Size 14, Bold.</td>
                    </tr>
                    <tr>
                      <td><strong>Author Details</strong></td>
                      <td>Presenting author must be underlined. Affiliation addresses and contact emails included.</td>
                    </tr>
                    <tr>
                      <td><strong>Keywords</strong></td>
                      <td>At least four (4) keywords must be included.</td>
                    </tr>
                    <tr>
                      <td><strong>Text Formatting</strong></td>
                      <td>Times New Roman 11pt, 1.5 line spacing. Section subtitles in 12pt Bold.</td>
                    </tr>
                    <tr>
                      <td><strong>Sections</strong></td>
                      <td>Introduction (≤ 5 lines), Methods (≤ 4 lines), Results and Discussion, Conclusions (1–2 lines), References (bracketed as [1]).</td>
                    </tr>
                    <tr>
                      <td><strong>Allowed File Types</strong></td>
                      <td><code>.docx</code>, <code>.doc</code>, <code>.pdf</code> (Up to 10 MB).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Travel and Accommodation */}
            <div className="card">
              <h2 style={{ fontSize: '1.35rem', color: '#0f294a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', fontWeight: 700 }}>
                4. Travel &amp; Accommodation
              </h2>
              <div className="grid-2">
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Travel Connectivity
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {settings?.travelInfo || 'Darbhanga is connected by air via Darbhanga Airport (DHR) with direct flights from Delhi, Mumbai, Bengaluru, and Kolkata. It is also connected by express trains via Darbhanga Junction (DBG).'}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Accommodation
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {settings?.accommodation || 'Information regarding guesthouse and hotel accommodation will be announced by the local organizing committee.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
