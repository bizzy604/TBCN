import type { Metadata } from 'next';
import CertificatesClient from './CertificatesClient';

export const metadata: Metadata = {
  title: 'Certificates | Brand Coach Network',
  description: 'View and verify your earned certificates.',
};

export default function CertificatesPage() {
  return <CertificatesClient />;
}
