'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {
  getPaystackTestConfig,
  verifyWebhookSignature,
  classifyTransaction,
  validateVerifiedTransaction,
} = require('../../src/lib/paystackSecurity.cjs');

test('accepts only a Paystack public and secret test-key pair', () => {
  assert.deepEqual(getPaystackTestConfig({
    PAYMENT_MODE: 'test',
    PAYMENT_PROVIDER: 'paystack',
    PAYMENT_PUBLIC_KEY: 'pk_test_fixture123',
    PAYMENT_SECRET_KEY: 'sk_test_fixture123',
  }), { publicKey: 'pk_test_fixture123', secretKey: 'sk_test_fixture123' });
  assert.throws(() => getPaystackTestConfig({
    PAYMENT_MODE: 'live',
    PAYMENT_PROVIDER: 'paystack',
    PAYMENT_PUBLIC_KEY: 'pk_live_fixture123',
    PAYMENT_SECRET_KEY: 'sk_live_fixture123',
  }), /test mode/);
  assert.throws(() => getPaystackTestConfig({
    PAYMENT_MODE: 'test',
    PAYMENT_PROVIDER: 'paystack',
    PAYMENT_PUBLIC_KEY: 'pk_test_fixture123',
    PAYMENT_SECRET_KEY: 'sk_live_fixture123',
  }), /test public and secret keys/);
});

test('verifies Paystack HMAC signatures and rejects modified payloads', () => {
  const secret = 'sk_test_fixture123';
  const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref-1' } });
  const signature = crypto.createHmac('sha512', secret).update(payload).digest('hex');
  assert.equal(verifyWebhookSignature(secret, payload, signature), true);
  assert.equal(verifyWebhookSignature(secret, `${payload} `, signature), false);
  assert.equal(verifyWebhookSignature(secret, payload, ''), false);
});

test('classifies successful, failed, abandoned, and pending provider states', () => {
  assert.equal(classifyTransaction('success'), 'succeeded');
  assert.equal(classifyTransaction('failed'), 'failed');
  assert.equal(classifyTransaction('abandoned'), 'abandoned');
  assert.equal(classifyTransaction('pending'), 'pending');
  assert.equal(classifyTransaction('unknown'), null);
});

test('confirms only exact amount, currency, and reference matches', () => {
  const booking = { total_price: 115000, currency: 'NGN' };
  const transaction = { reference: 'ref-1', status: 'success', currency: 'NGN', amount: 11500000 };
  assert.equal(validateVerifiedTransaction(booking, transaction, 'ref-1'), true);
  assert.equal(validateVerifiedTransaction(booking, { ...transaction, amount: 11500001 }, 'ref-1'), false);
  assert.equal(validateVerifiedTransaction(booking, { ...transaction, currency: 'USD' }, 'ref-1'), false);
  assert.equal(validateVerifiedTransaction(booking, transaction, 'ref-other'), false);
});