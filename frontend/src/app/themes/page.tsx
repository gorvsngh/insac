'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { EventTheme } from '../../types';

export default function ThemesPage() {
  const [themes, setThemes] = useState<EventTheme[]>([]);
  const [filter, setFilter] = useState<'all' | 'workshop' | 'conference'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getPublicSettings()
      .then(res => setThemes(res.settings?.themes || []))
      .catch(err => console.error('Error fetching themes:', err));
  }, []);

  const filteredThemes = themes.filter(theme => {
    const matchesCategory = filter === 'all' || theme.category === filter;
    const matchesSearch = theme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theme.description && theme.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
            <span>Themes &amp; Topics</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.35rem', fontWeight: 700 }}>
            Technical Themes &amp; Research Topics
          </h1>
          <p style={{ color: '#cbd5e1', maxWidth: '750px', fontSize: '0.95rem' }}>
            Explore interdisciplinary research themes covering advanced computing applications, nuclear engineering, radiation physics, and healthcare.
          </p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          {/* Controls: Search & Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilter('all')}
                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Themes ({themes.length})
              </button>
              <button
                onClick={() => setFilter('workshop')}
                className={`btn btn-sm ${filter === 'workshop' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Workshop Themes ({themes.filter(t => t.category === 'workshop').length})
              </button>
              <button
                onClick={() => setFilter('conference')}
                className={`btn btn-sm ${filter === 'conference' ? 'btn-primary' : 'btn-secondary'}`}
              >
                INSAC Topics ({themes.filter(t => t.category === 'conference').length})
              </button>
            </div>

            <div style={{ minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search topics by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Theme Cards Grid */}
          <div className="grid-2">
            {filteredThemes.map((theme, index) => (
              <div
                key={index}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: theme.category === 'workshop' ? '3px solid #0f294a' : '3px solid #b45309',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: theme.category === 'workshop' ? '#0d5f57' : '#92400e',
                      backgroundColor: theme.category === 'workshop' ? '#f0fdf4' : '#fffbeb',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px',
                      border: '1px solid #e2e8f0',
                      textTransform: 'uppercase',
                    }}>
                      {theme.category === 'workshop' ? 'National Workshop Theme' : 'INSAC Conference Topic'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      #{index + 1}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', color: '#0f294a', lineHeight: 1.4, marginBottom: '0.4rem', fontWeight: 700 }}>
                    {theme.title}
                  </h3>

                  {theme.description && (
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                      {theme.description}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Contributory Abstract</span>
                  <Link
                    href={`/abstract-submission?theme=${encodeURIComponent(theme.title)}`}
                    className="btn btn-sm btn-outline-navy"
                  >
                    Submit Abstract →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredThemes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
              No themes found matching your search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
