import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isAdminEmail } from '../../../lib/adminAuth';
import { normalizeLandingSlug } from '../../../lib/landing/landingValidation';
import { firebaseConfig } from '../../../lib/firebase';

async function authenticatedAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token || !firebaseConfig.apiKey) return false;
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }), cache: 'no-store' });
  if (!response.ok) return false;
  const data = await response.json() as { users?: Array<{ email?: string }> };
  return isAdminEmail(data.users?.[0]?.email);
}

export async function POST(request: NextRequest) {
  if (!await authenticatedAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { slugs?: unknown };
  const slugs = Array.isArray(body.slugs) ? body.slugs.map((slug) => normalizeLandingSlug(String(slug))).filter(Boolean).slice(0, 10) : [];
  slugs.forEach((slug) => revalidatePath(`/landing/${slug}`));
  revalidateTag('public-landing', { expire: 0 });
  return NextResponse.json({ revalidated: slugs });
}
