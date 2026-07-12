export function normalizeVietnamesePhone(value: unknown) { let phone = String(value || '').replace(/\D/g, ''); if (phone.startsWith('84')) phone = `0${phone.slice(2)}`; return /^0(?:3|5|7|8|9)\d{8}$/.test(phone) ? phone : ''; }
export function hasHoneypot(value: unknown) { return Boolean(String(value || '').trim()); }
export function isPublishedOrderableLanding(status: string, hasVisibleOrderForm: boolean) { return status === 'published' && hasVisibleOrderForm; }
export function isAllowedLandingProduct(allowedProductIds: Iterable<string>, productId: string) { return new Set(allowedProductIds).has(productId); }
