import { NextRequest, NextResponse } from 'next/server';
import { createLandingOrder, LandingOrderError } from '../../../lib/landing/landingOrderServer';
import { LandingOrderRequestInput } from '../../../types/landing';

export const runtime = 'nodejs';
const MAX_BODY_BYTES = 24 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const rateBuckets = new Map<string, number[]>();

function clientIp(request: NextRequest) { return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'; }
function sameOriginAllowed(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const requestHost = request.headers.get('host');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const allowed = new Set<string>();
  allowed.add(request.nextUrl.origin);
  if (requestHost) allowed.add(`https://${requestHost}`);
  if (requestHost?.startsWith('localhost') || requestHost?.startsWith('127.0.0.1')) allowed.add(`http://${requestHost}`);
  if (siteUrl) allowed.add(siteUrl.replace(/\/$/, ''));
  return allowed.has(origin.replace(/\/$/, ''));
}
function rateLimited(ip: string) {
  const now = Date.now(); const recent = (rateBuckets.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) return true;
  recent.push(now); rateBuckets.set(ip, recent);
  if (rateBuckets.size > 5000) for (const [key, values] of rateBuckets) if (!values.some((time) => now - time < RATE_WINDOW_MS)) rateBuckets.delete(key);
  return false;
}

export async function POST(request: NextRequest) {
  if (process.env.LANDING_ORDERS_API_DISABLED === 'true') return NextResponse.json({ error: 'He thong dat hang dang tam khoa.' }, { status: 503 });
  if (!sameOriginAllowed(request)) return NextResponse.json({ error: 'Yeu cau khong hop le.' }, { status: 403 });
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Dữ liệu gửi lên quá lớn.' }, { status: 413 });
  const ip = clientIp(request);
  if (rateLimited(ip)) return NextResponse.json({ error: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.' }, { status: 429, headers: { 'Retry-After': '600' } });
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Dữ liệu gửi lên quá lớn.' }, { status: 413 });
    const body = JSON.parse(raw) as LandingOrderRequestInput;
    const result = await createLandingOrder(body);
    return NextResponse.json({ id: result.order.id, orderCode: result.order.orderCode, total: result.order.total, currency: result.order.currency, duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'JSON không hợp lệ.' }, { status: 400 });
    if (error instanceof LandingOrderError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Landing order API failed:', error);
    const configurationError = error instanceof Error && error.message.includes('Firebase Admin');
    return NextResponse.json({ error: configurationError ? 'Hệ thống đặt hàng chưa được cấu hình.' : 'Không thể tạo đơn hàng. Vui lòng thử lại.' }, { status: configurationError ? 503 : 500 });
  }
}
