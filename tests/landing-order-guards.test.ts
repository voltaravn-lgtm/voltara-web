import test from 'node:test';
import assert from 'node:assert/strict';
import { hasHoneypot, isAllowedLandingProduct, isPublishedOrderableLanding, normalizeVietnamesePhone } from '../src/lib/landing/landingOrderGuards.ts';
test('chuẩn hóa và từ chối số điện thoại Việt Nam không hợp lệ', () => { assert.equal(normalizeVietnamesePhone('+84 912 345 678'), '0912345678'); assert.equal(normalizeVietnamesePhone('12345'), ''); });
test('honeypot chặn bot', () => { assert.equal(hasHoneypot('website spam'), true); assert.equal(hasHoneypot(''), false); });
test('Landing draft hoặc không có form không được đặt', () => { assert.equal(isPublishedOrderableLanding('draft', true), false); assert.equal(isPublishedOrderableLanding('published', false), false); assert.equal(isPublishedOrderableLanding('published', true), true); });
test('Product ngoài Landing bị từ chối', () => { assert.equal(isAllowedLandingProduct(['p1', 'p2'], 'p3'), false); assert.equal(isAllowedLandingProduct(['p1'], 'p1'), true); });
