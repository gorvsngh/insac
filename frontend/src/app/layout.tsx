import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'INSAC 2026 & Advanced Computing Conference | WIT LNMU & INS',
  description: "Official portal for INSAC 2026 (Indian Nuclear Society's Annual Conference) and National Workshop on Advanced Computing and Nuclear Science, hosted by Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT), LNMU Darbhanga, in collaboration with INS.",
  keywords: [
    'INSAC 2026',
    'Indian Nuclear Society',
    'Advanced Computing and Nuclear Science',
    'WIT Darbhanga',
    'LNMU',
    'Dr. A.P.J. Abdul Kalam Women\'s Institute of Technology',
    'Nuclear Science Conference',
    'AI Digital Twins',
  ],
  authors: [{ name: 'WIT LNMU & INS' }],
  openGraph: {
    title: 'INSAC 2026 & Advanced Computing Conference',
    description: "National Workshop & Annual Conference on Advanced Computing and Nuclear Science at Dr. A.P.J. Abdul Kalam WIT, LNMU Darbhanga.",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
