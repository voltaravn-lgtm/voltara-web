import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { Product } from '../../types';
import { LandingPage } from '../../types/landing';
import { getAdminFirestore } from '../firebaseAdmin';
import { LANDING_PAGE_COLLECTION } from './landingSchema';
import { normalizeLandingSlug } from './landingValidation';

export interface PublicLandingData {
  page: LandingPage;
  product: Product | null;
  products: Product[];
  matchedHistoricalSlug: boolean;
}

async function queryPublishedLanding(slug: string, historical = false) {
  const field = historical ? 'slugHistory' : 'slug';
  const operator = historical ? 'array-contains' : '==';
  const snapshot = await getAdminFirestore()
    .collection(LANDING_PAGE_COLLECTION)
    .where('status', '==', 'published')
    .where(field, operator, slug)
    .limit(1)
    .get();
  const match = snapshot.docs[0];
  return match ? ({ ...match.data(), id: match.id } as LandingPage) : null;
}

const readPublicLanding = unstable_cache(async (slugValue: string): Promise<PublicLandingData | null> => {
  const slug = normalizeLandingSlug(slugValue);
  if (!slug) return null;

  try {
    let page = await queryPublishedLanding(slug);
    let matchedHistoricalSlug = false;
    if (!page) {
      page = await queryPublishedLanding(slug, true);
      matchedHistoricalSlug = Boolean(page);
    }
    if (!page) return null;

    const productIds = new Set<string>();
    if (page.primaryProductId) productIds.add(page.primaryProductId);
    page.blocks.forEach((block) => {
      if ('productId' in block && block.productId) productIds.add(block.productId);
      if (block.type === 'combo') [...block.products, ...(block.gifts || [])].forEach((item) => productIds.add(item.productId));
      if (block.type === 'order-form') block.productIds?.forEach((id) => productIds.add(id));
    });

    const db = getAdminFirestore();
    const productSnapshots = await Promise.all([...productIds].map((id) => db.collection('products').doc(id).get()));
    const products = productSnapshots.filter((snapshot) => snapshot.exists).map((snapshot) => ({ ...snapshot.data(), id: snapshot.id } as Product));
    const product = products.find((item) => item.id === page.primaryProductId) || null;

    return { page, product, products, matchedHistoricalSlug };
  } catch (error) {
    console.warn('Could not load public Landing Page:', error instanceof Error ? error.message : error);
    return null;
  }
}, ['public-landing-by-slug'], { revalidate: 300, tags: ['public-landing'] });

export const getPublicLandingBySlug = cache(readPublicLanding);
