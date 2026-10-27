'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { CommitteeMember } from '../../types';

export default function CommitteesPage() {
  const [committees, setCommittees] = useState<CommitteeMember[]>([]);

  useEffect(() => {
    api.getPublicSettings()
      .then(res => setCommittees(res.settings?.committees || []))
      .catch(err => console.error('Error fetching committees:', err));
  }, []);

  const officeBearers = committees.filter(c => c.group === 'office_bearers');
  const advisoryPhysics = committees.filter(c => c.group === 'advisory_physics');
  const advisoryChemistry = committees.filter(c => c.group === 'advisory_chemistry');
  const advisoryZoology = committees.filter(c => c.group === 'advisory_zoology');
  const advisoryBotany = committees.filter(c => c.group === 'advisory_botany');
  const advisoryWIT = committees.filter(c => c.group === 'advisory_wit');
  const organizing = committees.filter(c => c.group === 'organizing');

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
            <span>Committees</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.35rem', fontWeight: 700 }}>
            Conference &amp; Workshop Committees
          </h1>
          <p style={{ color: '#cbd5e1', maxWidth: '750px', fontSize: '0.95rem' }}>
            Distinguished academicians, office bearers, advisory panels, and organizing faculty governing INSAC 2026.
          </p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* 1. Office Bearers */}
            <div>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
                <span className="section-tag">Leadership</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>Office Bearers &amp; Patrons</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {officeBearers.map((m, idx) => (
                  <div key={idx} className="card" style={{ borderTop: '3px solid #b45309', textAlign: 'center', padding: '1.25rem 1rem' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#b45309',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.35rem',
                    }}>
                      {m.role || m.designation}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f294a', fontWeight: 700, marginBottom: '0.2rem' }}>
                      {m.name}
                    </h3>
                    {m.institution && (
                      <div style={{ fontSize: '0.785rem', color: '#64748b' }}>
                        {m.institution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Advisory Committee */}
            <div>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
                <span className="section-tag">Panels</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>Advisory Committee by Department</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Physics */}
                <div className="card">
                  <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', fontWeight: 700 }}>
                    Department of Physics
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {advisoryPhysics.map((m, idx) => (
                      <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, color: '#0f294a', fontSize: '0.9rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.785rem', color: '#64748b' }}>Physics</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chemistry */}
                <div className="card">
                  <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', fontWeight: 700 }}>
                    Department of Chemistry
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {advisoryChemistry.map((m, idx) => (
                      <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, color: '#0f294a', fontSize: '0.9rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.785rem', color: '#64748b' }}>Chemistry</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zoology & Botany */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div className="card">
                    <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', fontWeight: 700 }}>
                      Department of Zoology
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {advisoryZoology.map((m, idx) => (
                        <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 600, color: '#0f294a', fontSize: '0.9rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.785rem', color: '#64748b' }}>Zoology</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', fontWeight: 700 }}>
                      Department of Botany
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {advisoryBotany.map((m, idx) => (
                        <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 600, color: '#0f294a', fontSize: '0.9rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.785rem', color: '#64748b' }}>Botany</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WIT Advisory */}
                <div className="card">
                  <h3 style={{ fontSize: '1.05rem', color: '#0f294a', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', fontWeight: 700 }}>
                    Dr. A.P.J. Abdul Kalam Women&apos;s Institute of Technology (WIT)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {advisoryWIT.map((m, idx) => (
                      <div key={idx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, color: '#0f294a', fontSize: '0.9rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.785rem', color: '#64748b' }}>WIT Darbhanga</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Organizing Committee */}
            <div>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1.25rem' }}>
                <span className="section-tag">Coordination</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>Organizing Committee</h2>
              </div>
              <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {organizing.map((m, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 0.85rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', borderLeft: '3px solid #0f294a' }}>
                      <div style={{ fontWeight: 600, color: '#0f294a', fontSize: '0.9rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.785rem', color: '#64748b' }}>Organizing Committee</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
