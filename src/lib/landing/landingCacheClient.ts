import { auth } from '../firebase';

export async function revalidateLandingCache(slugs: string[]) {
  const user = auth.currentUser;
  if (!user) return false;
  try {
    const token = await user.getIdToken();
    const response = await fetch('/api/landing-revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ slugs: [...new Set(slugs.filter(Boolean))] }) });
    return response.ok;
  } catch (error) {
    console.warn('Landing saved but cache revalidation could not run:', error);
    return false;
  }
}
