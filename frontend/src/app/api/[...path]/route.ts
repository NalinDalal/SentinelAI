import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/api/:path*',
};

export default async function handler(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const url = new URL(pathname.replace('/api', ''), backendUrl);

  const init: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = request.cookies.get('access_token')?.value;
  if (token) {
    (init.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const response = await fetch(url.toString(), init);

  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}