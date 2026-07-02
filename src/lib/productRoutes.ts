import { PRODUCTS_DATA } from "../data";
import { Product } from "../types";

const staticProductIds = new Set(PRODUCTS_DATA.map((product) => product.id));

export function slugifyProductText(value: string) {
  return (value || "san-pham")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getProductSlug(product: Product) {
  const nameSlug = slugifyProductText(product.name || product.id);
  const idSlug = slugifyProductText(product.id);
  if (!idSlug || nameSlug.includes(idSlug)) return nameSlug;
  return `${nameSlug}-${idSlug}`;
}

export function getProductHref(product: Product | string) {
  if (typeof product !== "string") {
    return `/san-pham/${getProductSlug(product)}`;
  }

  return staticProductIds.has(product)
    ? `/san-pham/${product}`
    : `/san-pham?select=${encodeURIComponent(product)}`;
}
