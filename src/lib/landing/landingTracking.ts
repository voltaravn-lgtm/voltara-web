export const META_PIXEL_ID_PATTERN = /^\d{5,25}$/;
export const TIKTOK_PIXEL_ID_PATTERN = /^[A-Z0-9]{10,30}$/i;
export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;
export function validLandingTrackingIds(input: { metaPixelId?: string; tiktokPixelId?: string; googleTagManagerId?: string }) { const meta = input.metaPixelId?.trim(); const tiktok = input.tiktokPixelId?.trim(); const gtm = input.googleTagManagerId?.trim().toUpperCase(); return { metaPixelId: meta && META_PIXEL_ID_PATTERN.test(meta) ? meta : undefined, tiktokPixelId: tiktok && TIKTOK_PIXEL_ID_PATTERN.test(tiktok) ? tiktok : undefined, googleTagManagerId: gtm && GTM_ID_PATTERN.test(gtm) ? gtm : undefined }; }
export function landingSuccessEventNames(formType: string) { const purchase = formType === 'order'; return { meta: purchase ? 'Purchase' : 'Lead', tiktok: purchase ? 'CompletePayment' : 'SubmitForm', gtm: 'landing_order_success' } as const; }
