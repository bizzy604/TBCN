'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useCertificate } from '@/hooks/use-certificates';

export default function CertificateDetailClient({ id }: { id: string }) {
  const { data: certificate, isLoading, error } = useCertificate(id);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="card h-80 animate-pulse bg-muted/55" />;
  }

  if (error || !certificate) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-2xl font-semibold">Certificate not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">You may not have access to this certificate.</p>
        <Link href="/certificates" className="btn btn-primary mt-4">
          Back to Certificates
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Certificate Viewer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Certificate of Completion</h1>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="rounded-2xl border-2 border-primary/30 bg-card p-8 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">The Brand Coach Network</p>
          <h2 className="mt-3 text-3xl font-semibold">Certificate of Completion</h2>
          <p className="mt-6 text-sm text-muted-foreground">Awarded to</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">{certificate.recipientName}</p>
          <p className="mt-6 text-sm text-muted-foreground">For successful completion of</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{certificate.programTitle}</p>
          <p className="mt-6 text-sm text-muted-foreground">Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetaCard label="Certificate Number" value={certificate.certificateNumber} mono />
          <MetaCard label="Verification Code" value={certificate.verificationCode} mono />
          <MetaCard label="Status" value={certificate.isRevoked ? 'Revoked' : 'Verified'} />
          <MetaCard label="Completion Date" value={certificate.completionDate ? new Date(certificate.completionDate).toLocaleDateString() : 'N/A'} />
        </div>

        <div className="flex flex-wrap gap-2">
          {certificate.downloadUrl ? (
            <a href={certificate.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Download PDF
            </a>
          ) : (
            <button onClick={handlePrint} className="btn btn-primary" type="button">
              Print
            </button>
          )}
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="btn btn-outline" type="button">
            Copy Verification Link
          </button>
          <Link href="/certificates" className="btn btn-outline">
            Back
          </Link>
        </div>
      </div>
    </Card>
  );
}

function MetaCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-foreground ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
