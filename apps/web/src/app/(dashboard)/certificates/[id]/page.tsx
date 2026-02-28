import type { Metadata } from 'next';
import CertificateDetailClient from './CertificateDetailClient';

export const metadata: Metadata = {
  title: 'Certificate Detail | Brand Coach Network',
  description: 'View your certificate details and verification data.',
};

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CertificateDetailClient id={id} />;
}
