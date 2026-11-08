import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import {
  VOUCHER_TIERS,
  PREVAILING_RATES,
  VoucherTier,
  CurrencyCode,
  SanctuaryLocation,
  DeliveryMethod,
  VoucherReservationRecord,
  LoyaltyEnrolmentInput,
  LoyaltyEnrolmentRecord,
  calculateVoucherPricing,
  calculateBagSummary,
  formatCurrencyValue,
  validateVoucherReservation,
  validateLoyaltyEnrolment,
  formatExpiryDate12Months,
} from '../utils/vouchers';

export type DrawerMode = 'customize' | 'bag' | 'loyalty';

interface SlideOverDrawerProps {
  isOpen: boolean;
  mode: DrawerMode;
  onModeChange: (mode: DrawerMode) => void;
  selectedTierId: VoucherTier['id'];
  onSelectTierId: (tierId: VoucherTier['id']) => void;
  initialCorporateBulk?: boolean;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  bagItems: VoucherReservationRecord[];
  onAddBagItem: (item: VoucherReservationRecord) => void;
  onUpdateBagItemQty: (id: string, newQty: number) => void;
  onRemoveBagItem: (id: string) => void;
  onConfirmBagReservation: (masterReference: string) => void;
  confirmedMasterRef: string | null;
  loyaltyRecord: LoyaltyEnrolmentRecord | null;
  onCompleteLoyalty: (record: LoyaltyEnrolmentRecord) => void;
  onClose: () => void;
}

const LOCATIONS: SanctuaryLocation[] = [
  'Addis Ababa — Bole Sanctuary',
  'Addis Ababa — Kazanchis Spa',
  'Nairobi — Westlands Sanctuary',
];

export const SlideOverDrawer: React.FC<SlideOverDrawerProps> = ({
  isOpen,
  mode,
  onModeChange,
  selectedTierId,
  onSelectTierId,
  initialCorporateBulk = false,
  currency,
  onCurrencyChange,
  bagItems,
  onAddBagItem,
  onUpdateBagItemQty,
  onRemoveBagItem,
  onConfirmBagReservation,
  confirmedMasterRef,
  loyaltyRecord,
  onCompleteLoyalty,
  onClose,
}) => {
  // Voucher Customizer state
  const [quantity, setQuantity] = useState<number>(initialCorporateBulk ? 5 : 1);
  const [location, setLocation] = useState<SanctuaryLocation>('Addis Ababa — Bole Sanctuary');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('Physical Card');
  const [recipientName, setRecipientName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [personalMessage, setPersonalMessage] = useState<string>('');
  const [voucherErrors, setVoucherErrors] = useState<Record<string, string>>({});

  // Loyalty Enrolment state
  const [fullName, setFullName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [visitFrequency, setVisitFrequency] = useState<'Weekly Visitor' | 'Occasional Guest'>('Weekly Visitor');
  const [preferredPrivilege, setPreferredPrivilege] = useState<
    'Bespoke Facials' | 'Signature Massages' | 'Classic & Grand Hammam'
  >('Bespoke Facials');
  const [homeLocation, setHomeLocation] = useState<SanctuaryLocation>('Addis Ababa — Bole Sanctuary');
  const [loyaltyErrors, setLoyaltyErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && mode === 'customize') {
      setQuantity(initialCorporateBulk ? 5 : 1);
      setVoucherErrors({});
    }
  }, [isOpen, mode, initialCorporateBulk, selectedTierId]);

  if (!isOpen) return null;

  const selectedTier = VOUCHER_TIERS.find((t) => t.id === selectedTierId) || VOUCHER_TIERS[0];
  const pricing = calculateVoucherPricing(selectedTier.amountUsd, quantity, currency);
  const bagSummary = calculateBagSummary(bagItems, currency);
  const expiryDisplay = formatExpiryDate12Months();

  const handleAddVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateVoucherReservation({
      tierId: selectedTierId,
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

    const referenceCode = `SRT-${selectedTier.amountUsd}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: VoucherReservationRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tierId: selectedTierId,
      quantity,
      recipientName: recipientName.trim(),
      senderName: senderName.trim(),
      personalMessage: personalMessage.trim(),
      location,
      deliveryMethod,
      currency,
      referenceCode,
      amountUsdEach: selectedTier.amountUsd,
      subtotalUsd: pricing.subtotalUsd,
      discountUsd: pricing.discountUsd,
      totalUsd: pricing.totalUsd,
      convertedTotal: pricing.convertedTotal,
      formattedTotal: pricing.formattedTotal,
      expiryDateDisplay: expiryDisplay,
      createdAtIso: new Date().toISOString(),
    };

    onAddBagItem(newItem);
    setRecipientName('');
    setPersonalMessage('');
    setVoucherErrors({});
    onModeChange('bag');
  };

  const handleLoyaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: LoyaltyEnrolmentInput = {
      fullName,
      contactInfo,
      visitFrequency,
      preferredPrivilege,
      homeLocation,
    };

    const validationErrors = validateLoyaltyEnrolment(input);
    if (Object.keys(validationErrors).length > 0) {
      setLoyaltyErrors(validationErrors);
      return;
    }

    const membershipCode = `SLP-${Math.floor(10000 + Math.random() * 90000)}`;
    const record: LoyaltyEnrolmentRecord = {
      ...input,
      fullName: fullName.trim(),
      contactInfo: contactInfo.trim(),
      membershipCode,
      tierStatus: visitFrequency === 'Weekly Visitor' ? 'Elite Sanctuary Circle' : 'Sanctuary Privilege Guest',
      enrolledAtIso: new Date().toISOString(),
    };

    setLoyaltyErrors({});
    onCompleteLoyalty(record);
  };

  const handleConfirmBag = () => {
    if (bagItems.length === 0) return;
    const masterRef = `SRT-BAG-${Math.floor(10000 + Math.random() * 90000)}`;
    onConfirmBagReservation(masterRef);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#4D2177]/35 backdrop-blur-[2px] transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop click target */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-xl bg-[#FBF9F6] border-l border-[#B78F2E]/40 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Top Sticky Drawer Header */}
          <div className="sticky top-0 z-10 bg-[#FBF9F6]/95 backdrop-blur-sm border-b border-[#B78F2E]/30 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.24em] uppercase text-[#B78F2E] font-semibold">
                  SORETI SANCTUARY CONCIERGE
                </p>
                <h2 id="drawer-title" className="font-display text-2xl font-semibold text-[#4D2177] mt-0.5">
                  {mode === 'customize' && 'Personalise Gift Voucher'}
                  {mode === 'bag' && 'Your Reservation Bag'}
                  {mode === 'loyalty' && 'Loyalty Programme Enrolment'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close concierge drawer"
                className="p-2 text-[#4D2177]/70 hover:text-[#4D2177] hover:bg-[#FBF6EC] rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 mt-4 bg-[#FBF6EC] border border-[#B78F2E]/30 rounded-md">
              <button
                type="button"
                onClick={() => onModeChange('customize')}
                className={`px-3 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'customize'
                    ? 'bg-[#4D2177] text-[#FBF9F6]'
                    : 'text-[#4D2177]/80 hover:text-[#4D2177]'
                }`}
              >
                Customize Voucher
              </button>
              <button
                type="button"
                onClick={() => onModeChange('bag')}
                className={`px-3 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'bag'
                    ? 'bg-[#4D2177] text-[#FBF9F6]'
                    : 'text-[#4D2177]/80 hover:text-[#4D2177]'
                }`}
              >
                Bag ({bagSummary.totalVouchersCount})
              </button>
              <button
                type="button"
                onClick={() => onModeChange('loyalty')}
                className={`px-3 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'loyalty'
                    ? 'bg-[#4D2177] text-[#FBF9F6]'
                    : 'text-[#4D2177]/80 hover:text-[#4D2177]'
                }`}
              >
                Loyalty Enrol
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 flex-1">
            {mode === 'customize' && (
              <form onSubmit={handleAddVoucherSubmit} className="space-y-5" noValidate>
                {/* Tier Selection */}
                <div>
                  <label className="block text-xs tracking-[0.18em] uppercase text-[#B78F2E] font-bold mb-2">
                    1. Choose Voucher Tier
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {VOUCHER_TIERS.map((t) => {
                      const active = t.id === selectedTierId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onSelectTierId(t.id)}
                          className={`p-3.5 text-left rounded-md border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#FBF6EC] border-[#4D2177] ring-1 ring-[#4D2177]'
                              : 'bg-[#FBF9F6] border-[#B78F2E]/40 hover:border-[#B78F2E]'
                          }`}
                        >
                          <span className="block text-[10px] tracking-[0.2em] uppercase text-[#B78F2E] font-semibold">
                            VOUCHER
                          </span>
                          <span className="font-display text-2xl font-bold text-[#4D2177] block mt-0.5">
                            {t.priceDisplay}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Voucher Card Preview */}
                <div className="soreti-voucher-preview p-5 rounded-md space-y-2.5">
                  <div className="flex items-center justify-between text-[10.5px] tracking-[0.22em] uppercase text-[#B78F2E] font-semibold">
                    <span>SORETI GIFT VOUCHER · {deliveryMethod.toUpperCase()}</span>
                    <span>VALID 12 MONTHS</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <span className="font-display text-3xl font-bold text-[#4D2177]">
                        {selectedTier.priceDisplay}
                      </span>
                      <span className="text-xs text-[#4D2177]/75 ml-2">
                        {selectedTier.title}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#4D2177]/70 block">Total ({currency})</span>
                      <span className="font-display text-lg font-bold text-[#4D2177] tabular-nums">
                        {pricing.formattedTotal}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#4D2177]/80 leading-relaxed">
                    {selectedTier.description}
                  </p>
                  {(recipientName || senderName || personalMessage) && (
                    <div className="pt-2.5 border-t border-[#B78F2E]/30 text-xs text-[#4D2177] space-y-1">
                      <p>
                        <span className="text-[#4D2177]/65">To:</span>{' '}
                        <strong>{recipientName || 'Recipient'}</strong> ·{' '}
                        <span className="text-[#4D2177]/65">From:</span>{' '}
                        <strong>{senderName || 'Sender'}</strong>
                      </p>
                      {personalMessage && (
                        <p className="italic text-[#4D2177]/85">“{personalMessage}”</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Recipient & Sender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="voucher-recipient-name"
                      className="block text-xs font-bold text-[#4D2177] mb-1"
                    >
                      Recipient Name *
                    </label>
                    <input
                      id="voucher-recipient-name"
                      type="text"
                      value={recipientName}
                      onChange={(e) => {
                        setRecipientName(e.target.value);
                        if (voucherErrors.recipientName) {
                          setVoucherErrors({ ...voucherErrors, recipientName: '' });
                        }
                      }}
                      placeholder="e.g. Selamawit Tadesse"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                    />
                    {voucherErrors.recipientName && (
                      <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                        {voucherErrors.recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="voucher-sender-name"
                      className="block text-xs font-bold text-[#4D2177] mb-1"
                    >
                      From (Your Name or Company) *
                    </label>
                    <input
                      id="voucher-sender-name"
                      type="text"
                      value={senderName}
                      onChange={(e) => {
                        setSenderName(e.target.value);
                        if (voucherErrors.senderName) {
                          setVoucherErrors({ ...voucherErrors, senderName: '' });
                        }
                      }}
                      placeholder="e.g. Abebe Bikila"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                    />
                    {voucherErrors.senderName && (
                      <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                        {voucherErrors.senderName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quantity, Currency & Delivery */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="voucher-quantity"
                      className="block text-xs font-bold text-[#4D2177] mb-1"
                    >
                      Quantity {quantity >= 5 ? `(${pricing.discountRate * 100}% Bulk Off)` : ''}
                    </label>
                    <input
                      id="voucher-quantity"
                      type="number"
                      min={1}
                      max={100}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3.5 py-2 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] tabular-nums focus:outline-none focus:border-[#4D2177]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="voucher-currency"
                      className="block text-xs font-bold text-[#4D2177] mb-1"
                    >
                      Currency
                    </label>
                    <select
                      id="voucher-currency"
                      value={currency}
                      onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                    >
                      {(Object.keys(PREVAILING_RATES) as CurrencyCode[]).map((code) => (
                        <option key={code} value={code}>
                          {PREVAILING_RATES[code].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="voucher-delivery"
                      className="block text-xs font-bold text-[#4D2177] mb-1"
                    >
                      Format
                    </label>
                    <select
                      id="voucher-delivery"
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                    >
                      <option value="Physical Card">Physical Card</option>
                      <option value="Digital Delivery">Digital Delivery</option>
                    </select>
                  </div>
                </div>

                {/* Sanctuary Location */}
                <div>
                  <label
                    htmlFor="voucher-location"
                    className="block text-xs font-bold text-[#4D2177] mb-1"
                  >
                    Preferred Soreti Reception (Addis Ababa &amp; Nairobi)
                  </label>
                  <select
                    id="voucher-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as SanctuaryLocation)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personalised Message */}
                <div>
                  <label
                    htmlFor="voucher-message"
                    className="block text-xs font-bold text-[#4D2177] mb-1"
                  >
                    Personalised Message (Optional)
                  </label>
                  <textarea
                    id="voucher-message"
                    rows={2}
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a warm note for your recipient..."
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-5 text-xs tracking-[0.18em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors cursor-pointer"
                  >
                    Add Voucher to Bag · {pricing.formattedTotal}
                  </button>
                </div>
              </form>
            )}

            {mode === 'bag' && (
              <div className="space-y-6">
                {confirmedMasterRef && bagItems.length > 0 && (
                  <div className="p-5 bg-[#FBF6EC] border border-[#B78F2E] rounded-md space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#4D2177] text-[#FBF9F6] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] tracking-[0.2em] uppercase text-[#B78F2E] font-bold">
                          RESERVATION CONFIRMED · {confirmedMasterRef}
                        </p>
                        <h3 className="font-display text-lg font-bold text-[#4D2177]">
                          Ready for Reception Collection
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-[#4D2177]/80 leading-relaxed">
                      Present reference <strong>{confirmedMasterRef}</strong> at your selected Soreti reception in Addis Ababa or Nairobi. Currency conversion is processed at time of sale.
                    </p>
                  </div>
                )}

                {bagItems.length === 0 ? (
                  <div className="py-12 px-6 text-center bg-[#FBF6EC] border border-[#B78F2E]/30 rounded-md space-y-4">
                    <ShoppingBag className="w-8 h-8 text-[#B78F2E] mx-auto stroke-[1.5]" />
                    <div className="space-y-1">
                      <h3 className="font-display text-xl font-semibold text-[#4D2177]">
                        Your Reservation Bag is Empty
                      </h3>
                      <p className="text-sm text-[#4D2177]/75 max-w-sm mx-auto">
                        Select a $50, $100, or $200 gift voucher to personalise for a loved one or corporate occasion.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onModeChange('customize')}
                      className="px-5 py-2.5 text-xs tracking-[0.16em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors cursor-pointer"
                    >
                      Configure a Gift Voucher
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {bagItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-[#FBF6EC] border border-[#B78F2E]/40 rounded-md space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] tracking-[0.2em] uppercase text-[#B78F2E] font-bold">
                                GIFT VOUCHER · {item.referenceCode}
                              </span>
                              <h4 className="font-display text-xl font-bold text-[#4D2177]">
                                ${item.amountUsdEach} Voucher for {item.recipientName}
                              </h4>
                              <p className="text-xs text-[#4D2177]/75">
                                From {item.senderName} · {item.deliveryMethod} · {item.location}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveBagItem(item.id)}
                              aria-label={`Remove voucher for ${item.recipientName}`}
                              className="p-1.5 text-[#4D2177]/60 hover:text-[#9E2A2B] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {item.personalMessage && (
                            <p className="text-xs italic text-[#4D2177]/85 border-t border-[#B78F2E]/25 pt-2">
                              “{item.personalMessage}”
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-[#B78F2E]/25">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onUpdateBagItemQty(item.id, Math.max(1, item.quantity - 1))}
                                aria-label={`Decrease quantity for ${item.recipientName}`}
                                className="w-7 h-7 flex items-center justify-center rounded border border-[#B78F2E]/50 text-[#4D2177] hover:bg-white cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-[#4D2177] px-2 tabular-nums">
                                Qty: {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateBagItemQty(item.id, item.quantity + 1)}
                                aria-label={`Increase quantity for ${item.recipientName}`}
                                className="w-7 h-7 flex items-center justify-center rounded border border-[#B78F2E]/50 text-[#4D2177] hover:bg-white cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="font-display text-base font-bold text-[#4D2177] tabular-nums">
                              {formatCurrencyValue(item.totalUsd, currency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bag Totals Summary */}
                    <div className="p-5 bg-[#FBF6EC] border border-[#B78F2E]/45 rounded-md space-y-2 text-sm">
                      <div className="flex justify-between text-[#4D2177]/80">
                        <span>Total Vouchers</span>
                        <span className="font-bold tabular-nums">{bagSummary.totalVouchersCount}</span>
                      </div>
                      {bagSummary.discountUsd > 0 && (
                        <div className="flex justify-between text-[#B78F2E] font-semibold">
                          <span>Corporate Bulk Privilege Savings</span>
                          <span className="tabular-nums">
                            -{formatCurrencyValue(bagSummary.discountUsd, currency)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-2 border-t border-[#B78F2E]/30">
                        <span className="font-bold text-[#4D2177]">Estimated Total ({currency})</span>
                        <span className="font-display text-2xl font-bold text-[#4D2177] tabular-nums">
                          {bagSummary.formattedTotal}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => onModeChange('customize')}
                        className="flex-1 py-3 px-4 text-xs tracking-[0.14em] uppercase font-bold text-[#4D2177] border border-[#B78F2E] rounded-md hover:bg-[#FBF6EC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Add Another Voucher
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBag}
                        className="flex-1 py-3 px-4 text-xs tracking-[0.14em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Confirm Reservation
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {mode === 'loyalty' && (
              <div className="space-y-5">
                {loyaltyRecord ? (
                  <div className="p-6 bg-[#FBF6EC] border border-[#B78F2E] rounded-md space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4D2177] text-[#FBF9F6] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] tracking-[0.22em] uppercase text-[#B78F2E] font-bold">
                          MEMBERSHIP ID · {loyaltyRecord.membershipCode}
                        </p>
                        <h3 className="font-display text-xl font-bold text-[#4D2177]">
                          Welcome, {loyaltyRecord.fullName}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#4D2177]/85 leading-relaxed">
                      You are pre-enrolled in the <strong>{loyaltyRecord.tierStatus}</strong> with preferred privileges in <strong>{loyaltyRecord.preferredPrivilege}</strong>. Present your membership ID at <strong>{loyaltyRecord.homeLocation}</strong> reception to activate your card.
                    </p>
                    <button
                      type="button"
                      onClick={() => onModeChange('customize')}
                      className="w-full py-2.5 px-4 text-xs tracking-[0.16em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] rounded-md hover:bg-[#3B185C] transition-colors cursor-pointer"
                    >
                      Explore Gift Vouchers
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleLoyaltySubmit} className="space-y-4" noValidate>
                    <div className="p-4 bg-[#FBF6EC] border border-[#B78F2E]/35 rounded-md">
                      <p className="text-sm text-[#4D2177]/85 leading-relaxed">
                        Join our elite Soreti Loyalty Programme and enjoy exclusive discounts and offers. Whether a weekly visitor or occasional guest, unlock privileges like bespoke facials and signature massages.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="loyalty-full-name"
                        className="block text-xs font-bold text-[#4D2177] mb-1"
                      >
                        Full Name *
                      </label>
                      <input
                        id="loyalty-full-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (loyaltyErrors.fullName) setLoyaltyErrors({ ...loyaltyErrors, fullName: '' });
                        }}
                        placeholder="e.g. Liya Kebede"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                      />
                      {loyaltyErrors.fullName && (
                        <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                          {loyaltyErrors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="loyalty-contact"
                        className="block text-xs font-bold text-[#4D2177] mb-1"
                      >
                        Phone Number or Email *
                      </label>
                      <input
                        id="loyalty-contact"
                        type="text"
                        value={contactInfo}
                        onChange={(e) => {
                          setContactInfo(e.target.value);
                          if (loyaltyErrors.contactInfo) {
                            setLoyaltyErrors({ ...loyaltyErrors, contactInfo: '' });
                          }
                        }}
                        placeholder="e.g. +251 911 234 567 or guest@soreti.com"
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                      />
                      {loyaltyErrors.contactInfo && (
                        <p className="text-xs text-[#9E2A2B] mt-1" role="alert">
                          {loyaltyErrors.contactInfo}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="loyalty-frequency"
                          className="block text-xs font-bold text-[#4D2177] mb-1"
                        >
                          Visit Frequency
                        </label>
                        <select
                          id="loyalty-frequency"
                          value={visitFrequency}
                          onChange={(e) =>
                            setVisitFrequency(e.target.value as 'Weekly Visitor' | 'Occasional Guest')
                          }
                          className="w-full px-3 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                        >
                          <option value="Weekly Visitor">Weekly Visitor</option>
                          <option value="Occasional Guest">Occasional Guest</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="loyalty-privilege"
                          className="block text-xs font-bold text-[#4D2177] mb-1"
                        >
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
                          className="w-full px-3 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                        >
                          <option value="Bespoke Facials">Bespoke Facials</option>
                          <option value="Signature Massages">Signature Massages</option>
                          <option value="Classic & Grand Hammam">Classic &amp; Grand Hammam</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="loyalty-location"
                        className="block text-xs font-bold text-[#4D2177] mb-1"
                      >
                        Home Soreti Reception
                      </label>
                      <select
                        id="loyalty-location"
                        value={homeLocation}
                        onChange={(e) => setHomeLocation(e.target.value as SanctuaryLocation)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#B78F2E]/45 rounded-md text-[#4D2177] focus:outline-none focus:border-[#4D2177]"
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-5 text-xs tracking-[0.18em] uppercase font-bold text-[#FBF9F6] bg-[#4D2177] hover:bg-[#3B185C] rounded-md transition-colors cursor-pointer"
                      >
                        Complete Loyalty Pre-Enrolment
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 bg-[#FBF6EC] border-t border-[#B78F2E]/30 flex items-center justify-between text-xs text-[#4D2177]/75">
            <span>Addis Ababa · Nairobi Sanctuaries</span>
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-[#4D2177] hover:underline cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
