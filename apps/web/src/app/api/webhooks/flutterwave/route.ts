import { NextRequest, NextResponse } from 'next/server';

/**
 * Flutterwave webhook handler — placeholder.
 * Payment webhooks will be forwarded to the NestJS API for processing.
 */
export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    const body = await request.text();
    const res = await fetch(`${apiUrl}/api/v1/payments/webhooks/flutterwave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-flutterwave-signature': request.headers.get('verif-hash') || '',
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
