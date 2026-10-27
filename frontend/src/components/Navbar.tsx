'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header style={{ width: '100%', zIndex: 1000, position: 'relative' }}>
      {/* 1. Top Institutional Utility Strip */}
      <div style={{
        backgroundColor: '#071529',
        color: '#cbd5e1',
        fontSize: '0.785rem',
        padding: '0.35rem 0',
        borderBottom: '1px solid #1e293b',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Dr. A.P.J. Abdul Kalam Women&apos;s Institute of Technology (WIT), LNMU Darbhanga</span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#fcd34d' }}>In Collaboration with Indian Nuclear Society (INS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/information#venue" style={{ color: '#cbd5e1' }}>Venue &amp; Travel</Link>
            <span style={{ color: '#64748b' }}>|</span>
            <Link href="/information#contact" style={{ color: '#cbd5e1' }}>Helpdesk</Link>
            <span style={{ color: '#64748b' }}>|</span>
            {user ? (
              <span style={{ color: '#67e8f9' }}>
                Signed in as: <strong>{user.fullName}</strong>
              </span>
            ) : (
              <Link href="/login" style={{ color: '#fcd34d', fontWeight: 600 }}>Participant Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Institutional Header / Masthead */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #0f294a',
        padding: '0.9rem 0',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Left Emblem: INS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#0f294a',
              border: '2px solid #b45309',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fcd34d' }}>INS</span>
              <span style={{ fontSize: '0.45rem', textTransform: 'uppercase', color: '#cbd5e1' }}>Est. 1988</span>
            </div>
          </div>

          {/* Center Titles */}
          <div style={{ textAlign: 'center', flex: 1, padding: '0 0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
              Joint National Academic Event
            </div>
            <h1 style={{
              fontSize: 'clamp(1.15rem, 2.5vw, 1.55rem)',
              fontWeight: 800,
              color: '#0f294a',
              lineHeight: 1.2,
              margin: '0 0 0.25rem 0',
            }}>
              INDIAN NUCLEAR SOCIETY ANNUAL CONFERENCE (INSAC-2026)
            </h1>
            <div style={{
              fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
              fontWeight: 600,
              color: '#334155',
              lineHeight: 1.3,
            }}>
              National Workshop on &ldquo;Advanced Computing and Nuclear Science: Emerging Technologies, Interdisciplinary Applications and Research Opportunities&rdquo;
            </div>
            <div style={{ fontSize: '0.785rem', color: '#64748b', marginTop: '0.3rem' }}>
              Organized by <strong>Dr. A.P.J. Abdul Kalam Women&apos;s Institute of Technology (WIT)</strong>, Lalit Narayan Mithila University (LNMU), Darbhanga, Bihar
            </div>
          </div>

          {/* Right Emblem: WIT / LNMU */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#831843',
              border: '2px solid #b45309',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fcd34d' }}>WIT</span>
              <span style={{ fontSize: '0.45rem', textTransform: 'uppercase', color: '#fce7f3' }}>LNMU</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Solid Academic Navigation Bar */}
      <nav style={{
        backgroundColor: '#0f294a',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Desktop Nav Items */}
          <div style={{ display: 'flex', alignItems: 'center' }} className="desktop-nav">
            <Link
              href="/"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isActive('/') ? '#fcd34d' : '#ffffff',
                backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setAboutDropdownOpen(true)}
              onMouseLeave={() => setAboutDropdownOpen(false)}
            >
              <Link
                href="/about"
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: pathname.startsWith('/about') ? '#fcd34d' : '#ffffff',
                  backgroundColor: pathname.startsWith('/about') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                About Us ▾
              </Link>

              {aboutDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '260px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
                  zIndex: 200,
                }}>
                  <Link
                    href="/about#joint-event"
                    style={{ display: 'block', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    The Joint Academic Event
                  </Link>
                  <Link
                    href="/about#insac"
                    style={{ display: 'block', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    Indian Nuclear Society (INS)
                  </Link>
                  <Link
                    href="/about#wit"
                    style={{ display: 'block', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    Dr. A.P.J. Abdul Kalam WIT
                  </Link>
                  <Link
                    href="/about#lnmu"
                    style={{ display: 'block', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#1e293b' }}
                    onClick={() => setAboutDropdownOpen(false)}
                  >
                    LNMU Darbhanga
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/committees"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isActive('/committees') ? '#fcd34d' : '#ffffff',
                backgroundColor: isActive('/committees') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Committees
            </Link>

            <Link
              href="/themes"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isActive('/themes') ? '#fcd34d' : '#ffffff',
                backgroundColor: isActive('/themes') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Themes &amp; Topics
            </Link>

            <Link
              href="/information"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isActive('/information') ? '#fcd34d' : '#ffffff',
                backgroundColor: isActive('/information') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Registration &amp; Fee
            </Link>

            <Link
              href="/abstract-submission"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: isActive('/abstract-submission') ? '#fcd34d' : '#ffffff',
                backgroundColor: isActive('/abstract-submission') ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Abstract Submission
            </Link>
          </div>

          {/* Right Action / Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    backgroundColor: '#14325a',
                    color: '#ffffff',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    borderRadius: '3px',
                    border: '1px solid #334155',
                  }}
                  id="nav-dashboard-btn"
                >
                  My Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    style={{
                      backgroundColor: '#b45309',
                      color: '#ffffff',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      borderRadius: '3px',
                    }}
                    id="nav-admin-btn"
                  >
                    Admin Control
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#cbd5e1',
                    border: 'none',
                    padding: '0.45rem 0.6rem',
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                  }}
                  id="nav-logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    color: '#ffffff',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                  id="nav-login-btn"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  style={{
                    backgroundColor: '#b45309',
                    color: '#ffffff',
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: '3px',
                    letterSpacing: '0.02em',
                  }}
                  id="nav-register-btn"
                >
                  Register Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Toggle Navigation"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* 4. Official Academic Announcement Ticker Bar */}
      <div className="announcement-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="announcement-badge">Notice</span>
          <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span>★ Official Extended Abstract Template (.docx) is now available for download.</span>
            <span style={{ margin: '0 0.6rem', color: '#cbd5e1' }}>|</span>
            <span>★ Proposed Conference Dates: 7–11 December 2026 (Subject to approval).</span>
            <span style={{ margin: '0 0.6rem', color: '#cbd5e1' }}>|</span>
            <span>★ Registration Fee: Student ₹500, Research Scholar ₹750, Faculty ₹1,000 (Payment via UPI).</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #0f294a',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.4rem 0', fontWeight: 600, color: '#0f294a' }}>Home</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.4rem 0', fontWeight: 600, color: '#0f294a' }}>About Joint Event</Link>
          <Link href="/committees" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.4rem 0', fontWeight: 600, color: '#0f294a' }}>Committees</Link>
          <Link href="/themes" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.4rem 0', fontWeight: 600, color: '#0f294a' }}>Themes &amp; Topics</Link>
          <Link href="/information" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.4rem 0', fontWeight: 600, color: '#0f294a' }}>Registration &amp; Fee Guidelines</Link>
          <Link href="/abstract-submission" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.4rem 0', fontWeight: 600, color: '#0f294a' }}>Abstract Submission</Link>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm">My Dashboard</Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="btn btn-gold btn-sm">Admin Control Panel</Link>
              )}
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="btn btn-secondary btn-sm">Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline-navy btn-sm" style={{ flex: 1 }}>Login</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-gold btn-sm" style={{ flex: 1 }}>Register</Link>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 960px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
        @media (min-width: 961px) {
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
