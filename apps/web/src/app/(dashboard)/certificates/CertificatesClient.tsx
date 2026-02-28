'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMyCertificates } from '@/hooks/use-certificates';
import { Card } from '@/components/ui/Card';

function RevokedBadge({ revoked }: { revoked: boolean }) {
  if (revoked) {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Revoked
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Valid
    </span>
  );
}

export default function CertificatesClient() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useMyCertificates(page, limit);
  const certificates = data?.data || [];
  const meta = data?.meta;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="mt-2 text-muted-foreground">
            Your issued and verifiable learning certificates.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 animate-pulse rounded-lg border border-border bg-muted/30"
              />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No certificates yet. Complete a program to earn one.
            </p>
            <Link
              href="/programs"
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Browse Programs
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Certificate No.
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Issued
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <tr key={certificate.id} className="border-t border-border">
                    <td className="px-4 py-3">{certificate.programTitle}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {certificate.certificateNumber}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <RevokedBadge revoked={certificate.isRevoked} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/certificates/${certificate.id}`}
                        className="text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!meta.hasPreviousPage}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNextPage}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
