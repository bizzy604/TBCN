'use client';

import { useMemo, useState } from 'react';
import {
  useActivateCoupon,
  useAdminCoupons,
  useCouponAnalytics,
  useCreateCoupon,
  useDeactivateCoupon,
  useUpdateCoupon,
} from '@/hooks/use-commerce';
import type { Coupon, CouponDiscountType, CreateCouponInput } from '@/lib/api/commerce';

const defaultForm: CreateCouponInput = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  currency: 'KES',
  isActive: true,
  maxTotalUses: 100,
  maxUsesPerUser: 1,
  allowStacking: false,
  allowedPlans: [],
};

function mapCouponToForm(coupon: Coupon): CreateCouponInput {
  return {
    code: coupon.code,
    name: coupon.name || '',
    description: coupon.description || '',
    discountType: coupon.discountType,
    discountValue: Number(coupon.discountValue),
    currency: coupon.currency || 'KES',
    isActive: coupon.isActive,
    startsAt: coupon.startsAt || undefined,
    expiresAt: coupon.expiresAt || undefined,
    maxTotalUses: coupon.maxTotalUses ?? undefined,
    maxUsesPerUser: coupon.maxUsesPerUser ?? undefined,
    allowStacking: coupon.allowStacking,
    allowedPlans: coupon.allowedPlans ?? [],
    minOrderAmount: coupon.minOrderAmount ?? undefined,
  };
}

export default function AdminCouponsPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCouponInput>(defaultForm);
  const [allowedPlansInput, setAllowedPlansInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading } = useAdminCoupons({ page: 1, limit: 100 });
  const { data: analytics } = useCouponAnalytics();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const activateCoupon = useActivateCoupon();
  const deactivateCoupon = useDeactivateCoupon();

  const rows = useMemo(() => data?.data ?? [], [data]);

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
    setAllowedPlansInput('');
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm(mapCouponToForm(coupon));
    setAllowedPlansInput((coupon.allowedPlans || []).join(', '));
    setMessage(null);
  };

  const buildPayload = (): CreateCouponInput => {
    const allowedPlans = allowedPlansInput
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    return {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name?.trim() || undefined,
      description: form.description?.trim() || undefined,
      currency: form.currency?.trim().toUpperCase() || undefined,
      discountValue: Number(form.discountValue),
      maxTotalUses: form.maxTotalUses ? Number(form.maxTotalUses) : undefined,
      maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : undefined,
      minOrderAmount: form.minOrderAmount !== undefined && form.minOrderAmount !== null
        ? Number(form.minOrderAmount)
        : undefined,
      allowedPlans,
      startsAt: form.startsAt || undefined,
      expiresAt: form.expiresAt || undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload = buildPayload();

    try {
      if (editingId) {
        await updateCoupon.mutateAsync({ id: editingId, payload });
        setMessage('Coupon updated successfully.');
      } else {
        await createCoupon.mutateAsync(payload);
        setMessage('Coupon created successfully.');
      }
      resetForm();
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not save coupon.');
    }
  };

  const toggleCouponState = async (coupon: Coupon) => {
    setMessage(null);
    try {
      if (coupon.isActive) {
        await deactivateCoupon.mutateAsync(coupon.id);
        setMessage('Coupon deactivated.');
      } else {
        await activateCoupon.mutateAsync(coupon.id);
        setMessage('Coupon activated.');
      }
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not update coupon state.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coupons</h1>
        <p className="text-muted-foreground">Manage discount campaigns and monitor coupon performance.</p>
      </div>

      {analytics && (
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Coupons</p>
            <p className="mt-1 text-2xl font-semibold">{analytics.summary.totalCoupons}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Active Coupons</p>
            <p className="mt-1 text-2xl font-semibold">{analytics.summary.activeCoupons}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Redemptions</p>
            <p className="mt-1 text-2xl font-semibold">{analytics.summary.totalRedemptions}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Discount Given</p>
            <p className="mt-1 text-2xl font-semibold">{analytics.summary.totalDiscountAmount.toFixed(2)}</p>
          </div>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set discount rules clearly so admins can configure campaigns without guessing field meaning.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Coupon Code</label>
            <input
              required
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              placeholder="e.g. WELCOME20"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Unique code customers will enter at checkout.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Discount Type</label>
            <select
              value={form.discountType}
              onChange={(event) => setForm((prev) => ({ ...prev, discountType: event.target.value as CouponDiscountType }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <p className="text-xs text-muted-foreground">Choose percentage (%) or fixed amount discount.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Discount Value</label>
            <input
              type="number"
              min={0.01}
              step="0.01"
              required
              value={form.discountValue}
              onChange={(event) => setForm((prev) => ({ ...prev, discountValue: Number(event.target.value) }))}
              placeholder="e.g. 20 (for 20% or 20 currency units)"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Interpretation depends on selected discount type.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Currency Code</label>
            <input
              value={form.currency}
              onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
              placeholder="e.g. KES"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Needed for fixed amount discounts.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Max Total Uses</label>
            <input
              type="number"
              min={1}
              value={form.maxTotalUses || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, maxTotalUses: Number(event.target.value) || undefined }))}
              placeholder="e.g. 100"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Total times this coupon can be redeemed across all users.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Max Uses Per User</label>
            <input
              type="number"
              min={1}
              value={form.maxUsesPerUser || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, maxUsesPerUser: Number(event.target.value) || undefined }))}
              placeholder="e.g. 1"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Limit how often one user can redeem this coupon.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Minimum Order Amount</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.minOrderAmount || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, minOrderAmount: Number(event.target.value) || undefined }))}
              placeholder="e.g. 1500"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Coupon applies only when cart total meets this amount.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Allowed Plans</label>
            <input
              value={allowedPlansInput}
              onChange={(event) => setAllowedPlansInput(event.target.value)}
              placeholder="e.g. pro, enterprise"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Optional comma-separated plan slugs to restrict usage.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Starts At</label>
            <input
              type="datetime-local"
              value={form.startsAt ? form.startsAt.slice(0, 16) : ''}
              onChange={(event) => setForm((prev) => ({ ...prev, startsAt: event.target.value || undefined }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Leave empty to allow immediate redemption.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Expires At</label>
            <input
              type="datetime-local"
              value={form.expiresAt ? form.expiresAt.slice(0, 16) : ''}
              onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value || undefined }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Leave empty if the coupon should not expire.</p>
          </div>

          <div className="space-y-1 rounded-md border border-border px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.isActive)}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Active Coupon
            </label>
            <p className="text-xs text-muted-foreground">Inactive coupons cannot be redeemed.</p>
          </div>

          <div className="space-y-1 rounded-md border border-border px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.allowStacking)}
                onChange={(event) => setForm((prev) => ({ ...prev, allowStacking: event.target.checked }))}
              />
              Allow Stacking
            </label>
            <p className="text-xs text-muted-foreground">If enabled, this coupon can combine with others.</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Campaign Name (Optional)</label>
            <input
              value={form.name || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g. March Growth Campaign"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Internal display name for admins.</p>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
            <textarea
              value={form.description || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe campaign purpose, audience, and any restrictions."
              className="min-h-[90px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">Helpful notes for other admins managing this coupon.</p>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={createCoupon.isPending || updateCoupon.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {editingId ? 'Update Coupon' : 'Create Coupon'}
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
        <h2 className="mb-3 text-lg font-semibold">Coupons List</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading coupons...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No coupons available.</p>
        ) : (
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2">Code</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Value</th>
                <th className="px-2 py-2">Usage</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Expires</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border/60">
                  <td className="px-2 py-2 font-medium">{coupon.code}</td>
                  <td className="px-2 py-2 capitalize">{coupon.discountType}</td>
                  <td className="px-2 py-2">
                    {coupon.discountType === 'percentage'
                      ? `${Number(coupon.discountValue).toFixed(2)}%`
                      : `${coupon.currency || ''} ${Number(coupon.discountValue).toFixed(2)}`}
                  </td>
                  <td className="px-2 py-2">
                    {coupon.usedCount}
                    {coupon.maxTotalUses ? ` / ${coupon.maxTotalUses}` : ''}
                  </td>
                  <td className="px-2 py-2">{coupon.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-2 py-2">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(coupon)}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCouponState(coupon)}
                        className="rounded-md border border-border px-2 py-1 text-xs"
                      >
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
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
