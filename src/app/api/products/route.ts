import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";
import { PRODUCTS_DATA } from "../../../data";
import { db, isFirebaseConfigured } from "../../../lib/firebase";
import { Product } from "../../../types";

export const revalidate = 600;

function newestFirst(products: Product[]) {
  return [...products].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime || String(b.id).localeCompare(String(a.id), "vi");
  });
}

export async function GET() {
  try {
    if (!isFirebaseConfigured) throw new Error("Firebase is not configured");

    const snapshot = await getDocs(collection(db, "products"));
    const products = newestFirst(
      snapshot.docs
        .map((item) => item.data() as Product)
        .filter((product) => Boolean(product?.id)),
    );

    return NextResponse.json(
      { products, source: "firestore" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    console.error("Could not load the public product catalog:", error);
    return NextResponse.json(
      { products: newestFirst(PRODUCTS_DATA), source: "fallback" },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  }
}
