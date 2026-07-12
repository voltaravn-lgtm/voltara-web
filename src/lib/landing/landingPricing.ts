export interface LandingPriceCandidates {
  priceBlockOverride?: unknown;
  landingProductOverride?: unknown;
  variantSalePrice?: unknown;
  variantPrice?: unknown;
  productSalePrice?: unknown;
  productRetailPrice?: unknown;
  productPrice?: unknown;
}

export function parseLandingPrice(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).trim().replace(/[^0-9-]/g, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function resolvePaidUnitPrice(candidates: LandingPriceCandidates): number {
  const ordered = [candidates.priceBlockOverride, candidates.landingProductOverride, candidates.variantSalePrice, candidates.variantPrice, candidates.productSalePrice, candidates.productRetailPrice, candidates.productPrice];
  for (const candidate of ordered) {
    const price = parseLandingPrice(candidate);
    if (price !== undefined && price > 0) return price;
  }
  throw new Error('Sản phẩm chưa có giá bán hợp lệ.');
}

export function resolveComboPrice(value: unknown): number | undefined {
  const price = parseLandingPrice(value);
  return price !== undefined && price > 0 ? price : undefined;
}

export function allocateComboTotal<T extends { quantity: number }>(items: T[], comboPrice: number): Array<T & { unitPrice: number; lineTotal: number }> {
  if (!items.length || !Number.isFinite(comboPrice) || comboPrice <= 0) throw new Error('Giá combo không hợp lệ.');
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  if (!Number.isFinite(totalQuantity) || totalQuantity <= 0) throw new Error('Số lượng combo không hợp lệ.');
  let allocated = 0;
  return items.map((item, index) => {
    const lineTotal = index === items.length - 1 ? comboPrice - allocated : Math.round(comboPrice * item.quantity / totalQuantity);
    allocated += lineTotal;
    return { ...item, lineTotal, unitPrice: Math.round(lineTotal / item.quantity) };
  });
}
