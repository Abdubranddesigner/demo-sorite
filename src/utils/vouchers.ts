export interface VoucherTier {
  id: 'voucher-50' | 'voucher-100' | 'voucher-200';
  label: string;
  title: string;
  amountUsd: number;
  priceDisplay: string;
  description: string;
  recommendedTreatments: string[];
}

export type CurrencyCode = 'USD' | 'ETB' | 'KES';

export type SanctuaryLocation =
  | 'Addis Ababa — Bole Sanctuary'
  | 'Addis Ababa — Kazanchis Spa'
  | 'Nairobi — Westlands Sanctuary';

export type DeliveryMethod = 'Physical Card' | 'Digital Delivery';

export interface VoucherReservationInput {
  tierId: VoucherTier['id'];
  quantity: number;
  recipientName: string;
  senderName: string;
  personalMessage: string;
  location: SanctuaryLocation;
  deliveryMethod: DeliveryMethod;
  currency: CurrencyCode;
}

export interface VoucherReservationRecord extends VoucherReservationInput {
  id: string;
  referenceCode: string;
  amountUsdEach: number;
  subtotalUsd: number;
  discountUsd: number;
  totalUsd: number;
  convertedTotal: number;
  formattedTotal: string;
  expiryDateDisplay: string;
  createdAtIso: string;
}

export interface LoyaltyEnrolmentInput {
  fullName: string;
  contactInfo: string;
  visitFrequency: 'Weekly Visitor' | 'Occasional Guest';
  preferredPrivilege: 'Bespoke Facials' | 'Signature Massages' | 'Classic & Grand Hammam';
  homeLocation: SanctuaryLocation;
}

export interface LoyaltyEnrolmentRecord extends LoyaltyEnrolmentInput {
  membershipCode: string;
  tierStatus: string;
  enrolledAtIso: string;
}

export const VOUCHER_TIERS: VoucherTier[] = [
  {
    id: 'voucher-50',
    label: 'GIFT VOUCHER',
    title: 'Sanctuary Introduction',
    amountUsd: 50,
    priceDisplay: '$50',
    description: 'A first step into the sanctuary. Covers selected hair, nail or skin services.',
    recommendedTreatments: [
      'Botanical Scalp & Hair Ritual',
      'Signature Manicure & Pedicure',
      'Express Radiance Skin Facial',
    ],
  },
  {
    id: 'voucher-100',
    label: 'GIFT VOUCHER',
    title: 'Signature Hammam & Massage',
    amountUsd: 100,
    priceDisplay: '$100',
    description: 'Covers a full massage or Classic Hammam experience. Ideal for birthdays or occasions.',
    recommendedTreatments: [
      'Classic Moroccan Hammam',
      '90-Min Aromatherapy Massage',
      'Bespoke Hydration Facial',
    ],
  },
  {
    id: 'voucher-200',
    label: 'GIFT VOUCHER',
    title: 'Grand Wellness Retreat',
    amountUsd: 200,
    priceDisplay: '$200',
    description: 'Covers a Grand Hammam or premium package experience. The ultimate gift of wellness.',
    recommendedTreatments: [
      'Royal Grand Hammam Ritual',
      'Half-Day Total Renewal Package',
      'Couples Private Steam & Massage',
    ],
  },
];

// Prevailing conversion rates for Addis Ababa (ETB) and Nairobi (KES) reception calculations
export const PREVAILING_RATES: Record<CurrencyCode, { rate: number; symbol: string; name: string }> = {
  USD: { rate: 1, symbol: '$', name: 'US Dollar (USD)' },
  ETB: { rate: 124.5, symbol: 'ETB ', name: 'Ethiopian Birr (ETB)' },
  KES: { rate: 129.0, symbol: 'KES ', name: 'Kenyan Shilling (KES)' },
};

export const VOUCHER_TERMS_ITEMS: string[] = [
  'Valid for 12 months from date of purchase',
  'Redeemable at all Soreti locations in Addis Ababa and Nairobi',
  'Non-refundable and non-exchangeable for cash',
  'May be used toward any treatment or product',
  'USD value converted to ETB at prevailing rate on redemption date',
  'Personalised message available',
  'Physical card or digital delivery options available',
];

export const HOW_TO_PURCHASE_ITEMS: string[] = [
  'Visit any Soreti reception',
  'Ask our team about current membership and voucher availability',
  'Corporate vouchers and bulk packages available on request',
  'All currency conversions processed at time of sale',
];

export function formatCurrencyValue(amountUsd: number, currency: CurrencyCode): string {
  const info = PREVAILING_RATES[currency];
  const converted = Number((amountUsd * info.rate).toFixed(2));
  if (currency === 'USD') {
    return `$${converted.toLocaleString('en-US', {
      minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${info.symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Calculates corporate bulk discount:
 * 5-9 vouchers -> 5% corporate privilege discount
 * 10+ vouchers -> 10% corporate bulk package discount
 */
export function calculateVoucherPricing(
  amountUsdEach: number,
  quantity: number,
  currency: CurrencyCode
): {
  subtotalUsd: number;
  discountRate: number;
  discountUsd: number;
  totalUsd: number;
  convertedTotal: number;
  formattedTotal: string;
} {
  const safeQty = Math.max(1, Math.min(100, Math.floor(quantity || 1)));
  const subtotalUsd = amountUsdEach * safeQty;
  const discountRate = safeQty >= 10 ? 0.1 : safeQty >= 5 ? 0.05 : 0;
  const discountUsd = Number((subtotalUsd * discountRate).toFixed(2));
  const totalUsd = Number((subtotalUsd - discountUsd).toFixed(2));

  const currencyInfo = PREVAILING_RATES[currency];
  const convertedTotal = Number((totalUsd * currencyInfo.rate).toFixed(2));
  const formattedTotal = formatCurrencyValue(totalUsd, currency);

  return {
    subtotalUsd,
    discountRate,
    discountUsd,
    totalUsd,
    convertedTotal,
    formattedTotal,
  };
}

/**
 * Summarizes an array of bag items in the selected display currency.
 */
export function calculateBagSummary(
  items: VoucherReservationRecord[],
  displayCurrency: CurrencyCode
): {
  totalVouchersCount: number;
  subtotalUsd: number;
  discountUsd: number;
  totalUsd: number;
  formattedTotal: string;
} {
  const totalVouchersCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUsd = Number(items.reduce((sum, item) => sum + item.subtotalUsd, 0).toFixed(2));
  const discountUsd = Number(items.reduce((sum, item) => sum + item.discountUsd, 0).toFixed(2));
  const totalUsd = Number(items.reduce((sum, item) => sum + item.totalUsd, 0).toFixed(2));
  const formattedTotal = formatCurrencyValue(totalUsd, displayCurrency);

  return {
    totalVouchersCount,
    subtotalUsd,
    discountUsd,
    totalUsd,
    formattedTotal,
  };
}

/**
 * Validates a voucher reservation input. Returns an error map (empty if valid).
 */
export function validateVoucherReservation(input: VoucherReservationInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.recipientName || input.recipientName.trim().length < 2) {
    errors.recipientName = 'Please enter the recipient’s name (at least 2 characters).';
  }
  if (!input.senderName || input.senderName.trim().length < 2) {
    errors.senderName = 'Please enter your name or organisation.';
  }
  if (!Number.isFinite(input.quantity) || input.quantity < 1 || input.quantity > 100) {
    errors.quantity = 'Quantity must be between 1 and 100 vouchers.';
  }
  if (input.personalMessage && input.personalMessage.length > 240) {
    errors.personalMessage = 'Personalised message must be 240 characters or fewer.';
  }

  return errors;
}

/**
 * Validates a loyalty programme enrolment input.
 */
export function validateLoyaltyEnrolment(input: LoyaltyEnrolmentInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!input.contactInfo || input.contactInfo.trim().length < 5) {
    errors.contactInfo = 'Please provide a valid phone number or email address.';
  }

  return errors;
}

/**
 * Formats expiry date 12 months from a given Date.
 */
export function formatExpiryDate12Months(fromDate: Date = new Date()): string {
  const expiry = new Date(fromDate.getTime());
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
