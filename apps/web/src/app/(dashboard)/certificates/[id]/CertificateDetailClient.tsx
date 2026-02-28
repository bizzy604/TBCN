'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useCertificate } from '@/hooks/use-certificates';

export default function CertificateDetailClient({ id }: { id: string }) {
  const { data: certificate, isLoading, error } = useCertificate(id);

  const handleDownload = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold">Certificate not found</h2>
        <p className="mt-2 text-muted-foreground">
          The certificate may not exist or you may not have permission to view it.
        </p>
        <Link
          href="/certificates"
          className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            The Brand Coach Network
          </p>
          <h1 className="mt-2 text-3xl font-bold">Certificate of Completion</h1>
          <p className="mt-2 text-muted-foreground">
            This certifies that the learner completed the program below.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">Awarded To</p>
          <p className="mt-1 text-2xl font-semibold">{certificate.recipientName}</p>

          <p className="mt-6 text-sm text-muted-foreground">Program</p>
          <p className="mt-1 text-xl font-medium">{certificate.programTitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Certificate Number</p>
            <p className="mt-1 font-mono text-sm">{certificate.certificateNumber}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Verification Code</p>
            <p className="mt-1 font-mono text-sm">{certificate.verificationCode}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Issued Date</p>
            <p className="mt-1 text-sm">
              {new Date(certificate.issuedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 text-sm">
              {certificate.isRevoked ? 'Revoked' : 'Valid'}
            </p>
          </div>
        </div>

        {certificate.completionDate && (
          <p className="text-center text-sm text-muted-foreground">
            Completion date: {new Date(certificate.completionDate).toLocaleDateString()}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/certificates"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Back
          </Link>
          {certificate.downloadUrl ? (
            <a
              href={certificate.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Download
            </a>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Download
            </button>
          )}
          <Link
            href={`/enrollments`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            My Learning
          </Link>
        </div>
      </div>
    </Card>
  );
}
