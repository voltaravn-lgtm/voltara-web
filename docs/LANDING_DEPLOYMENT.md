# Landing Page Sales Builder - Production Deployment

This guide prepares the Voltara Landing Page Sales Builder for real advertising traffic. It does not require database migration and does not delete existing collections.

## Required Environment Variables

Client-visible variables:

```bash
NEXT_PUBLIC_SITE_URL="https://voltara.vn"
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="..."
```

Server-only variables. Do not prefix these with `NEXT_PUBLIC_`:

```bash
FIREBASE_ADMIN_PROJECT_ID="voltara-61aa5"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@voltara-61aa5.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
LANDING_ORDERS_API_DISABLED="false"
```

## Firebase Service Account

1. Open Firebase Console.
2. Go to Project settings.
3. Open Service accounts.
4. Click Generate new private key.
5. Copy these fields from the JSON file:
   - `project_id` -> `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` -> `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` -> `FIREBASE_ADMIN_PRIVATE_KEY`
6. Keep the private key only in the server environment. Never commit it, print it, or put it in a `NEXT_PUBLIC_` variable.

For VPS `.env`, keep the `\n` newline escapes inside `FIREBASE_ADMIN_PRIVATE_KEY`. The app converts them before initializing Firebase Admin.

## Firestore Rules And Indexes

Landing collections:

- `landingPages`: public can read only documents where `status == "published"`; admin can create/update/delete.
- `landingOrders`: public create is blocked; the trusted Next.js API writes orders through Firebase Admin.
- `landingOrderDedup`: client read/write is blocked.

Deploy rules and indexes manually:

```bash
firebase login
firebase use voltaravolta-project-id
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Or deploy both:

```bash
firebase deploy --only firestore
```

This repository includes `firebase.json` pointing to `firestore.rules` and `firestore.indexes.json`.

## Firebase Emulator

Install Firebase CLI if needed, then run:

```bash
firebase emulators:start --only firestore
```

Prefer the emulator or a separate Firebase test project when testing order creation and security rules. Do not use real production customer data for readiness tests.

## Build And Deploy

Local verification:

```bash
npm install
npm run lint
npm run test:landing-pricing
npm run build
```

Vercel:

1. Add all environment variables in Project Settings.
2. Confirm server-only variables are not exposed as `NEXT_PUBLIC_`.
3. Deploy normally from the selected branch.
4. Confirm `/api/landing-orders` runs in Node.js runtime.

VPS:

1. Pull the approved code.
2. Install dependencies with `npm install`.
3. Add production `.env`.
4. Run `npm run build`.
5. Start with `npm run preview` or your process manager.
6. Put Nginx/Caddy/Cloudflare in front with HTTPS.
7. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.

Cloudflare:

- Use Full or Full strict SSL.
- Do not cache `POST /api/landing-orders`.
- Cache static assets normally.
- If using bot or WAF rules, allow legitimate POST requests from the landing domain.

## Production Smoke Test

1. Create a test Landing from Product.
2. Open Builder.
3. Edit Hero, Gallery, Price, Specifications, Combo, Countdown, FAQ.
4. Save draft.
5. Publish.
6. Open `/landing/[slug]`.
7. Change slug and confirm the old slug redirects to the new slug.
8. Confirm draft Landing returns 404.
9. Confirm Header/Footer/mobile CTA follow Landing settings.
10. Submit order, consultation, and phone-only forms.
11. Confirm API calculates the server price and returns order code, total, currency, and products.
12. Confirm Admin sees the order.
13. Update order status.
14. Export CSV.
15. Confirm `/sitemap.xml` includes only published Landing pages.
16. Confirm Pixel scripts load only when IDs are configured.

## Firestore Security Test

Use emulator or a test Firebase project:

- API can create `landingOrders` when Firebase Admin env vars exist.
- Client direct create to `landingOrders` is rejected.
- Client read/write to `landingOrderDedup` is rejected.
- Admin can read/update Landing Orders.
- Public read of draft `landingPages` is rejected.
- Public read of published `landingPages` is allowed.

## Pixel Verification

Meta:

- Add a valid Meta Pixel ID to a published Landing.
- Open the page with Meta Pixel Helper.
- Confirm `PageView` and `ViewContent`.
- Submit order and confirm `Purchase` uses API `total` and `currency`.
- Submit consultation/phone-only and confirm `Lead`.

TikTok:

- Add TikTok Pixel ID.
- Use TikTok Pixel Helper.
- Confirm `ViewContent`.
- Confirm `CompletePayment` for order and `SubmitForm` for lead forms.

GTM:

- Add a valid `GTM-XXXXXXX` ID.
- Use GTM Preview.
- Submit an order and confirm `landing_order_success` in `dataLayer`.

Pixels do not run inside Admin or Builder Preview.

## Backup And Rollback

Back up before launch:

- `firestore.rules`
- `firestore.indexes.json`
- `landingPages`
- `landingOrders`
- `landingOrderDedup`
- `products`

Rollback code:

1. Re-deploy the last known good build.
2. Keep Firestore collections intact.
3. If needed, deploy previous `firestore.rules` and `firestore.indexes.json`.

Emergency actions:

- Unpublish a Landing in Admin to remove it from public route and sitemap.
- Set `LANDING_ORDERS_API_DISABLED="true"` and redeploy/restart to temporarily stop order submission.
- Remove Pixel IDs from Landing settings if ad tracking must stop.

## Dependency Warning

Latest local check:

```bash
npm audit --audit-level=moderate
# found 0 vulnerabilities
```

Earlier checks had reported 9 moderate vulnerabilities. If they reappear in CI or on another machine, do not run `npm audit fix --force` without a separate compatibility review.

Packages previously seen in the advisory chain:

- `firebase-admin`
- `@google-cloud/storage`
- `gaxios`
- `next`
- `protobufjs`
- `retry-request`
- `teeny-request`
- `uuid`

Recommended action: track compatible patches for Next.js, Firebase Admin, and Google Cloud packages. Do not downgrade Next.js or Firebase Admin just to silence audit output.

## Before Running Ads

- Publish only reviewed Landing pages.
- Confirm every order Landing has a valid Product and server-computable price.
- Confirm phone, address, and note fields match the campaign goal.
- Place a real test order and verify Admin workflow.
- Check mobile page speed and form usability on iOS/Android.
- Verify Pixel events in the ad platforms before spending budget.
- Keep `LANDING_ORDERS_API_DISABLED` ready for incident response.
