import { PRODUCTS_DATA } from "../data";

const staticProductIds = new Set(PRODUCTS_DATA.map((product) => product.id));

export function getProductHref(productId: string) {
  return staticProductIds.has(productId)
    ? `/san-pham/${productId}`
    : `/san-pham?select=${encodeURIComponent(productId)}`;
}
