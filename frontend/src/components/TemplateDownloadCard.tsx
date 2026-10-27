'use client';

import React from 'react';
import { api } from '../lib/api';

interface TemplateDownloadCardProps {
  compact?: boolean;
}

export default function TemplateDownloadCard({ compact = false }: TemplateDownloadCardProps) {
  const downloadUrl = api.getTemplateDownloadUrl();

  if (compact) {
    return (
      <a
        href={downloadUrl}
        download="Template for extended abstract (INSAC-2026).docx"
        className="btn btn-primary btn-sm"
        id="download-template-compact-btn"
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Abstract Template (.docx)
      </a>
    );
  }

  return (
    <div className="card" style={{
      borderLeft: '4px solid #0f294a',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderLeftWidth: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '4px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f294a',
          flexShrink: 0,
        }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div style={{ flex: '1', minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#0f294a',
              backgroundColor: '#f1f5f9',
              padding: '0.15rem 0.45rem',
              borderRadius: '2px',
              border: '1px solid #cbd5e1',
              textTransform: 'uppercase',
            }}>
              Official Template
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Microsoft Word (.docx) • 1.79 MB
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', color: '#0f294a', marginBottom: '0.35rem', fontWeight: 700 }}>
            Official INSAC 2026 Extended Abstract Template
          </h3>

          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.9rem', lineHeight: '1.5' }}>
            All contributory paper abstracts must strictly follow this official template. Maximum <strong>2 pages</strong> including figures, tables, and references (Title: 14pt Capital Times New Roman, Body: 11pt, 1.5 line spacing).
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={downloadUrl}
              download="Template for extended abstract (INSAC-2026).docx"
              className="btn btn-primary"
              id="download-official-template-btn"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Abstract Template (.docx)
            </a>

            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Standard Word (.docx) format for INSAC contributory papers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
