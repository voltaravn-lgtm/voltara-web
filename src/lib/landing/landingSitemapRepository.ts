import 'server-only';
import { unstable_cache } from 'next/cache';
import { getAdminFirestore } from '../firebaseAdmin';
import { LandingPage } from '../../types/landing';
import { LANDING_PAGE_COLLECTION } from './landingSchema';

export const listPublishedLandingsForSitemap = unstable_cache(async (): Promise<Array<Pick<LandingPage, 'slug' | 'updatedAt'>>> => {
  try {
    const snapshot = await getAdminFirestore().collection(LANDING_PAGE_COLLECTION).where('status', '==', 'published').get();
    return snapshot.docs.map((item) => ({ slug: String(item.data().slug || ''), updatedAt: String(item.data().updatedAt || '') })).filter((item) => Boolean(item.slug));
  } catch (error) {
    console.warn('Could not load published Landing Pages for sitemap:', error instanceof Error ? error.message : error);
    return [];
  }
}, ['published-landing-sitemap'], { revalidate: 300, tags: ['public-landing'] });
