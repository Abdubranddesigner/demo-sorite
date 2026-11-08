# Soreti Sanctuary — Loyalty & Gift Vouchers Website Redesign

Transform the static document-style voucher screen into a complete, airy luxury spa website with a clean and simple UI, anchored by the custom royal plum (`#4D2177`), warm gold (`#B78F2E`), champagne cream (`#FBF6EC`), and soft alabaster (`#FBF9F6`) palette.

## User Review & Critical Decisions

> [!IMPORTANT]
> Please review the confirmed layout and interaction choices below before we build the redesigned website.

- **Confirmed Decision 1 — Three-Column Gift Voucher Grid**: The `$50`, `$100`, and `$200` gift vouchers will be presented in a balanced three-column card grid on desktop (stacking cleanly on mobile/tablet) with uniform card proportions, included treatment highlights, and explicit **"Select Voucher"** buttons.
- **Confirmed Decision 2 — Slide-Over Cart & Customization Drawer**: Selecting any gift voucher, corporate package, or loyalty enrolment opens a smooth slide-over drawer from the right edge of the viewport with live voucher preview, personalization fields, currency conversion (`USD`, `ETB`, `KES`), and bag summary.
- **Recommended Default — Full Website Structure**: Includes a clean 3-zone top navigation header (`Soreti`, section navigation links, and a primary bag/voucher button), an editorial hero section, the 3-column Gift Vouchers showcase, a dedicated Soreti Loyalty Programme privilege section, a clean Terms & How to Purchase guide, and a minimalist sanctuary footer for Addis Ababa and Nairobi locations.

---

## 1. Overview & Core Concept

- **What It Does**: Provides guests and gift buyers with a serene, modern web storefront to explore Soreti's `$50`, `$100`, and `$200` spa gift vouchers, customize vouchers with recipient details and currency conversion, and enrol in the Soreti Loyalty Programme.
- **Target Audience / Persona**: Spa guests, gift shoppers, and corporate wellness buyers in Addis Ababa and Nairobi seeking a refined, effortless digital experience.
- **Key Value**: Elevates the original informational layout into an intuitive, full-featured website where every voucher tier, loyalty privilege, and purchase policy is easy to scan and act upon.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Browse & Compare Vouchers**: Visitors land on the hero banner and scroll directly to the 3-column Gift Voucher grid (`$50` Sanctuary Introduction, `$100` Classic Hammam & Massage, `$200` Grand Hammam & Retreat).
2. **Customize & Add to Bag (Slide-Over Drawer)**: Clicking **"Select Voucher"** on any card opens the slide-over drawer pre-loaded with that tier. Users can customize the recipient name, sender name, personal message, delivery format (Physical Card or Digital Delivery), reception location (Addis Ababa or Nairobi), quantity (with 5+ and 10+ corporate bulk discounts), and currency (`USD`, `ETB`, `KES`), then add it to their reservation bag.
3. **Loyalty Programme Enrolment**: In the dedicated Loyalty Programme section, clicking **"Enrol in Loyalty Programme"** opens the slide-over drawer in Loyalty mode so guests can pre-register their visit frequency and preferred spa privileges (`Bespoke Facials`, `Signature Massages`, `Classic & Grand Hammam`) for instant reception activation.
4. **Checkout & Reception Reference**: From the slide-over bag drawer, users confirm their reservation and receive an instant reception reference code ready to present at any Soreti location.

### Visual Identity & Theme
- **Aesthetic Direction**: Minimalist luxury wellness boutique—generous whitespace, crisp hairline borders, unboxed typographic metadata, and calm visual rhythm.
- **Color Palette & Mood**:
  - `--background` (`#FBF9F6`): Dominant 60% soft alabaster page canvas for an airy, restful feel.
  - `--surface` (`#FBF6EC`): 30% warm champagne cream for voucher cards, callout containers, and alternating section backdrops.
  - `--primary` (`#4D2177`): Deep royal plum for display headings, primary CTA buttons, prices, and high-contrast interactive states.
  - `--accent` (`#B78F2E`): Refined antique gold for section kickers, subtle hairline borders (`#B78F2E/35`), and active selection indicators.
- **Typography & Hierarchy**:
  - *Display Serif*: `Playfair Display` for hero headlines, section titles, and voucher denominations (`$50`, `$100`, `$200`) with `text-wrap: balance`.
  - *Body Sans*: `Lato` for crisp navigation links, descriptions, form controls, and terms copy, paired with `tabular-nums` on all calculated totals and currency rates.
- **Component Styling & Layout**:
  - **Top Bar Contract**: Single-row header with `Soreti` brand wordmark on the left, 4 concise single-line section links (`Vouchers`, `Loyalty`, `How to Purchase`, `Terms`) in the center, and 1 primary action button (`Your Bag (N)` / `Reserve Voucher`) on the right.
  - **3-Column Voucher Grid**: Three equal-height cards on `bg-[#FBF6EC]` with a `1px` gold border (`#B78F2E/40`), clear denomination header, concise description, unboxed treatment highlights separated by `·`, and a full-width primary/outline action button at the bottom.
- **Interactive Feedback & Motion**:
  - Subtle `150ms` card lift on hover and smooth `200ms` `transform`/`opacity` slide-in transition for the right-hand customization and bag drawer.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Slide-Over Drawer for Customization, Cart, and Loyalty**
  - *Chosen Approach*: A multi-mode right-hand slide-over drawer with tabs/views for **Customize Voucher**, **Reservation Bag**, and **Loyalty Enrolment**.
  - *Why*: Keeps the main website canvas clean and uncluttered while allowing visitors to configure multiple vouchers (e.g., a `$100` birthday voucher plus a `$50` voucher) in a single reservation session.
  - *Alternatives Considered*: Centered popup modals were passed over because a slide-over drawer feels native to modern luxury e-commerce websites and supports multi-item cart management.
- **Decision 2: Clean Unboxed Grid for Terms & How to Purchase**
  - *Chosen Approach*: Present *How to Purchase* and *Gift Voucher Terms* in a structured two-column editorial footer-prelude section on `#FBF6EC` with subtle gold hairline dividers instead of stacked heavy callout bars.
  - *Why*: Eliminates visual clutter and adheres to clean web editorial hierarchy while preserving every original term and purchase instruction verbatim.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        App State & Persistence                          │
│  • Cart / Reserved Vouchers List    • Active Drawer Mode & Selected Tier│
│  • Active Currency (USD / ETB / KES)• Loyalty Membership Pre-Enrolment  │
└──────────────────┬───────────────────────────────────┬──────────────────┘
                   │                                   │
                   ▼                                   ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│        Main Website Layout           │ │   Slide-Over Drawer System     │
│  ┌────────────────────────────────┐  │ │  ┌──────────────────────────┐  │
│  │ 3-Zone Top Navigation Header   │  │ │  │ Drawer Header & Mode Nav │  │
│  ├────────────────────────────────┤  │ │  ├──────────────────────────┤  │
│  │ Hero Banner & Currency Switch  │  │ │  │ Voucher Customizer Form  │  │
│  ├────────────────────────────────┤  │ │  │ & Live Card Preview      │  │
│  │ 3-Column Gift Voucher Grid     │  │ │  ├──────────────────────────┤  │
│  │ ($50 · $100 · $200 Cards)      │  │ │  │ Reservation Bag & Bulk   │  │
│  ├────────────────────────────────┤  │ │  │ Corporate Calculator     │  │
│  │ Soreti Loyalty Programme Split │  │ │  ├──────────────────────────┤  │
│  ├────────────────────────────────┤  │ │  │ Loyalty Enrolment View   │  │
│  │ How to Purchase & Terms Grid   │  │ │  └──────────────────────────┘  │
│  ├────────────────────────────────┤  │ └────────────────────────────────┘
│  │ Sanctuary Locations Footer     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Data Model & State
- **Voucher Tiers**: Static definitions for `$50`, `$100`, and `$200` preserving the exact core descriptions and recommended spa rituals.
- **Bag / Reservation Items**: Stores configured voucher items (tier, quantity, recipient name, sender name, personal message, delivery option, sanctuary reception location, and calculated subtotal/discount).
- **Currency & Pricing Engine**: Pure calculation logic supporting real-time toggling between `USD`, `ETB` (Addis Ababa), and `KES` (Nairobi) as well as automatic 5% (5+ vouchers) and 10% (10+ vouchers) corporate bulk discounts.

### Interactive Component & State Mapping
- **Top Bar Bag CTA**: Opens the slide-over drawer directly to the Reservation Bag (or Voucher Customizer if the bag is empty) and displays the live item count.
- **3-Column Voucher Cards**: Clicking **"Select $50 / $100 / $200 Voucher"** opens the slide-over drawer pre-populated with that tier for immediate personalization.
- **Loyalty Programme CTA**: Clicking **"Enrol in Loyalty Programme"** opens the slide-over drawer in Loyalty mode, validates guest contact details, and generates an active membership reference badge.
- **Checkout Confirmation**: Submitting the bag validates inputs, generates a reception reference code (`SRT-...`), and displays a printable/saveable confirmation summary inside the drawer.
