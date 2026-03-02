'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { useProductCatalog } from '@/hooks/use-commerce';
import type { ProductType } from '@/lib/api/commerce';

const typeOptions: Array<{ label: string; value: '' | ProductType }> = [
  { label: 'All', value: '' },
  { label: 'Digital Products', value: 'digital' },
  { label: 'Course Bundles', value: 'course_bundle' },
  { label: 'Toolkits', value: 'toolkit' },
  { label: 'Merchandise', value: 'merch' },
  { label: 'Event Tickets', value: 'event_ticket' },
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
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Store</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Marketplace</h1>
            <p className="mt-2 text-sm text-sidebar-foreground/80">Digital products, templates, and premium resources.</p>
          </div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingCartIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search products"
          className="input"
        />

        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setType(option.value);
                setPage(1);
              }}
              className={`btn btn-sm ${type === option.value ? 'btn-primary' : 'btn-outline'}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="card h-64 animate-pulse bg-muted/55" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted-foreground">No products found for the selected filters.</div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => (
                <article key={product.id} className="card-hover overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-secondary/28 to-accent/28">
                    {product.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge bg-muted text-foreground capitalize">{product.type.replace('_', ' ')}</span>
                      <span className="text-sm font-semibold text-foreground">{formatPrice(product.currency, product.price)}</span>
                    </div>

                    <h2 className="line-clamp-1 text-lg font-semibold text-foreground">{product.title}</h2>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

                    <Link href={`/store/${product.id}`} className="btn btn-primary w-full">
                      Add to Cart
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!meta.hasPreviousPage}
                  className="btn btn-sm btn-outline"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!meta.hasNextPage}
                  className="btn btn-sm btn-outline"
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
