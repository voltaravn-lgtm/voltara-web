import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateComboTotal, parseLandingPrice, resolveComboPrice, resolvePaidUnitPrice } from '../src/lib/landing/landingPricing.ts';

test('giá Product thường và sale đúng thứ tự', () => {
  assert.equal(resolvePaidUnitPrice({ productPrice: '1.000.000' }), 1000000);
  assert.equal(resolvePaidUnitPrice({ productSalePrice: '800000', productRetailPrice: '900000', productPrice: '1000000' }), 800000);
});

test('giá biến thể ưu tiên trước giá Product', () => {
  assert.equal(resolvePaidUnitPrice({ variantSalePrice: '650000', variantPrice: '700000', productSalePrice: '800000' }), 650000);
  assert.equal(resolvePaidUnitPrice({ variantPrice: '700000', productSalePrice: '800000' }), 700000);
});

test('Price block override ưu tiên Landing override và giá biến thể', () => {
  assert.equal(resolvePaidUnitPrice({ priceBlockOverride: 500000, landingProductOverride: 550000, variantSalePrice: 600000 }), 500000);
  assert.equal(resolvePaidUnitPrice({ landingProductOverride: 550000, variantSalePrice: 600000 }), 550000);
});

test('comboPrice hợp lệ là tổng cuối và phân bổ đúng', () => {
  const combo = resolveComboPrice(900000); assert.equal(combo, 900000);
  const items = allocateComboTotal([{ quantity: 1 }, { quantity: 2 }], combo!);
  assert.equal(items.reduce((sum, item) => sum + item.lineTotal, 0), 900000);
});

test('không có giá hợp lệ hoặc giá 0 phải báo lỗi; gift 0 parse được riêng', () => {
  assert.throws(() => resolvePaidUnitPrice({ productPrice: '' }), /chưa có giá/);
  assert.throws(() => resolvePaidUnitPrice({ productPrice: 0 }), /chưa có giá/);
  assert.equal(parseLandingPrice(0), 0);
});
