'use client';

import { useMemo, useState } from 'react';
import {
  useAdminProducts,
  useCreateProduct,
  usePublishProduct,
  useUnpublishProduct,
  useUpdateProduct,
} from '@/hooks/use-commerce';
import type { CreateProductInput, Product, ProductType } from '@/lib/api/commerce';

const productTypes: ProductType[] = ['digital', 'toolkit', 'course_bundle', 'event_ticket', 'merch'];

const defaultForm: CreateProductInput = {
  title: '',
  description: '',
  type: 'digital',
  price: 0,
  currency: 'KES',
  isPublished: false,
  isDigital: true,
  thumbnailUrl: '',
  downloadUrl: '',
  stockQuantity: 0,
  downloadLimit: 3,
  downloadExpiresDays: 7,
};

function mapProductToForm(product: Product): CreateProductInput {
  return {
    title: product.title,
    description: product.description,
    type: product.type,
    price: Number(product.price),
    currency: product.currency,
    isPublished: product.isPublished,
    isDigital: product.isDigital,
    thumbnailUrl: product.thumbnailUrl || '',
    downloadUrl: product.downloadUrl || '',
    stockQuantity: product.stockQuantity ?? 0,
    downloadLimit: product.downloadLimit,
    downloadExpiresDays: product.downloadExpiresDays,
  };
}

export default function AdminProductsPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductInput>(defaultForm);

  const { data, isLoading } = useAdminProducts({ page: 1, limit: 100 });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const publishProduct = usePublishProduct();
  const unpublishProduct = useUnpublishProduct();

  const rows = useMemo(() => data?.data ?? [], [data]);

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(mapProductToForm(product));
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload: CreateProductInput = {
      ...form,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity || 0),
      downloadLimit: Number(form.downloadLimit || 3),
      downloadExpiresDays: Number(form.downloadExpiresDays || 7),
      thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
      downloadUrl: form.downloadUrl?.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, payload });
        setMessage('Product updated successfully.');
      } else {
        await createProduct.mutateAsync(payload);
        setMessage('Product created successfully.');
      }
      resetForm();
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not save product.');
    }
  };

  const handlePublishToggle = async (product: Product) => {
    setMessage(null);
    try {
      if (product.isPublished) {
        await unpublishProduct.mutateAsync(product.id);
        setMessage('Product unpublished.');
      } else {
        await publishProduct.mutateAsync(product.id);
        setMessage('Product published.');
      }
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not update publish state.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">Create and manage store products.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{editingId ? 'Edit Product' : 'Create Product'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill the fields below with clear product details so buyers understand what they are purchasing.
        </p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Product Title</label>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="e.g. Personal Brand Starter Kit"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Public name displayed to buyers.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Price</label>
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              placeholder="e.g. 3500"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Enter only the numeric amount.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Product Type</label>
            <select
              value={form.type}
              onChange={(event) => {
                const type = event.target.value as ProductType;
                setForm((prev) => ({
                  ...prev,
                  type,
                  isDigital: type !== 'merch',
                }));
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Select what you are selling: digital, toolkit, course bundle, event ticket, or merch.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Currency Code</label>
            <input
              value={form.currency}
              onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
              placeholder="e.g. KES"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Use ISO codes like KES, USD, or NGN.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Thumbnail URL</label>
            <input
              value={form.thumbnailUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
              placeholder="https://.../product-cover.jpg"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Image URL shown in product cards.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Download URL</label>
            <input
              value={form.downloadUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, downloadUrl: event.target.value }))}
              placeholder="https://.../file.zip"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Required for digital products. Leave blank for merch.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Stock Quantity</label>
            <input
              type="number"
              min={0}
              value={form.stockQuantity}
              onChange={(event) => setForm((prev) => ({ ...prev, stockQuantity: Number(event.target.value) }))}
              placeholder="e.g. 50"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Used for physical inventory (merch).</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Download Limit per Purchase</label>
            <input
              type="number"
              min={1}
              value={form.downloadLimit}
              onChange={(event) => setForm((prev) => ({ ...prev, downloadLimit: Number(event.target.value) }))}
              placeholder="e.g. 3"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">How many times a buyer can download the file.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Download Expiry (Days)</label>
            <input
              type="number"
              min={1}
              value={form.downloadExpiresDays}
              onChange={(event) => setForm((prev) => ({ ...prev, downloadExpiresDays: Number(event.target.value) }))}
              placeholder="e.g. 7"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Number of days before download access expires.</p>
          </div>

          <div className="space-y-1 rounded-md border border-border px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.isPublished)}
                onChange={(event) => setForm((prev) => ({ ...prev, isPublished: event.target.checked }))}
              />
              Publish Immediately
            </label>
            <p className="text-xs text-muted-foreground">If unchecked, the product stays as draft until you publish it.</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              required
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe what the buyer gets, who it is for, and expected outcomes."
              className="min-h-[110px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Add enough detail so first-time users can understand the value before buying.
            </p>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {editingId ? 'Update Product' : 'Create Product'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-border px-4 py-2 text-sm"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <section className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Products List</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading products...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Price</th>
                <th className="px-2 py-2">Published</th>
                <th className="px-2 py-2">Stock</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((product) => (
                <tr key={product.id} className="border-b border-border/60">
                  <td className="px-2 py-2">{product.title}</td>
                  <td className="px-2 py-2 capitalize">{product.type.replace('_', ' ')}</td>
                  <td className="px-2 py-2">{product.currency} {Number(product.price).toFixed(2)}</td>
                  <td className="px-2 py-2">{product.isPublished ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-2">{product.stockQuantity ?? '-'}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishToggle(product)}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        {product.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
