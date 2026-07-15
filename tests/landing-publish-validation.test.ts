import assert from 'node:assert/strict';
import test from 'node:test';
import { validateLandingPageForPublish } from '../src/lib/landing/landingValidation.ts';
import type { CountdownLandingBlock, LandingPage, OrderFormLandingBlock, PriceLandingBlock } from '../src/types/landing.ts';

function page(overrides: Partial<LandingPage> = {}): LandingPage {
  const base: LandingPage = {
    id: 'landing-test',
    name: 'Test Landing',
    slug: 'test-landing',
    slugHistory: [],
    status: 'draft',
    templateId: 'single-product',
    templateVersion: 1,
    primaryProductId: 'product-1',
    seo: { title: 'SEO title', description: 'SEO description', image: 'https://example.com/social.jpg' },
    layout: { hideHeader: true, hideFooter: true, stickyMobileCta: true, theme: 'dark' },
    tracking: {},
    blocks: [],
    createdAt: '2026-07-12T00:00:00.000Z',
    updatedAt: '2026-07-12T00:00:00.000Z',
  };
  return {
    ...base,
    ...overrides,
  };
}

function orderForm(overrides: Partial<OrderFormLandingBlock> = {}): OrderFormLandingBlock {
  return { id: 'block-order', type: 'order-form', hidden: false, productIds: ['product-1'], formType: 'order', ...overrides };
}

function countdown(overrides: Partial<CountdownLandingBlock> = {}): CountdownLandingBlock {
  return { id: 'block-countdown', type: 'countdown', hidden: false, ...overrides };
}

function price(overrides: Partial<PriceLandingBlock> = {}): PriceLandingBlock {
  return { id: 'block-price', type: 'price', hidden: false, productId: 'product-1', useProductPrice: true, ...overrides };
}

test('publish validation blocks sales template without primary product', () => {
  const result = validateLandingPageForPublish(page({ primaryProductId: undefined }));
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /primary product/i);
});

test('publish validation blocks order form with no product', () => {
  const form = orderForm({ productIds: [] });
  const result = validateLandingPageForPublish(page({ primaryProductId: undefined, templateId: 'blank', blocks: [form] }));
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /Order Form/i);
});

test('publish validation warns for expired countdown and missing SEO', () => {
  const result = validateLandingPageForPublish(page({ seo: {}, blocks: [countdown({ endsAt: '2020-01-01T00:00:00.000Z' })] }));
  assert.equal(result.valid, true);
  assert.ok(result.warnings.some((warning) => /expired/i.test(warning)));
  assert.ok(result.warnings.some((warning) => /SEO title/i.test(warning)));
});

test('publish validation accepts a ready order landing', () => {
  const result = validateLandingPageForPublish(page({ blocks: [price({ displayPrice: 100000 }), orderForm()] }));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('publish validation accepts a dealer lead landing without a product', () => {
  const form = orderForm({ productIds: [], formType: 'consultation', showBusinessName: true, showBusinessType: true });
  const result = validateLandingPageForPublish(page({ primaryProductId: undefined, templateId: 'dealer-recruitment', blocks: [form] }));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});
