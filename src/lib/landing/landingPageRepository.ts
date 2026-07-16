import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { LandingPage } from "../../types/landing";
import { LANDING_PAGE_COLLECTION } from "./landingSchema";
import { normalizeLandingSlug, validateLandingPage, validateLandingSlug } from "./landingValidation";

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function landingPageFromSnapshot(id: string, data: Record<string, unknown>): LandingPage {
  return { ...data, id } as LandingPage;
}

function assertValidLandingPage(page: LandingPage) {
  const validation = validateLandingPage(page);
  if (!validation.valid) throw new Error(validation.errors.join(" "));
}

export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  if (!id?.trim()) return null;
  const snapshot = await getDoc(doc(db, LANDING_PAGE_COLLECTION, id));
  return snapshot.exists() ? landingPageFromSnapshot(snapshot.id, snapshot.data()) : null;
}

export async function findLandingPageBySlug(slugValue: string): Promise<LandingPage | null> {
  const slug = normalizeLandingSlug(slugValue);
  if (!slug) return null;
  const snapshot = await getDocs(query(collection(db, LANDING_PAGE_COLLECTION), where("slug", "==", slug), limit(1)));
  const match = snapshot.docs[0];
  return match ? landingPageFromSnapshot(match.id, match.data()) : null;
}

export async function findLandingPageByHistoricalSlug(slugValue: string): Promise<LandingPage | null> {
  const slug = normalizeLandingSlug(slugValue);
  if (!slug) return null;
  const snapshot = await getDocs(query(collection(db, LANDING_PAGE_COLLECTION), where("slugHistory", "array-contains", slug), limit(1)));
  const match = snapshot.docs[0];
  return match ? landingPageFromSnapshot(match.id, match.data()) : null;
}

export async function isLandingSlugAvailable(slugValue: string, excludePageId?: string): Promise<boolean> {
  const slugValidation = validateLandingSlug(slugValue);
  if (!slugValidation.valid) return false;
  const slug = normalizeLandingSlug(slugValue);
  const [current, historical] = await Promise.all([
    findLandingPageBySlug(slug),
    findLandingPageByHistoricalSlug(slug),
  ]);
  return [current, historical].every((page) => !page || page.id === excludePageId);
}

export async function listLandingPages(): Promise<LandingPage[]> {
  const snapshot = await getDocs(collection(db, LANDING_PAGE_COLLECTION));
  return snapshot.docs
    .map((item) => landingPageFromSnapshot(item.id, item.data()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function subscribeLandingPages(
  onData: (pages: LandingPage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(query(collection(db, LANDING_PAGE_COLLECTION), limit(50)), (snapshot) => {
    const pages = snapshot.docs
      .map((item) => landingPageFromSnapshot(item.id, item.data()))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    onData(pages);
  }, onError);
}

export async function createLandingPage(input: Omit<LandingPage, "id" | "createdAt" | "updatedAt">): Promise<LandingPage> {
  const reference = doc(collection(db, LANDING_PAGE_COLLECTION));
  const now = new Date().toISOString();
  const page: LandingPage = serialize({
    ...input,
    id: reference.id,
    slug: normalizeLandingSlug(input.slug),
    slugHistory: Array.from(new Set((input.slugHistory || []).map(normalizeLandingSlug).filter(Boolean))),
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === "published" ? (input.publishedAt || now) : input.publishedAt,
  });

  assertValidLandingPage(page);
  if (!await isLandingSlugAvailable(page.slug)) throw new Error("Slug đã được sử dụng bởi Landing Page khác hoặc nằm trong lịch sử URL.");
  await setDoc(reference, page);
  return page;
}

export async function saveLandingPage(input: LandingPage): Promise<LandingPage> {
  const existing = await getLandingPageById(input.id);
  if (!existing) throw new Error("Landing Page không tồn tại.");
  const nextSlug = normalizeLandingSlug(input.slug);
  if (!await isLandingSlugAvailable(nextSlug, input.id)) throw new Error("Slug đã được sử dụng bởi Landing Page khác hoặc nằm trong lịch sử URL.");

  const history = new Set((input.slugHistory || []).map(normalizeLandingSlug).filter(Boolean));
  history.delete(nextSlug);
  if (existing.slug && existing.slug !== nextSlug) history.add(normalizeLandingSlug(existing.slug));

  const page: LandingPage = serialize({
    ...input,
    slug: nextSlug,
    slugHistory: Array.from(history),
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    publishedAt: input.status === "published" ? (input.publishedAt || new Date().toISOString()) : input.publishedAt,
  });
  assertValidLandingPage(page);
  await setDoc(doc(db, LANDING_PAGE_COLLECTION, page.id), page);
  return page;
}

export async function deleteLandingPage(id: string): Promise<void> {
  await deleteDoc(doc(db, LANDING_PAGE_COLLECTION, id));
}
