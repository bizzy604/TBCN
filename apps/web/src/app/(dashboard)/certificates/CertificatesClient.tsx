'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useMyCertificates } from '@/hooks/use-certificates';

function StatusBadge({ revoked }: { revoked: boolean }) {
  return revoked ? <span className="badge-error">Revoked</span> : <span className="badge-success">Verified</span>;
}

export default function CertificatesClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyCertificates(page, 10);
  const certificates = data?.data || [];
  const meta = data?.meta;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Certificate Viewer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Your Certificates</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Download, verify, and share completion credentials.</p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="card h-20 animate-pulse bg-muted/55" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold">No certificates yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Complete a program to receive a certificate.</p>
            <Link href="/programs" className="btn btn-primary mt-4">
              Browse Programs
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {certificates.map((certificate) => (
              <article key={certificate.id} className="card-hover p-4">
                <p className="text-sm font-semibold text-foreground">{certificate.programTitle}</p>
                <p className="mt-1 text-xs font-mono text-muted-foreground">{certificate.certificateNumber}</p>
                <p className="mt-2 text-xs text-muted-foreground">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge revoked={certificate.isRevoked} />
                  <Link href={`/certificates/${certificate.id}`} className="text-sm font-semibold text-secondary hover:text-primary">
                    Open
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-border pt-4">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={!meta.hasPreviousPage} className="btn btn-sm btn-outline" type="button">
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
            <button onClick={() => setPage((prev) => prev + 1)} disabled={!meta.hasNextPage} className="btn btn-sm btn-outline" type="button">
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
