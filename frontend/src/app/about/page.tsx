'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { EventSettings } from '../../types';

export default function AboutPage() {
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
            <span>About</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.35rem', fontWeight: 700 }}>
            About the Joint Event &amp; Collaborating Institutions
          </h1>
          <p style={{ color: '#cbd5e1', maxWidth: '750px', fontSize: '0.95rem' }}>
            Learn about the national collaboration between Dr. A.P.J. Abdul Kalam WIT (LNMU) and the Indian Nuclear Society (INS) for INSAC 2026.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* 1. The Joint Event */}
            <div id="joint-event" style={{ scrollMarginTop: '80px' }}>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
                <span className="section-tag">Section 1</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>
                  The Joint Academic Event: INSAC 2026 &amp; National Workshop
                </h2>
              </div>
              <div className="card" style={{ borderLeft: '4px solid #0f294a', lineHeight: '1.8', color: '#334155' }}>
                <p style={{ marginBottom: '1rem' }}>
                  {settings?.aboutEvent || `The joint academic event brings together INSAC 2026 — the Indian Nuclear Society's Annual Conference — and the National Workshop on "Advanced Computing and Nuclear Science: Emerging Technologies, Interdisciplinary Applications and Research Opportunities." Hosted by Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT), a constituent unit of Lalit Narayan Mithila University (LNMU), Darbhanga, Bihar, in collaboration with the Indian Nuclear Society (INS), this landmark gathering unites leading scientists, researchers, faculty, and research scholars to explore synergies between nuclear technologies and cutting-edge computational sciences.`}
                </p>
                <p>
                  The conference serves as a multidisciplinary platform that bridges high-performance computing, artificial intelligence, digital twins, and numerical modeling with nuclear power generation, reactor design, radiation therapy, and nuclear medicine.
                </p>
              </div>
            </div>

            {/* 2. Indian Nuclear Society (INS) & INSAC */}
            <div id="insac" style={{ scrollMarginTop: '80px' }}>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
                <span className="section-tag">Section 2</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>
                  Indian Nuclear Society (INS) &amp; INSAC
                </h2>
              </div>
              <div className="card" style={{ borderLeft: '4px solid #b45309', lineHeight: '1.8', color: '#334155' }}>
                <p style={{ marginBottom: '1rem' }}>
                  {settings?.aboutINS || `The Indian Nuclear Society (INS) is the premier professional body established in 1988 dedicated to the advancement and peaceful applications of nuclear science, technology, and allied disciplines. INS organizes its flagship Annual Conference (INSAC) to convene scientific minds from DAE units including BARC, NPCIL, BHAVINI, IGCAR, VECC, and AERB, alongside university faculties and industry partners. INSAC serves as a prestigious national forum discussing reactor safety, advanced computing, nuclear medicine, radiation technology, and clean energy transition.`}
                </p>
                <p>
                  Through its national symposiums, technical seminars, and outreach, INS cultivates scientific literacy, technological self-reliance, and research collaboration in peaceful nuclear applications throughout the nation.
                </p>
              </div>
            </div>

            {/* 3. Lalit Narayan Mithila University (LNMU) */}
            <div id="lnmu" style={{ scrollMarginTop: '80px' }}>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
                <span className="section-tag">Section 3</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>
                  Lalit Narayan Mithila University (LNMU), Darbhanga
                </h2>
              </div>
              <div className="card" style={{ borderLeft: '4px solid #831843', lineHeight: '1.8', color: '#334155' }}>
                <p style={{ marginBottom: '1rem' }}>
                  {settings?.aboutLNMU || `Lalit Narayan Mithila University (LNMU), established in 1972, is an esteemed state university situated in the historic city of Darbhanga, Bihar. Named in honour of the illustrious leader and philosopher Lalit Narayan Mishra, LNMU is a major hub of higher learning and research in North Bihar, providing quality education across arts, science, commerce, law, medicine, and engineering through numerous constituent and affiliated institutions.`}
                </p>
                <p>
                  LNMU has consistently promoted advanced scientific inquiry and interdisciplinary research, providing a vibrant intellectual ecosystem for regional and national conferences.
                </p>
              </div>
            </div>

            {/* 4. Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT) */}
            <div id="wit" style={{ scrollMarginTop: '80px' }}>
              <div style={{ borderBottom: '2px solid #0f294a', paddingBottom: '0.4rem', marginBottom: '1rem' }}>
                <span className="section-tag">Section 4</span>
                <h2 style={{ fontSize: '1.45rem', color: '#0f294a', fontWeight: 700 }}>
                  Dr. A.P.J. Abdul Kalam Women&apos;s Institute of Technology (WIT)
                </h2>
              </div>
              <div className="card" style={{ borderLeft: '4px solid #0d5f57', lineHeight: '1.8', color: '#334155' }}>
                <p style={{ marginBottom: '1rem' }}>
                  {settings?.aboutWIT || `Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT), established in 2005 under the visionary patronage of Dr. A.P.J. Abdul Kalam, is a constituent engineering college of Lalit Narayan Mithila University dedicated exclusively to empowering women through quality engineering, technological education, and scientific research. WIT offers academic degrees in Computer Science & Engineering, Information Technology, and Bioinformatics, fostering technical innovation and female leadership in STEM.`}
                </p>
                <p>
                  As the host institution for INSAC 2026, WIT provides state-of-the-art conference facilities, technical session venues, and hospitality on the lush LNMU Darbhanga campus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
