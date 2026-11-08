/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  VOUCHER_TIERS,
  VOUCHER_TERMS_ITEMS,
  HOW_TO_PURCHASE_ITEMS,
  VoucherTier,
  CurrencyCode,
  SanctuaryLocation,
  DeliveryMethod,
  VoucherReservationRecord,
  LoyaltyEnrolmentRecord,
  calculateVoucherPricing,
  formatCurrencyValue,
  validateVoucherReservation,
  validateLoyaltyEnrolment,
  formatExpiryDate12Months,
} from './utils/vouchers';

const LOCATIONS: SanctuaryLocation[] = [
  'Addis Ababa — Bole Sanctuary',
  'Addis Ababa — Kazanchis Spa',
  'Nairobi — Westlands Sanctuary',
];

export default function App() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  // Inline Voucher Selection & Reservation State
  const [selectedTierId, setSelectedTierId] = useState<VoucherTier['id'] | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [recipientName, setRecipientName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [personalMessage, setPersonalMessage] = useState<string>('');
  const [location, setLocation] = useState<SanctuaryLocation>('Addis Ababa — Bole Sanctuary');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Physical Card');
  const [voucherErrors, setVoucherErrors] = useState<Record<string, string>>({});
  const [confirmedVoucher, setConfirmedVoucher] = useState<VoucherReservationRecord | null>(null);

  // Inline Loyalty Enrolment State
  const [showLoyaltyForm, setShowLoyaltyForm] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [visitFrequency, setVisitFrequency] = useState<'Weekly Visitor' | 'Occasional Guest'>('Weekly Visitor');
  const [preferredPrivilege, setPreferredPrivilege] = useState<
    'Bespoke Facials' | 'Signature Massages' | 'Classic & Grand Hammam'
  >('Bespoke Facials');
  const [loyaltyErrors, setLoyaltyErrors] = useState<Record<string, string>>({});
  const [loyaltyRecord, setLoyaltyRecord] = useState<LoyaltyEnrolmentRecord | null>(null);

  const activeTier = VOUCHER_TIERS.find((t) => t.id === selectedTierId) || VOUCHER_TIERS[1];
  const pricing = calculateVoucherPricing(activeTier.amountUsd, quantity, currency);

  const handleSelectTier = (tierId: VoucherTier['id']) => {
    setConfirmedVoucher(null);
    setVoucherErrors({});
    setSelectedTierId((prev) => (prev === tierId ? null : tierId));
  };

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTierId = selectedTierId || 'voucher-100';
    const validationErrors = validateVoucherReservation({
      tierId: currentTierId,
      quantity,
      recipientName,
      senderName,
      personalMessage,
      location,
      deliveryMethod,
      currency,
    });

    if (Object.keys(validationErrors).length > 0) {
      setVoucherErrors(validationErrors);
      return;
    }

    const tierObj = VOUCHER_TIERS.find((t) => t.id === currentTierId) || VOUCHER_TIERS[1];
    const calc = calculateVoucherPricing(tierObj.amountUsd, quantity, currency);
    const referenceCode = `SRT-${tierObj.amountUsd}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: VoucherReservationRecord = {
      id: `${Date.now()}`,
      tierId: currentTierId,
      quantity,
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      personalMessage: personalMessage.trim(),
      location,
      deliveryMethod,
      currency,
      referenceCode,
      amountUsdEach: tierObj.amountUsd,
      subtotalUsd: calc.subtotalUsd,
      discountUsd: calc.discountUsd,
      totalUsd: calc.totalUsd,
      convertedTotal: calc.convertedTotal,
      formattedTotal: calc.formattedTotal,
      expiryDateDisplay: formatExpiryDate12Months(),
      createdAtIso: new Date().toISOString(),
    };

    setConfirmedVoucher(record);
    setSelectedTierId(null);
    setRecipientName('');
    setPersonalMessage('');
    setVoucherErrors({});
  };

  const handleLoyaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateLoyaltyEnrolment({
      fullName,
      contactInfo,
      visitFrequency,
      preferredPrivilege,
      homeLocation: location,
    });

    if (Object.keys(errors).length > 0) {
      setLoyaltyErrors(errors);
      return;
    }

    const record: LoyaltyEnrolmentRecord = {
      fullName: fullName.trim(),
      contactInfo: contactInfo.trim(),
      visitFrequency,
      preferredPrivilege,
      homeLocation: location,
      membershipCode: `SLP-${Math.floor(10000 + Math.random() * 90000)}`,
      tierStatus: visitFrequency === 'Weekly Visitor' ? 'Elite Sanctuary Circle' : 'Sanctuary Privilege Guest',
      enrolledAtIso: new Date().toISOString(),
    };

    setLoyaltyRecord(record);
    setShowLoyaltyForm(false);
    setLoyaltyErrors({});
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#4D2177] font-body">
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Clean Single-Page Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold mb-2">
                LOYALTY &amp; GIFTING
              </p>
              <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] font-semibold text-[#4D2177]">
                Soreti Loyalty &amp; Gift Vouchers
              </h1>
            </div>

            {/* Simple Currency Switcher */}
            <div className="flex items-center gap-2 self-start sm:self-end">
              <span className="text-xs text-[#4D2177]/70 font-medium">Currency:</span>
              <div
                role="group"
                aria-label="Currency selector"
                className="inline-flex p-1 bg-[#FBF6EC] border border-[#B78F2E]/40 rounded-md"
              >
                {(['USD', 'ETB', 'KES'] as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      currency === code
                        ? 'bg-[#4D2177] text-[#FBF9F6]'
                        : 'text-[#4D2177]/75 hover:text-[#4D2177]'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="h-[1px] w-full bg-gradient-to-r from-[#B78F2E]/55 via-[#B78F2E]/25 to-transparent"
            aria-hidden="true"
          />
        </header>

        {/* Soreti Loyalty Programme Card */}
        <section aria-labelledby="loyalty-heading">
          <div className="bg-[#FBF6EC] border border-[#B78F2E]/40 rounded-lg p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <h2 id="loyalty-heading" className="text-base sm:text-lg font-bold text-[#4D2177]">
                  Soreti Loyalty Programme
                </h2>
                <p className="text-sm sm:text-[15px] text-[#4D2177]/80 leading-relaxed">
                  Join our elite Soreti Loyalty Programme and enjoy exclusive discounts and offers. Whether a weekly visitor or occasional guest, unlock privileges like bespoke facials and signature massages. Ask at reception to enrol.
                </p>
              </div>

              <div className="shrink-0">
                {loyaltyRecord ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4D2177] bg-[#FBF9F6] border border-[#B78F2E] px-3.5 py-2 rounded-md">
                    <Check className="w-3.5 h-3.5 text-[#B78F2E]" />
                    ID: {loyaltyRecord.membershipCode}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLoyaltyForm((prev) => !prev)}
                    className="px-4 py-2.5 text-xs tracking-[0.14em] uppercase font-bold text-[#4D2177] border border-[#B78F2E] rounded-md hover:bg-[#FBF9F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {showLoyaltyForm ? 'Close Form' : 'Enrol Online'}
                  </button>
                )}
              </div>
            </div>

            {showLoyaltyForm && !loyaltyRecord && (
              <form
                onSubmit={handleLoyaltySubmit}
                className="pt-4 border-t border-[#B78F2E]/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-start"
                noValidate
              >
                <div>
                  <label htmlFor="loyalty-name" className="block text-xs font-bold text-[#4D2177] mb-1">
                    Full Name *
                  </label>
                  <input
                    id="loyalty-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (loyaltyErrors.fullName) setLoyaltyErrors({ ...loyaltyErrors, fullName: '' });
                    }}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  />
                  {loyaltyErrors.fullName && (
                    <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                      {loyaltyErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="loyalty-contact" className="block text-xs font-bold text-[#4D2177] mb-1">
                    Phone or Email *
                  </label>
                  <input
                    id="loyalty-contact"
                    type="text"
                    value={contactInfo}
                    onChange={(e) => {
                      setContactInfo(e.target.value);
                      if (loyaltyErrors.contactInfo) setLoyaltyErrors({ ...loyaltyErrors, contactInfo: '' });
                    }}
                    placeholder="+251 / email"
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  />
                  {loyaltyErrors.contactInfo && (
                    <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                      {loyaltyErrors.contactInfo}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="loyalty-privilege" className="block text-xs font-bold text-[#4D2177] mb-1">
                    Preferred Privilege
                  </label>
                  <select
                    id="loyalty-privilege"
                    value={preferredPrivilege}
                    onChange={(e) =>
                      setPreferredPrivilege(
                        e.target.value as
                          | 'Bespoke Facials'
                          | 'Signature Massages'
                          | 'Classic & Grand Hammam'
                      )
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  >
                    <option value="Bespoke Facials">Bespoke Facials</option>
                    <option value="Signature Massages">Signature Massages</option>
                    <option value="Classic & Grand Hammam">Classic &amp; Grand Hammam</option>
                  </select>
                </div>

                <div className="sm:pt-5">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 text-xs tracking-[0.14em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Complete Enrolment
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Gift Vouchers Section */}
        <section aria-labelledby="vouchers-heading" className="space-y-4">
          <h2
            id="vouchers-heading"
            className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold"
          >
            GIFT THE GIFT OF SORETI
          </h2>

          {/* Clean 3-Column Gift Voucher Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {VOUCHER_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const converted = formatCurrencyValue(tier.amountUsd, currency);
              return (
                <article
                  key={tier.id}
                  className={`soreti-card rounded-lg p-6 flex flex-col justify-between transition-all ${
                    isSelected ? 'ring-2 ring-[#4D2177] border-[#4D2177]' : ''
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] tracking-[0.24em] uppercase text-[#B78F2E] font-bold">
                      <span>{tier.label}</span>
                      {currency !== 'USD' && <span className="tabular-nums">{converted}</span>}
                    </div>

                    <div className="font-display text-4xl sm:text-[42px] leading-none font-bold text-[#4D2177]">
                      {tier.priceDisplay}
                    </div>

                    <p className="text-sm text-[#4D2177]/80 leading-relaxed pt-1">
                      {tier.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#B78F2E]/25">
                    <button
                      type="button"
                      onClick={() => handleSelectTier(tier.id)}
                      className={`w-full py-2.5 px-4 text-xs tracking-[0.15em] uppercase font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#B78F2E] text-[#FBF9F6]'
                          : 'bg-[#4D2177] text-[#FBF9F6] hover:bg-[#3B185C]'
                      }`}
                    >
                      {isSelected ? `Selected ${tier.priceDisplay}` : `Select ${tier.priceDisplay} Voucher`}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Inline One-Page Voucher Personalisation Form (Appears cleanly when a voucher is selected) */}
          {selectedTierId && (
            <form
              onSubmit={handleReserveSubmit}
              aria-label="Personalise Selected Gift Voucher"
              className="bg-[#FBF6EC] border border-[#4D2177]/40 rounded-lg p-6 space-y-4"
              noValidate
            >
              <div className="flex items-center justify-between border-b border-[#B78F2E]/30 pb-3">
                <div>
                  <span className="text-[10.5px] tracking-[0.22em] uppercase text-[#B78F2E] font-bold block">
                    PERSONALISE GIFT VOUCHER
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#4D2177]">
                    {activeTier.priceDisplay} — {activeTier.title} ({pricing.formattedTotal})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTierId(null)}
                  aria-label="Close voucher personalisation"
                  className="p-1.5 text-[#4D2177]/70 hover:text-[#4D2177] rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="voucher-recipient-name" className="block text-xs font-bold text-[#4D2177] mb-1">
                    Recipient Name *
                  </label>
                  <input
                    id="voucher-recipient-name"
                    type="text"
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);
                      if (voucherErrors.recipientName) setVoucherErrors({ ...voucherErrors, recipientName: '' });
                    }}
                    placeholder="e.g. Selamawit Tadesse"
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  />
                  {voucherErrors.recipientName && (
                    <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                      {voucherErrors.recipientName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="voucher-sender-name" className="block text-xs font-bold text-[#4D2177] mb-1">
                    From (Your Name) *
                  </label>
                  <input
                    id="voucher-sender-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => {
                      setSenderName(e.target.value);
                      if (voucherErrors.senderName) setVoucherErrors({ ...voucherErrors, senderName: '' });
                    }}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  />
                  {voucherErrors.senderName && (
                    <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                      {voucherErrors.senderName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="voucher-location" className="block text-xs font-bold text-[#4D2177] mb-1">
                    Sanctuary Reception
                  </label>
                  <select
                    id="voucher-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as SanctuaryLocation)}
                    className="w-full px-3 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="voucher-delivery" className="block text-xs font-bold text-[#4D2177] mb-1">
                    Delivery Option &amp; Qty
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="voucher-delivery"
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                      className="flex-1 px-2.5 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                    >
                      <option value="Physical Card">Physical Card</option>
                      <option value="Digital Delivery">Digital</option>
                    </select>
                    <input
                      id="voucher-quantity"
                      type="number"
                      min={1}
                      max={100}
                      aria-label="Voucher Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-16 px-2.5 py-2 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] tabular-nums focus:outline-none focus:border-[#4D2177]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  id="voucher-message"
                  type="text"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Optional personalised message for the recipient..."
                  aria-label="Personalised message"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs tracking-[0.16em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reserve Voucher · {pricing.formattedTotal}
                </button>
              </div>
            </form>
          )}

          {/* Confirmed Voucher Banner */}
          {confirmedVoucher && (
            <div
              role="status"
              className="bg-[#FBF6EC] border border-[#B78F2E] rounded-lg p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-0.5">
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#B78F2E] font-bold">
                  VOUCHER RESERVED · {confirmedVoucher.referenceCode}
                </p>
                <p className="text-sm text-[#4D2177]">
                  <strong>${confirmedVoucher.amountUsdEach} Gift Voucher</strong> for{' '}
                  <strong>{confirmedVoucher.recipientName}</strong> (From {confirmedVoucher.senderName}) ·{' '}
                  {confirmedVoucher.formattedTotal} · Collect at <strong>{confirmedVoucher.location}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedVoucher(null)}
                className="text-xs font-bold text-[#4D2177] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* Bottom Two-Column Section: Gift Voucher Terms & How to Purchase */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Gift Voucher Terms */}
          <div className="bg-[#FBF6EC] border border-[#B78F2E]/40 rounded-lg p-6 sm:p-7 space-y-2.5">
            <h2 className="font-display text-xl font-semibold text-[#4D2177]">
              Gift Voucher Terms
            </h2>
            <p className="text-xs sm:text-[13.5px] leading-[1.68] text-[#4D2177]/80">
              {VOUCHER_TERMS_ITEMS.map((item, idx) => (
                <React.Fragment key={item}>
                  <span>{item}</span>
                  {idx < VOUCHER_TERMS_ITEMS.length - 1 && (
                    <span aria-hidden="true"> · </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* How to Purchase */}
          <div className="bg-[#FBF6EC] border border-[#B78F2E]/40 rounded-lg p-6 sm:p-7 space-y-2.5">
            <h2 className="text-xs tracking-[0.26em] uppercase text-[#B78F2E] font-bold pt-1">
              HOW TO PURCHASE
            </h2>
            <p className="text-xs sm:text-[13.5px] leading-[1.68] text-[#4D2177]/80">
              {HOW_TO_PURCHASE_ITEMS.map((item, idx) => (
                <React.Fragment key={item}>
                  <span>{item}</span>
                  {idx < HOW_TO_PURCHASE_ITEMS.length - 1 && (
                    <span aria-hidden="true"> · </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
