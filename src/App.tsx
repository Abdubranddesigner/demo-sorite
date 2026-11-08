/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  VOUCHER_TIERS,
  VOUCHER_TERMS_ITEMS,
  HOW_TO_PURCHASE_ITEMS,
  PREVAILING_RATES,
  VoucherTier,
  CurrencyCode,
  VoucherReservationRecord,
  LoyaltyEnrolmentRecord,
  calculateBagSummary,
  calculateVoucherPricing,
  formatCurrencyValue,
} from './utils/vouchers';
import { SlideOverDrawer, DrawerMode } from './components/SlideOverDrawer';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('customize');
  const [selectedTierId, setSelectedTierId] = useState<VoucherTier['id']>('voucher-100');
  const [corporateBulk, setCorporateBulk] = useState<boolean>(false);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [bagItems, setBagItems] = useState<VoucherReservationRecord[]>([]);
  const [confirmedMasterRef, setConfirmedMasterRef] = useState<string | null>(null);
  const [loyaltyRecord, setLoyaltyRecord] = useState<LoyaltyEnrolmentRecord | null>(null);

  const bagSummary = calculateBagSummary(bagItems, currency);

  const openVoucherCustomizer = (tierId: VoucherTier['id'], isCorporate = false) => {
    setSelectedTierId(tierId);
    setCorporateBulk(isCorporate);
    setDrawerMode('customize');
    setDrawerOpen(true);
  };

  const openBagDrawer = () => {
    setDrawerMode(bagItems.length > 0 ? 'bag' : 'customize');
    setDrawerOpen(true);
  };

  const openLoyaltyDrawer = () => {
    setDrawerMode('loyalty');
    setDrawerOpen(true);
  };

  const handleAddBagItem = (item: VoucherReservationRecord) => {
    setConfirmedMasterRef(null);
    setBagItems((prev) => [item, ...prev]);
  };

  const handleUpdateBagItemQty = (id: string, newQty: number) => {
    setConfirmedMasterRef(null);
    setBagItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updatedPricing = calculateVoucherPricing(item.amountUsdEach, newQty, item.currency);
        return {
          ...item,
          quantity: newQty,
          subtotalUsd: updatedPricing.subtotalUsd,
          discountUsd: updatedPricing.discountUsd,
          totalUsd: updatedPricing.totalUsd,
          convertedTotal: updatedPricing.convertedTotal,
          formattedTotal: updatedPricing.formattedTotal,
        };
      })
    );
  };

  const handleRemoveBagItem = (id: string) => {
    setConfirmedMasterRef(null);
    setBagItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#4D2177] font-body flex flex-col">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FBF9F6]/95 backdrop-blur-sm border-b border-[#B78F2E]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 lg:px-10 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="font-display text-2xl font-bold tracking-tight text-[#4D2177] whitespace-nowrap shrink-0"
          >
            Soreti
          </a>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4D2177]/80"
          >
            <a
              href="#vouchers"
              className="hover:text-[#4D2177] hover:underline underline-offset-8 decoration-[#B78F2E] transition-colors whitespace-nowrap shrink-0"
            >
              Vouchers
            </a>
            <a
              href="#loyalty"
              className="hover:text-[#4D2177] hover:underline underline-offset-8 decoration-[#B78F2E] transition-colors whitespace-nowrap shrink-0"
            >
              Loyalty
            </a>
            <a
              href="#purchase"
              className="hover:text-[#4D2177] hover:underline underline-offset-8 decoration-[#B78F2E] transition-colors whitespace-nowrap shrink-0"
            >
              How to Purchase
            </a>
            <a
              href="#terms"
              className="hover:text-[#4D2177] hover:underline underline-offset-8 decoration-[#B78F2E] transition-colors whitespace-nowrap shrink-0"
            >
              Terms
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={openBagDrawer}
              className="px-4 py-2 text-xs tracking-[0.14em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {bagSummary.totalVouchersCount > 0
                ? `Reservation Bag (${bagSummary.totalVouchersCount})`
                : 'Reserve Voucher'}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-[#B78F2E]/25 bg-gradient-to-b from-[#FBF6EC] to-[#FBF9F6]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
            <div className="max-w-3xl space-y-5">
              <p className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold">
                LOYALTY &amp; GIFTING
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] font-semibold text-[#4D2177]"
                style={{ textWrap: 'balance' }}
              >
                Soreti Loyalty &amp; Gift Vouchers
              </h1>
              <p className="text-base sm:text-lg text-[#4D2177]/80 leading-relaxed max-w-2xl">
                Share the serenity of Soreti across our sanctuaries in Addis Ababa and Nairobi. Choose a bespoke spa voucher for treatments, Classic or Grand Hammam rituals, or join our elite Loyalty Programme.
              </p>

              {/* Hero Actions & Currency Selector */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openVoucherCustomizer('voucher-100', false)}
                  className="px-6 py-3 text-xs tracking-[0.16em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Personalise a Gift Voucher
                </button>
                <button
                  type="button"
                  onClick={openLoyaltyDrawer}
                  className="px-6 py-3 text-xs tracking-[0.16em] uppercase font-bold text-[#4D2177] bg-[#FBF6EC] border border-[#B78F2E] hover:bg-[#F4EBD6] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Enrol in Loyalty Programme
                </button>
              </div>
            </div>

            {/* Active Session Confirmation Banner (if user has reserved vouchers or enrolled) */}
            {(confirmedMasterRef || loyaltyRecord) && (
              <div
                aria-label="Active Sanctuary Confirmations"
                className="mt-10 p-5 bg-[#FBF6EC] border border-[#B78F2E] rounded-md flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-[#B78F2E] font-bold">
                    ACTIVE SANCTUARY CONFIRMATION
                  </p>
                  <p className="text-sm text-[#4D2177]">
                    {confirmedMasterRef && (
                      <span>
                        Voucher Bag Reference <strong>{confirmedMasterRef}</strong> ({bagSummary.totalVouchersCount}{' '}
                        voucher{bagSummary.totalVouchersCount === 1 ? '' : 's'} · {bagSummary.formattedTotal})
                      </span>
                    )}
                    {confirmedMasterRef && loyaltyRecord && <span aria-hidden="true"> · </span>}
                    {loyaltyRecord && (
                      <span>
                        Loyalty Membership <strong>{loyaltyRecord.membershipCode}</strong> ({loyaltyRecord.fullName})
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openBagDrawer}
                  className="text-xs tracking-[0.15em] uppercase font-bold text-[#4D2177] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Three-Column Gift Voucher Grid Section */}
        <section id="vouchers" className="py-16 lg:py-20 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold mb-2">
                GIFT THE GIFT OF SORETI
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#4D2177]"
                style={{ textWrap: 'balance' }}
              >
                Curated Sanctuary Gift Vouchers
              </h2>
            </div>

            {/* Interactive Display Currency Switcher */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs text-[#4D2177]/75 font-medium mr-1">Display Currency:</span>
              <div
                role="group"
                aria-label="Select display currency"
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

          {/* 3-Column Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {VOUCHER_TIERS.map((tier) => {
              const convertedDisplay = formatCurrencyValue(tier.amountUsd, currency);
              return (
                <article
                  key={tier.id}
                  className="soreti-card rounded-md p-7 lg:p-8 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs tracking-[0.24em] uppercase text-[#B78F2E] font-bold">
                      <span>{tier.label}</span>
                      <span className="tabular-nums">
                        {currency !== 'USD' ? convertedDisplay : 'USD'}
                      </span>
                    </div>

                    <div>
                      <div className="font-display text-4xl lg:text-5xl font-bold text-[#4D2177] tabular-nums">
                        {tier.priceDisplay}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#4D2177] mt-2">
                        {tier.title}
                      </h3>
                    </div>

                    <p className="text-sm text-[#4D2177]/80 leading-relaxed">
                      {tier.description}
                    </p>

                    {/* Clean Unboxed Metadata with Middot Separators */}
                    <div className="pt-4 border-t border-[#B78F2E]/30">
                      <p className="text-[11px] tracking-[0.18em] uppercase text-[#B78F2E] font-bold mb-2">
                        SIGNATURE EXPERIENCES COVERED
                      </p>
                      <p className="text-xs text-[#4D2177]/75 leading-relaxed">
                        {tier.recommendedTreatments.map((treatment, i) => (
                          <React.Fragment key={treatment}>
                            <span>{treatment}</span>
                            {i < tier.recommendedTreatments.length - 1 && (
                              <span aria-hidden="true"> · </span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="pt-7 mt-6 border-t border-[#B78F2E]/25">
                    <button
                      type="button"
                      onClick={() => openVoucherCustomizer(tier.id, false)}
                      className="w-full py-3 px-4 text-xs tracking-[0.16em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Select {tier.priceDisplay} Voucher
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Soreti Loyalty Programme Section */}
        <section id="loyalty" className="py-16 lg:py-20 bg-[#FBF6EC] border-y border-[#B78F2E]/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold">
                  ELITE SANCTUARY MEMBERSHIP
                </p>
                <h2
                  className="font-display text-3xl sm:text-4xl font-semibold text-[#4D2177]"
                  style={{ textWrap: 'balance' }}
                >
                  Soreti Loyalty Programme
                </h2>
                <p className="text-base text-[#4D2177]/85 leading-relaxed max-w-2xl">
                  Join our elite Soreti Loyalty Programme and enjoy exclusive discounts and offers. Whether a weekly visitor or occasional guest, unlock privileges like bespoke facials and signature massages. Ask at reception to enrol.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#4D2177]/75">
                  <span>Bespoke Facials</span>
                  <span aria-hidden="true">·</span>
                  <span>Signature Massages</span>
                  <span aria-hidden="true">·</span>
                  <span>Priority Sanctuary Booking</span>
                  <span aria-hidden="true">·</span>
                  <span>Addis Ababa &amp; Nairobi Access</span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#FBF9F6] border border-[#B78F2E]/45 rounded-md p-7 space-y-5">
                <div className="space-y-1.5">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-[#B78F2E] font-bold">
                    RECEPTION ENROLMENT
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[#4D2177]">
                    {loyaltyRecord
                      ? `Enrolled: ${loyaltyRecord.membershipCode}`
                      : 'Pre-Register Your Membership'}
                  </h3>
                  <p className="text-xs text-[#4D2177]/75 leading-relaxed">
                    {loyaltyRecord
                      ? `Registered for ${loyaltyRecord.fullName} (${loyaltyRecord.tierStatus}). Present this code at ${loyaltyRecord.homeLocation} reception.`
                      : 'Complete your guest profile online and activate your loyalty privileges on your next visit to any Soreti reception.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openLoyaltyDrawer}
                  className="w-full py-3 px-5 text-xs tracking-[0.16em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {loyaltyRecord ? 'View Loyalty Membership' : 'Enrol in Loyalty Programme'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* How to Purchase & Gift Voucher Terms Two-Column Section */}
        <section id="purchase" className="py-16 lg:py-20 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* How to Purchase Card */}
            <div className="soreti-card rounded-md p-7 lg:p-9 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold">
                  HOW TO PURCHASE
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4D2177]">
                  Sanctuary Reception &amp; Corporate Packages
                </h2>
                <p className="text-sm text-[#4D2177]/85 leading-relaxed">
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

              <div className="pt-4 border-t border-[#B78F2E]/30 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#4D2177]/75">
                  5+ vouchers save 5% · 10+ vouchers save 10%
                </span>
                <button
                  type="button"
                  onClick={() => openVoucherCustomizer('voucher-100', true)}
                  className="px-4 py-2.5 text-xs tracking-[0.15em] uppercase font-bold text-[#4D2177] border border-[#B78F2E] rounded-md hover:bg-[#FBF9F6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Configure Corporate Package
                </button>
              </div>
            </div>

            {/* Gift Voucher Terms Card */}
            <div
              id="terms"
              className="soreti-card rounded-md p-7 lg:p-9 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <p className="text-xs tracking-[0.28em] uppercase text-[#B78F2E] font-bold">
                  REDEMPTION POLICY
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#4D2177]">
                  Gift Voucher Terms
                </h2>
                <p className="text-sm text-[#4D2177]/85 leading-relaxed">
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

              <div className="pt-4 border-t border-[#B78F2E]/30 flex flex-wrap items-center justify-between gap-4 text-xs text-[#4D2177]/75">
                <span>Prevailing Rate: 1 USD = {PREVAILING_RATES.ETB.rate} ETB · {PREVAILING_RATES.KES.rate} KES</span>
                <span className="font-bold text-[#4D2177]">12-Month Validity</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimal Website Footer */}
      <footer className="bg-[#FBF6EC] border-t border-[#B78F2E]/30 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="font-display text-xl font-bold text-[#4D2177]">
              Soreti Wellness &amp; Spa Sanctuary
            </span>
            <p className="text-xs text-[#4D2177]/75">
              Addis Ababa (Bole &amp; Kazanchis) · Nairobi (Westlands) · Loyalty &amp; Gift Vouchers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#4D2177]/80">
            <a href="#vouchers" className="hover:text-[#4D2177] transition-colors">
              Gift Vouchers
            </a>
            <a href="#loyalty" className="hover:text-[#4D2177] transition-colors">
              Loyalty Programme
            </a>
            <a href="#purchase" className="hover:text-[#4D2177] transition-colors">
              How to Purchase
            </a>
            <a href="#terms" className="hover:text-[#4D2177] transition-colors">
              Voucher Terms
            </a>
          </div>
        </div>
      </footer>

      {/* Slide-Over Cart, Voucher Customizer & Loyalty Enrolment Drawer */}
      <SlideOverDrawer
        isOpen={drawerOpen}
        mode={drawerMode}
        onModeChange={setDrawerMode}
        selectedTierId={selectedTierId}
        onSelectTierId={setSelectedTierId}
        initialCorporateBulk={corporateBulk}
        currency={currency}
        onCurrencyChange={setCurrency}
        bagItems={bagItems}
        onAddBagItem={handleAddBagItem}
        onUpdateBagItemQty={handleUpdateBagItemQty}
        onRemoveBagItem={handleRemoveBagItem}
        onConfirmBagReservation={(ref) => setConfirmedMasterRef(ref)}
        confirmedMasterRef={confirmedMasterRef}
        loyaltyRecord={loyaltyRecord}
        onCompleteLoyalty={(record) => setLoyaltyRecord(record)}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
