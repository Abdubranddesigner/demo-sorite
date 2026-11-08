import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VOUCHER_TIERS,
  calculateVoucherPricing,
  calculateBagSummary,
  validateVoucherReservation,
  validateLoyaltyEnrolment,
  formatExpiryDate12Months,
  VoucherReservationRecord,
} from './vouchers';

test('VOUCHER_TIERS contains $50, $100, and $200 tiers matching reference copy', () => {
  assert.equal(VOUCHER_TIERS.length, 3);
  assert.equal(VOUCHER_TIERS[0].priceDisplay, '$50');
  assert.equal(
    VOUCHER_TIERS[0].description,
    'A first step into the sanctuary. Covers selected hair, nail or skin services.'
  );
  assert.equal(VOUCHER_TIERS[1].priceDisplay, '$100');
  assert.equal(
    VOUCHER_TIERS[1].description,
    'Covers a full massage or Classic Hammam experience. Ideal for birthdays or occasions.'
  );
  assert.equal(VOUCHER_TIERS[2].priceDisplay, '$200');
  assert.equal(
    VOUCHER_TIERS[2].description,
    'Covers a Grand Hammam or premium package experience. The ultimate gift of wellness.'
  );
});

test('calculateVoucherPricing computes single and corporate bulk discounts accurately', () => {
  const single = calculateVoucherPricing(100, 1, 'USD');
  assert.equal(single.subtotalUsd, 100);
  assert.equal(single.discountUsd, 0);
  assert.equal(single.totalUsd, 100);
  assert.equal(single.formattedTotal, '$100');

  const bulk5 = calculateVoucherPricing(100, 5, 'USD');
  assert.equal(bulk5.subtotalUsd, 500);
  assert.equal(bulk5.discountRate, 0.05);
  assert.equal(bulk5.discountUsd, 25);
  assert.equal(bulk5.totalUsd, 475);
  assert.equal(bulk5.formattedTotal, '$475');

  const bulk10Etb = calculateVoucherPricing(200, 10, 'ETB');
  assert.equal(bulk10Etb.subtotalUsd, 2000);
  assert.equal(bulk10Etb.discountRate, 0.1);
  assert.equal(bulk10Etb.totalUsd, 1800);
  assert.equal(bulk10Etb.convertedTotal, 1800 * 124.5);
});

test('calculateBagSummary aggregates multiple voucher items across currencies', () => {
  const mockItems: VoucherReservationRecord[] = [
    {
      id: '1',
      tierId: 'voucher-50',
      quantity: 2,
      recipientName: 'Hanna',
      senderName: 'Dawit',
      personalMessage: '',
      location: 'Addis Ababa — Bole Sanctuary',
      deliveryMethod: 'Digital Delivery',
      currency: 'USD',
      referenceCode: 'SRT-50-1001',
      amountUsdEach: 50,
      subtotalUsd: 100,
      discountUsd: 0,
      totalUsd: 100,
      convertedTotal: 100,
      formattedTotal: '$100',
      expiryDateDisplay: '8 November 2027',
      createdAtIso: '2026-11-08T00:00:00Z',
    },
    {
      id: '2',
      tierId: 'voucher-200',
      quantity: 1,
      recipientName: 'Meron',
      senderName: 'Dawit',
      personalMessage: '',
      location: 'Nairobi — Westlands Sanctuary',
      deliveryMethod: 'Physical Card',
      currency: 'USD',
      referenceCode: 'SRT-200-1002',
      amountUsdEach: 200,
      subtotalUsd: 200,
      discountUsd: 0,
      totalUsd: 200,
      convertedTotal: 200,
      formattedTotal: '$200',
      expiryDateDisplay: '8 November 2027',
      createdAtIso: '2026-11-08T00:00:00Z',
    },
  ];

  const summaryUsd = calculateBagSummary(mockItems, 'USD');
  assert.equal(summaryUsd.totalVouchersCount, 3);
  assert.equal(summaryUsd.totalUsd, 300);
  assert.equal(summaryUsd.formattedTotal, '$300');
});

test('validateVoucherReservation rejects empty fields and passes valid input', () => {
  const invalidErrors = validateVoucherReservation({
    tierId: 'voucher-100',
    quantity: 1,
    recipientName: '',
    senderName: 'A',
    personalMessage: '',
    location: 'Addis Ababa — Bole Sanctuary',
    deliveryMethod: 'Digital Delivery',
    currency: 'USD',
  });
  assert.ok(invalidErrors.recipientName);
  assert.ok(invalidErrors.senderName);

  const validErrors = validateVoucherReservation({
    tierId: 'voucher-100',
    quantity: 2,
    recipientName: 'Selamawit Tadesse',
    senderName: 'Abebe Bikila',
    personalMessage: 'Wishing you a serene Classic Hammam experience.',
    location: 'Addis Ababa — Bole Sanctuary',
    deliveryMethod: 'Physical Card',
    currency: 'ETB',
  });
  assert.equal(Object.keys(validErrors).length, 0);
});

test('validateLoyaltyEnrolment checks full name and contact details', () => {
  const errors = validateLoyaltyEnrolment({
    fullName: '',
    contactInfo: '123',
    visitFrequency: 'Weekly Visitor',
    preferredPrivilege: 'Bespoke Facials',
    homeLocation: 'Nairobi — Westlands Sanctuary',
  });
  assert.ok(errors.fullName);
  assert.ok(errors.contactInfo);

  const valid = validateLoyaltyEnrolment({
    fullName: 'Amara Ochieng',
    contactInfo: 'amara@example.com',
    visitFrequency: 'Weekly Visitor',
    preferredPrivilege: 'Signature Massages',
    homeLocation: 'Nairobi — Westlands Sanctuary',
  });
  assert.equal(Object.keys(valid).length, 0);
});

test('formatExpiryDate12Months advances date by 1 year', () => {
  const base = new Date('2026-11-08T12:00:00Z');
  const formatted = formatExpiryDate12Months(base);
  assert.match(formatted, /2027/);
});
