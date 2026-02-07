import { NextRequest, NextResponse } from 'next/server';

/**
 * Stripe webhook handler — placeholder.
 * Payment webhooks will be forwarded to the NestJS API for processing.
 */
export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const body = await request.text();
    const res = await fetch(`${apiUrl}/api/v1/payments/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': request.headers.get('stripe-signature') || '',
      },
      body,
    });

    return NextResponse.json(
      { received: true },
      { status: res.ok ? 200 : 502 },
    );
  } catch {
    return NextResponse.json({ error: 'Webhook forwarding failed' }, { status: 502 });
  }
}
