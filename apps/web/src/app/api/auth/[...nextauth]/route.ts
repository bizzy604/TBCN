import { NextResponse } from 'next/server';

/**
 * NextAuth catch-all route — placeholder.
 * Social authentication is handled by the NestJS API directly;
 * this route exists only to prevent build errors.
 */
export async function GET() {
  return NextResponse.json(
    { message: 'Auth is handled by the API server' },
    { status: 404 },
  );
}

export async function POST() {
  return NextResponse.json(
    { message: 'Auth is handled by the API server' },
    { status: 404 },
  );
}
