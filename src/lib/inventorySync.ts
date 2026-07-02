import { Product, QuoteRequest } from "../types";

export type InventorySyncChannel = NonNullable<Product["syncChannel"]>;

export interface InventorySyncResult {
  ok: boolean;
  message: string;
  remoteProductId?: string;
  remoteVariantId?: string;
}

export interface InventoryOrderDraft {
  request: QuoteRequest;
  product?: Product;
  quantity?: string;
  price?: string;
}

export function getProductInventoryIdentity(product: Product) {
  return {
    channel: product.syncChannel || "",
    sku: product.sku || product.id,
    barcode: product.barcode || "",
    externalProductId: product.externalProductId || product.haravanProductId || "",
    externalVariantId: product.externalVariantId || product.haravanVariantId || "",
    syncEnabled: Boolean(product.syncEnabled),
  };
}

export function isInventorySyncReady(product?: Product) {
  if (!product) return false;
  const identity = getProductInventoryIdentity(product);
  return Boolean(identity.syncEnabled && identity.channel && (identity.sku || identity.externalVariantId));
}

export async function syncProductToInventoryChannel(product: Product): Promise<InventorySyncResult> {
  const identity = getProductInventoryIdentity(product);

  return {
    ok: false,
    message: `San pham ${product.id} da co du lieu SKU/kho cho kenh ${identity.channel || "chua chon"}, nhung connector server chua duoc cau hinh.`,
  };
}

export async function createInventoryChannelOrder(_draft: InventoryOrderDraft): Promise<InventorySyncResult> {
  return {
    ok: false,
    message: "Don hang da luu trong admin Voltara. Can them backend/API rieng de day don sang kenh ban hang.",
  };
}
