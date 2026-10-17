'use strict';

const crypto = require('node:crypto');

function getPaystackTestConfig(env = process.env) {
  if (env.PAYMENT_MODE !== 'test' || env.PAYMENT_PROVIDER !== 'paystack') {
    const error = new Error('Paystack is available only in configured test mode');
    error.status = 503;
    throw error;
  }
  if (!/^pk_test_[A-Za-z0-9]+$/.test(env.PAYMENT_PUBLIC_KEY || '') || !/^sk_test_[A-Za-z0-9]+$/.test(env.PAYMENT_SECRET_KEY || '')) {
    const error = new Error('Valid Paystack test public and secret keys are required');
    error.status = 503;
    throw error;
  }
  return { publicKey: env.PAYMENT_PUBLIC_KEY, secretKey: env.PAYMENT_SECRET_KEY };
}

function verifyWebhookSignature(secret, rawBody, signature) {
  if (!secret || !signature) return false;
  const received = Buffer.from(signature, 'hex');
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest();
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function classifyTransaction(status) {
  if (status === 'success' || status === 'successful') return 'succeeded';
  if (status === 'failed' || status === 'failure') return 'failed';
  if (status === 'abandoned' || status === 'cancelled') return 'abandoned';
  if (status === 'pending' || status === 'ongoing') return 'pending';
  return null;
}

function validateVerifiedTransaction(booking, transaction, expectedReference) {
  if (!booking || !transaction || transaction.reference !== expectedReference) return false;
  if (transaction.status !== 'success') return false;
  if (transaction.currency !== booking.currency) return false;
  const actualKobo = Number(transaction.amount);
  const expectedKobo = Math.round(Number(booking.total_price) * 100);
  return Number.isInteger(actualKobo) && Number.isFinite(expectedKobo) && actualKobo === expectedKobo;
}

module.exports = { getPaystackTestConfig, verifyWebhookSignature, classifyTransaction, validateVerifiedTransaction };