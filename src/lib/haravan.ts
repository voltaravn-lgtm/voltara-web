import { Product, QuoteRequest } from "../types";

export interface HaravanSyncResult {
  ok: boolean;
  message: string;
  remoteProductId?: string;
  remoteVariantId?: string;
}

export interface HaravanOrderDraft {
  request: QuoteRequest;
  product?: Product;
  quantity?: string;
  price?: string;
}

export function getProductInventoryIdentity(product: Product) {
  return {
    sku: product.sku || product.id,
    barcode: product.barcode || "",
    haravanProductId: product.haravanProductId || "",
    haravanVariantId: product.haravanVariantId || "",
    syncEnabled: Boolean(product.syncEnabled),
  };
}

export function isHaravanReady(product?: Product) {
  if (!product) return false;
  return Boolean(product.syncEnabled && (product.sku || product.haravanVariantId));
}

export async function syncProductToHaravan(product: Product): Promise<HaravanSyncResult> {
  return {
    ok: false,
    message: `San pham ${product.id} da co du lieu SKU/kho, nhung connector Haravan chua duoc cau hinh tren server.`,
  };
}

export async function createHaravanOrder(_draft: HaravanOrderDraft): Promise<HaravanSyncResult> {
  return {
    ok: false,
    message: "Don hang da luu trong admin Voltara. Can them backend/API rieng de day don sang Haravan.",
  };
}
