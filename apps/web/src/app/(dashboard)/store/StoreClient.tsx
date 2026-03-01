'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useProductCatalog } from '@/hooks/use-commerce';
import type { ProductType } from '@/lib/api/commerce';

const typeOptions: Array<{ label: string; value: '' | ProductType }> = [
  { label: 'All Types', value: '' },
  { label: 'Digital', value: 'digital' },
  { label: 'Toolkit', value: 'toolkit' },
  { label: 'Course Bundle', value: 'course_bundle' },
  { label: 'Event Ticket', value: 'event_ticket' },
  { label: 'Merchandise', value: 'merch' },
];

function formatPrice(currency: string, amount: number) {
  return `${currency.toUpperCase()} ${Number(amount).toFixed(2)}`;
}

export default function StoreClient() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'' | ProductType>('');
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      type: type || undefined,
    }),
    [page, search, type],
  );

  const { data, isLoading } = useProductCatalog(query);
  const items = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store</h1>
          <p className="mt-2 text-muted-foreground">
            Buy TBCN digital resources, toolkits, and premium assets.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm sm:flex-1"
          />

          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as '' | ProductType);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {typeOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="h-56 animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
            No products found for your current filters.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => (
                <article key={product.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 flex h-36 items-center justify-center rounded-md bg-muted/30">
                    {product.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No Image</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {product.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-semibold">
                        {formatPrice(product.currency, product.price)}
                      </span>
                    </div>

                    <h2 className="line-clamp-1 text-base font-semibold">{product.title}</h2>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

                    <Link
                      href={`/store/${product.id}`}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    >
                      View Product
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!meta.hasPreviousPage}
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!meta.hasNextPage}
                  className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

