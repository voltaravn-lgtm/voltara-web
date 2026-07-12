# Landing Production Readiness Checklist

## Environment

- [ ] `.env.example` matches production variables.
- [ ] `FIREBASE_ADMIN_PROJECT_ID` is set on the server.
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL` is set on the server.
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` is set on the server.
- [ ] Server credentials do not use `NEXT_PUBLIC_`.
- [ ] Private key is not logged or committed.
- [ ] `NEXT_PUBLIC_SITE_URL` matches the final HTTPS domain.

## Firestore

- [ ] Deploy `firestore.rules`.
- [ ] Deploy `firestore.indexes.json`.
- [ ] Public can read published Landing only.
- [ ] Public cannot create `landingOrders`.
- [ ] Public cannot read/write `landingOrderDedup`.
- [ ] Admin can manage Landing Pages and Landing Orders.

## Local Flow

- [ ] Create Landing from Product.
- [ ] Open Builder.
- [ ] Edit block.
- [ ] Save draft.
- [ ] Publish.
- [ ] Open public route.
- [ ] Change slug and confirm old slug redirects.
- [ ] Draft returns 404.
- [ ] Header/Footer/mobile CTA settings work.
- [ ] Hero, Gallery, Price, Specifications, Combo, Countdown, FAQ render.

## Orders

- [ ] Submit order form.
- [ ] Submit consultation form.
- [ ] Submit phone-only form.
- [ ] API calculates price server-side.
- [ ] API rejects Product not attached to Landing.
- [ ] API rejects invalid variant.
- [ ] API accepts exact valid combo.
- [ ] Gift item can be price 0.
- [ ] Duplicate `requestId` does not create a second order.
- [ ] Duplicate submit in 5 minutes returns existing order.
- [ ] Honeypot is rejected.
- [ ] Invalid phone is rejected.
- [ ] Admin sees order.
- [ ] Admin updates order status.
- [ ] CSV export works.

## SEO And Pixel

- [ ] Metadata, canonical, Open Graph, Twitter are correct.
- [ ] Sitemap contains published Landing only.
- [ ] Draft is noindex/not found.
- [ ] Meta Pixel loads only when ID exists.
- [ ] TikTok Pixel loads only when ID exists.
- [ ] GTM loads only when ID exists.
- [ ] Pixel does not load in Builder Preview.
- [ ] Purchase/Lead uses API response value/currency.

## Performance

- [ ] Public Landing does not load AppContext.
- [ ] Public Landing does not query all products.
- [ ] Cache revalidates after save/publish.
- [ ] Hero image is prioritized only when suitable.
- [ ] Below-fold images lazy-load.
- [ ] Video does not autoplay heavy media by default.
- [ ] Lighthouse mobile 4G check is acceptable.

## Rollback

- [ ] Back up `firestore.rules`.
- [ ] Back up `firestore.indexes.json`.
- [ ] Back up `landingPages`.
- [ ] Back up `landingOrders`.
- [ ] Know how to unpublish Landing.
- [ ] Know how to set `LANDING_ORDERS_API_DISABLED="true"`.
- [ ] Know last good code build.
