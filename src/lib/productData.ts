import { collection, getDocs } from "firebase/firestore";
import { PRODUCTS_DATA } from "../data";
import { Product } from "../types";
import { db, isFirebaseConfigured } from "./firebase";

export async function getBuildProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured) return PRODUCTS_DATA;

  try {
    const snapshot = await getDocs(collection(db, "products"));
    const remoteProducts = snapshot.docs.map((item) => item.data() as Product);
    const byId = new Map<string, Product>();
    [...PRODUCTS_DATA, ...remoteProducts].forEach((product) => {
      if (product?.id) byId.set(product.id, product);
    });
    return Array.from(byId.values());
  } catch (error) {
    console.error("Could not load products for static product routes:", error);
    return PRODUCTS_DATA;
  }
}
